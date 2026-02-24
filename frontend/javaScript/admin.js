document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:3000";

    /* =========================================
       NEW: MOBILE SIDEBAR & TOGGLE LOGIC
    ========================================= */
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('overlay');

    if (hamburger && sidebar && overlay) {
        // Toggle menu when clicking the 3-line button
        hamburger.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        });

        // Close menu when clicking the dark overlay area
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });

        // Close menu when any navigation link is clicked (important for mobile)
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 1024) {
                    sidebar.classList.remove('active');
                    overlay.classList.remove('active');
                }
            });
        });
    }

    /* =========================================
       1. INITIAL AUTH CHECK
    ========================================= */
    const token = localStorage.getItem('access_token');
    if (!token) { window.location.href = "login.html"; return; }

    /* =========================================
       API & AUTH ENGINE
    ========================================= */
    async function apiCall(endpoint, method, body = null) {
        try {
            const res = await fetch(API_URL + endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('access_token')}`
                },
                body: body ? JSON.stringify(body) : null
            });

            if (res.status === 401) {
                localStorage.removeItem('access_token');
                window.location.href = "login.html";
                return null;
            }

            if (res.status === 204) return true;
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Operation failed");
            return data;
        } catch (err) {
            showToast(err.message, true);
            return null;
        }
    }

    /* =========================================
       DASHBOARD & PROFILE LOADER
    ========================================= */
    async function loadDashboardData() {
        const profile = await apiCall("/users/profile", "GET");
        if (profile) {
            document.getElementById("admin-fullname").textContent = `${profile.firstName} ${profile.lastName}`;
            document.getElementById("admin-greeting").textContent = profile.firstName;
            document.getElementById("admin-role-badge").textContent = profile.role;
            document.getElementById("nav-avatar").textContent = profile.firstName.charAt(0);
        }

        const [books, cats, librarians, students] = await Promise.all([
            apiCall("/books/get-all-books", "GET"),
            apiCall("/books/get-all-categories", "GET"),
            apiCall("/users/all-users/librarian", "GET"),
            apiCall("/users/all-users/student", "GET")
        ]);

        document.getElementById("stat-books").textContent = books ? books.length : 0;
        document.getElementById("stat-cats").textContent = cats ? cats.length : 0;
        document.getElementById("stat-librarians").textContent = librarians ? librarians.length : 0;
        document.getElementById("stat-students").textContent = students ? students.length : 0;
    }

    /* =========================================
       USER OPERATIONS
    ========================================= */
    // Create Librarian
    document.getElementById("createForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
            firstName: document.getElementById("c-fname").value,
            lastName: document.getElementById("c-lname").value,
            email: document.getElementById("c-email").value,
            username: document.getElementById("c-user").value,
            password: document.getElementById("c-pass").value
        };
        if (await apiCall("/users/register-librarian", "POST", payload)) {
            showToast("Success: Librarian added to system!");
            e.target.reset();
        }
    });

    // Update Librarian
    document.getElementById("updateForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = document.getElementById("u-id").value.trim();
        const payload = {};
        const fname = document.getElementById("u-fname").value;
        const lname = document.getElementById("u-lname").value;
        const email = document.getElementById("u-email").value;

        if (fname) payload.firstName = fname;
        if (lname) payload.lastName = lname;
        if (email) payload.email = email;

        if (Object.keys(payload).length === 0) return showToast("Nothing to update", true);

        if (await apiCall(`/users/update-librarian/${id}`, "PUT", payload)) {
            showToast("Success: User profile updated!");
            e.target.reset();
        }
    });

    // Delete User
    document.getElementById("btn-delete-confirm")?.addEventListener("click", async () => {
        const id = document.getElementById("d-id").value.trim();
        if (!id) return showToast("Enter an ID first", true);
        if (confirm("Are you sure? This is permanent.")) {
            if (await apiCall(`/users/delete-user/${id}`, "DELETE")) {
                showToast("User deleted successfully");
                document.getElementById("d-id").value = "";
            }
        }
    });

    // Directory Filter
    document.getElementById("btn-fetch-role")?.addEventListener("click", async () => {
        const role = document.getElementById("role-select").value;
        const container = document.getElementById("role-results");
        container.innerHTML = "Searching...";
        const users = await apiCall(`/users/all-users/${role}`, "GET");
        if (users) {
            container.innerHTML = users.map(u => `
                <div style="padding:15px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
                    <div><strong>${u.firstName} ${u.lastName}</strong><br><small>${u.email}</small></div>
                    <button class="btn-primary" style="padding:5px 10px; font-size:10px" onclick="copyToClipboard('${u.id || u._id}')">Copy ID</button>
                </div>
            `).join('');
        }
    });

    /* =========================================
       VIEW MANAGEMENT & LOGOUT
    ========================================= */
    function switchView(id) {
        document.querySelectorAll(".view-section").forEach(s => s.classList.remove("active"));
        document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
        document.getElementById(id).classList.add("active");
        
        const navLink = document.querySelector(`[data-view="${id}"]`);
        if (navLink) navLink.classList.add("active");
        
        document.getElementById("bread-current").textContent = id.replace("-view", "").toUpperCase();

        if (id === 'dashboard') loadDashboardData();
        if (id === 'books-view') loadBooks();
        if (id === 'categories-view') loadCategories();
    }

    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", (e) => { 
            e.preventDefault(); 
            switchView(link.dataset.view); 
        });
    });

    document.getElementById("btn-logout")?.addEventListener("click", () => {
        localStorage.removeItem('access_token');
        window.location.href = "login.html";
    });

    window.copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showToast("ID copied to clipboard!");
    };

    /* =========================================
       RESOURCE LOADERS
    ========================================= */
    async function loadBooks() {
        const books = await apiCall("/books/get-all-books", "GET");
        const container = document.getElementById("books-results");
        container.innerHTML = books ? books.map(b => `
            <div class="card" style="margin:0;">
                <h4 style="margin-bottom:5px;">${b.title}</h4>
                <p style="font-size:12px; color:var(--primary);">Author: ${b.author}</p>
                <small style="display:block; margin-top:10px;">Type: ${b.filetype}</small>
            </div>
        `).join('') : "No books available.";
    }

    async function loadCategories() {
        const cats = await apiCall("/books/get-all-categories", "GET");
        const container = document.getElementById("categories-results");
        container.innerHTML = cats ? cats.map(c => `
            <div class="card" style="margin:0;">
                <h4 style="color:var(--primary);">${c.name}</h4>
                <p style="font-size:13px;">${c.description}</p>
            </div>
        `).join('') : "No categories found.";
    }

    // Initialize
    loadDashboardData();
});

function showToast(msg, isError = false) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.style.background = isError ? "var(--danger)" : "var(--success)";
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 3000);
}
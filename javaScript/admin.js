document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:3000";

    // Selectors
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll(".view-section");
    const bread = document.getElementById("bread-current");
    const sidebar = document.getElementById("sidebar");
    const hamburger = document.getElementById("hamburger");
    const overlay = document.getElementById("overlay");

    /* =========================
       1. VIEW SWITCHING
    ========================= */
    function switchView(id) {
        sections.forEach(sec => sec.classList.remove("active"));
        navLinks.forEach(link => link.classList.remove("active"));

        const targetSection = document.getElementById(id);
        const activeLink = document.querySelector(`[data-view="${id}"]`);

        if (targetSection) {
            targetSection.classList.add("active");
            if (activeLink) {
                activeLink.classList.add("active");
                bread.textContent = activeLink.textContent;
            }
        }
        sidebar.classList.remove("open");
        overlay.classList.remove("active");
    }

    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            switchView(link.dataset.view);
        });
    });

    hamburger.addEventListener("click", () => {
        sidebar.classList.toggle("open");
        overlay.classList.toggle("active");
    });

    overlay.addEventListener("click", () => {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");
    });

    /* =========================
       2. API ENGINE
    ========================= */
    async function apiCall(endpoint, method, body = null) {
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(API_URL + endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: body ? JSON.stringify(body) : null
            });

            if (res.status === 204) return true;
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Request failed");
            return data;
        } catch (err) {
            showToast(err.message, true);
            return null;
        }
    }

    /* =========================
       3. FETCH BY ROLE
    ========================= */
    document.getElementById("btn-fetch-role")?.addEventListener("click", async () => {
        const role = document.getElementById("role-select").value;
        const container = document.getElementById("role-results");
        
        container.innerHTML = "<p>Loading users...</p>";

        const users = await apiCall(`/users/all-users/${role}`, "GET");

        if (users && users.length > 0) {
            container.innerHTML = "";
            users.forEach(user => {
                const div = document.createElement("div");
                div.style.cssText = "padding:12px; border-bottom:1px solid #eee; display:flex; justify-content:space-between;";
                div.innerHTML = `
                    <div><strong>${user.firstName} ${user.lastName}</strong><br><small>${user.email}</small></div>
                    <code style="font-size:10px; background:#f4f4f4; padding:2px 5px;">${user.id}</code>
                `;
                container.appendChild(div);
            });
        } else {
            container.innerHTML = `<p style="color:red;">No users found for ${role}</p>`;
        }
    });

    /* =========================
       4. OTHER ACTIONS
    ========================= */
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
            showToast("User created successfully!");
            e.target.reset();
        }
    });

    document.getElementById("deleteForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = document.getElementById("d-id").value;
        if (confirm("Delete this user permanently?")) {
            if (await apiCall(`/users/delete-user/${id}`, "DELETE")) {
                showToast("User deleted.");
                e.target.reset();
            }
        }
    });
});

function showToast(msg, isError = false) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.style.background = isError ? "var(--danger)" : "var(--success)";
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 3000);
}
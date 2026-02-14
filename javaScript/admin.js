document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:3000";

    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll(".view-section");
    const bread = document.getElementById("bread-current");

    const sidebar = document.getElementById("sidebar");
    const hamburger = document.getElementById("hamburger");
    const overlay = document.getElementById("overlay");

    /* =========================
       VIEW SWITCHING
    ========================= */
    function switchView(id) {
        sections.forEach(sec => sec.classList.remove("active"));
        navLinks.forEach(link => link.classList.remove("active"));

        const section = document.getElementById(id);
        const link = document.querySelector(`[data-view="${id}"]`);

        if (section) section.classList.add("active");
        if (link) link.classList.add("active");
        if (bread && link) bread.textContent = link.textContent.trim();

        // Auto close sidebar on mobile
        sidebar?.classList.remove("open");
        overlay?.classList.remove("active");
    }

    navLinks.forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            switchView(link.dataset.view);
        });
    });

    /* =========================
       HAMBURGER MENU
    ========================= */
    hamburger?.addEventListener("click", () => {
        sidebar?.classList.toggle("open");
        overlay?.classList.toggle("active");
    });

    overlay?.addEventListener("click", () => {
        sidebar?.classList.remove("open");
        overlay?.classList.remove("active");
    });

    /* =========================
       API CALL ENGINE
    ========================= */
    async function apiCall(endpoint, method, body = null) {
        const token = localStorage.getItem('access_token'); // Get your login token
        
        try {
            const res = await fetch(API_URL + endpoint, {
                method,
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` // Added missing header
                },
                body: body ? JSON.stringify(body) : null
            });

            if (res.status === 204) return true;

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Error");

            return data;
        } catch (err) {
            showToast(err.message, true);
            return null;
        }
    }

    /* =========================
       CREATE USER
    ========================= */
    document.getElementById("createForm")?.addEventListener("submit", async e => {
        e.preventDefault();
        const payload = {
            firstName: document.getElementById("c-fname").value,
            lastName: document.getElementById("c-lname").value,
            email: document.getElementById("c-email").value,
            username: document.getElementById("c-user").value,
            password: document.getElementById("c-pass").value
        };

        if (await apiCall("/users/register-librarian", "POST", payload)) {
            showToast("Created successfully");
            e.target.reset();
        }
    });

    /* =========================
       UPDATE USER
    ========================= */
    document.getElementById("updateForm")?.addEventListener("submit", async e => {
        e.preventDefault();
        const id = document.getElementById("u-id").value;
        const payload = {};
        const fname = document.getElementById("u-fname").value;
        const lname = document.getElementById("u-lname").value;
        const email = document.getElementById("u-email").value;

        if (fname) payload.firstName = fname;
        if (lname) payload.lastName = lname;
        if (email) payload.email = email;

        if (Object.keys(payload).length === 0) {
            showToast("Enter at least one field", true);
            return;
        }

        if (await apiCall(`/users/update-librarian/${id}`, "PUT", payload)) {
            showToast("Updated successfully");
            e.target.reset();
        }
    });

    /* =========================
       DELETE USER
    ========================= */
    document.getElementById("deleteForm")?.addEventListener("submit", async e => {
        e.preventDefault();
        const id = document.getElementById("d-id").value.trim();
        if (!id) return showToast("User ID required", true);

        if (!confirm("Are you sure you want to delete this user?")) return;

        if (await apiCall(`/users/delete-user/${id}`, "DELETE")) {
            showToast("Deleted successfully");
            e.target.reset();
        }
    });
});

function showToast(msg, error = false) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.style.background = error ? "#ef4444" : "#10b981";
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 3000);
}``
/**
 * 1. LOGO & INITIALIZATION
 * Forces the browser to reload the logo video to prevent caching issues.
 */
window.onload = () => {
    const logo = document.querySelector('.nav-logo');
    // Adding ?v= + timestamp forces the browser to download the NEW version
    logo.src = "/uploads/system/logo.mp4?v=" + new Date().getTime();
}

/**
 * 2. MAIN INTERACTION ENGINE
 * Handles Mobile Menu, User Profile Fetching, and Dropdown Toggles.
 */
document.addEventListener('DOMContentLoaded', async () => {
    
    // --- Selectors ---
    const menuBtn = document.getElementById('mobile-menu');
    const links = document.getElementById('nav-links');
    const trigger = document.getElementById('user-menu-trigger');
    const dropdown = document.getElementById('profile-dropdown');
    const modal = document.getElementById('profile-modal');
    const logoutBtn = document.getElementById('logout-btn');
    
    // --- Profile Display Selectors ---
    const nameDisplay = document.getElementById('user-full-name');
    const roleDisplay = document.getElementById('user-role-badge');
    const avatarDisplay = document.getElementById('user-initials');

    /**
     * MOBILE MENU LOGIC
     * Toggles the hamburger animation and vertical link list.
     */
    if (menuBtn && links) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('open');
            links.classList.toggle('nav-active');
        });
    }

    /**
     * FETCH USER PROFILE
     * Loads user data from backend and populates the navbar avatar/name.
     */
    try {
        const response = await fetch('http://localhost:3000/users/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            nameDisplay.textContent = `${data.firstName} ${data.lastName}`;
            roleDisplay.textContent = data.role;
            
            // Generate initials for avatar circle
            const initials = data.firstName.charAt(0) + data.lastName.charAt(0);
            avatarDisplay.textContent = initials.toUpperCase();
        } else {
            // Unauthenticated - kick to login
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error("Profile Fetch Error:", error);
    }

    /**
     * USER DROPDOWN TOGGLE
     * Opens/Closes the small menu under the avatar.
     */
    if (trigger) {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });
    }

    // Close dropdown if user clicks anywhere else on the screen
    window.addEventListener('click', () => {
        if (dropdown) dropdown.classList.remove('show');
    });

    /**
     * LOGOUT LOGIC
     * Clears backend session and local storage.
     */
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            logoutBtn.textContent = "Logging out...";
            
            try {
                await fetch('http://localhost:3000/users/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
            } catch (error) {
                console.error("Logout request failed", error);
            } finally {
                localStorage.removeItem('token');
                sessionStorage.clear();
                window.location.href = 'login.html';
            }
        });
    }
});

/**
 * 3. UPDATE PROFILE MODAL FUNCTIONS
 * These are global functions used by the "Update Profile" button in the dropdown.
 */

// Prefill and Open Modal
async function openUpdateModal() {
    const modal = document.getElementById('profile-modal');
    const dropdown = document.getElementById('profile-dropdown');
    
    dropdown.classList.remove('show'); // Hide menu
    modal.style.display = 'block';     // Show modal
    
    try {
        const res = await fetch('http://localhost:3000/users/profile', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const user = await res.json();
        
        // Fill form fields
        document.getElementById('edit-firstName').value = user.firstName;
        document.getElementById('edit-lastName').value = user.lastName;
        document.getElementById('edit-username').value = user.username;
        document.getElementById('edit-email').value = user.email || '';
    } catch (err) {
        console.error("Could not load current user data for update", err);
    }
}
// Close Modal
function closeUpdateModal() {
    document.getElementById('profile-modal').style.display = 'none';
}
/**
 * 4. PROFILE UPDATE FORM SUBMISSION
 */
document.addEventListener('DOMContentLoaded', () => {
    const updateForm = document.getElementById('update-profile-form');
    const statusMsg = document.getElementById('update-status-msg');
    if (updateForm) {
        updateForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            statusMsg.textContent = "Processing...";
            statusMsg.style.color = "white";
            const updateData = {
                firstName: document.getElementById('edit-firstName').value,
                lastName: document.getElementById('edit-lastName').value,
                username: document.getElementById('edit-username').value,
                email: document.getElementById('edit-email').value
            };
            try {
                const response = await fetch('http://localhost:3000/users/update-profile', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(updateData)
                });
                const result = await response.json();
                if (response.ok) {
                    statusMsg.style.color = "#2ecc71"; // Success Green
                    statusMsg.textContent = "Profile updated!";
                    
                    // Update the UI immediately
                    document.getElementById('user-full-name').textContent = `${result.firstName} ${result.lastName}`;
                    
                    // Close modal after short delay
                    setTimeout(() => closeUpdateModal(), 1500);
                } else {
                    statusMsg.style.color = "#e74c3c"; // Error Red
                    statusMsg.textContent = result.message || "Error updating profile.";
                }
            } catch (err) {
                statusMsg.textContent = "Server connection error.";
            }
        });
    }
});
document.addEventListener('mousemove', (e) => {
    const book = document.querySelector('.lib-main-book');
    if (!book) return;

    // Calculate mouse position relative to center
    const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
    const yAxis = (window.innerHeight / 2 - e.pageY) / 25;

    // Apply rotation based on mouse movement
    book.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
});
// Reset position when mouse leaves
document.addEventListener('mouseleave', () => {
    const book = document.querySelector('.lib-main-book');
    if (book) {
        book.style.transform = `rotateY(0deg) rotateX(0deg)`;
    }
});

async function findTopSix() {
    const grid = document.getElementById('book-grid');
    const API_BASE = "http://localhost:3000"; // Update this to your backend URL

    try {
        const response = await fetch(`${API_BASE}/books/getAllBooks`);
        const books = await response.json();

        grid.innerHTML = books.slice(0, 6).map(book => {
            // Fix path if it starts with extra slashes or needs the BASE URL
            const finalImgPath = book.coverPath.startsWith('http') 
                ? book.coverPath 
                : `${API_BASE}${book.coverPath.startsWith('/') ? '' : '/'}${book.coverPath}`;

            return `
                <article class="book-card">
                    <div class="book-cover-wrapper">
                        <img src="${finalImgPath}" alt="${book.title}" class="book-cover">
                    </div>
                    
                    <div class="book-details">
                        <span class="category-tag">${book.category}</span>
                        <h3 class="book-title">${book.title}</h3>
                        <p class="book-author">by ${book.author}</p>
                        <p class="book-description">${book.description}</p>
                    </div>

                    <div class="book-footer">
                        <a href="${book.readUrl}" class="btn btn-read">Read Online</a>
                        <a href="${book.downloadUrl}" class="btn btn-download">Download</a>
                    </div>
                </article>
            `;
        }).join('');

    } catch (error) {
        console.error("Error loading library data:", error);
        grid.innerHTML = `<p style="text-align:center; padding:20px;">Library is currently offline.</p>`;
    }
}

findTopSix();
//!search section script

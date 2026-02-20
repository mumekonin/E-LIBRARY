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
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
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
                localStorage.removeItem('access_token');
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
//
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
document.addEventListener('mouseleave',() => {
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
const searchInput = document.getElementById('lib-search-input');
const resultsWrapper = document.getElementById('results-wrapper');
const searchGrid = document.getElementById('search-grid');
const clearLink = document.getElementById('clear-search-link');

// 1. Function to Omit/Hide Results
function hideResults() {
    resultsWrapper.classList.remove('results-visible');
    resultsWrapper.classList.add('results-hidden');
    searchGrid.innerHTML = "";
}

// 2. Listen for Input (Handles "Omit on Delete")
searchInput.addEventListener('input', (e) => {
    if (e.target.value.trim() === "") {
        hideResults();
    }
});

// 3. Perform Search
async function performSearch() {
    const key = searchInput.value.trim();
    if (!key) return;

    try {
        const response = await fetch(`http://localhost:3000/books/search-books?key=${key}`);
        const books = await response.json();

        // Show Results Wrapper regardless of count to show the feedback
        resultsWrapper.classList.remove('results-hidden');
        resultsWrapper.classList.add('results-visible');

        if (books.length > 0) {
            // Success: Map books to the grid
            searchGrid.innerHTML = books.map(book => `
                <article class="book-card">
                    <div class="book-cover-wrapper">
                         <img src="http://localhost:3000${book.coverPath}" class="book-cover" alt="${book.title}">
                    </div>
                    <div class="book-details">
                        <span class="category-tag">${book.category}</span>
                        <h3 class="book-title">${book.title}</h3>
                        <p class="book-description">${book.description}</p>
                    </div>
                    <div class="book-footer">
                        <a href="${book.readUrl}" class="btn btn-read">Read Online</a>
                        <a href="${book.downloadUrl}" class="btn btn-download">Download</a>
                    </div>
                </article>
            `).join('');
        } else {
            // "Book not found" logic
            searchGrid.innerHTML = `
                <div class="no-results-box">
                    <p class="no-results-text">No books found for "${key}"</p>
                    <span class="no-results-subtext">Try checking your spelling or use different keywords.</span>
                </div>
            `;
        }
    } catch (err) {
        console.error("Connection failed");
        searchGrid.innerHTML = `<p class="error-text">Server error. Please try again later.</p>`;
    }
}

// 4. Buttons
document.getElementById('lib-search-btn').addEventListener('click', performSearch);

// Allow pressing "Enter" to search
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});

clearLink.addEventListener('click', () => {
    searchInput.value = "";
    hideResults();
});


document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('subject-display-grid');
    
    // Vibrant palette matching the Ethiopian Curriculum UI
    const subjectColors = ['#ff7e67', '#4caf50', '#29b6f6', '#9575cd', '#ffb300', '#f57c00'];

    async function loadAllCategories() {
        try {
            const response = await fetch('http://localhost:3000/books/get-all-categories');
            const categories = await response.json();

            if (categories && categories.length > 0) {
                grid.innerHTML = categories.map((cat, index) => `
                    <div class="subject-card" style="background-color: ${subjectColors[index % subjectColors.length]}">
                        <div class="card-top">
                            <h3>${cat.name}</h3>
                            <p>${cat.description}</p>
                        </div>
                        <button class="explore-btn">Tap to Explore ></button>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error("API Error:", error);
            grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center;">Could not load categories at this time.</p>`;
        }
    }

    loadAllCategories();
});
//search and borrow
/**
 * NEXUS DIGITAL LIBRARY - FINAL INTEGRATED SCRIPT
 * Fixes: CastError (undefined ID) & Synchronization with Login
 */

const searchField = document.getElementById('searchInput');
const resultsDisplay = document.getElementById('resultsWrapper');
const borrowModal = document.getElementById('borrowModal');
const confirmBtn = document.getElementById('confirmBorrowBtn');

// --- 1. SEARCH SYSTEM ---

// Instant Omit: Clear results immediately when input is empty
searchField.addEventListener('input', (e) => {
    if (e.target.value.trim() === "") {
        resultsDisplay.innerHTML = ""; 
    }
});

searchField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performNexusSearch(searchField.value);
});

document.getElementById('searchBtn').addEventListener('click', () => {
    performNexusSearch(searchField.value);
});

async function performNexusSearch(key) {
    if (!key || !key.trim()) return;

    // Matches your login script's localStorage key
    const token = localStorage.getItem('access_token'); 

    if (!token) {
        resultsDisplay.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:#fc8181; padding:20px; border:1px solid #fc8181; border-radius:10px;">Session Expired. Please Login.</p>`;
        return;
    }

    resultsDisplay.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: #12a7c3;">Scanning Nexus Archives...</p>';

    try {
        const response = await fetch(`http://localhost:3000/book-catalog/search-books?key=${encodeURIComponent(key)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        
        // DEBUG: Check your console (F12) to see if the ID is '_id' or 'id'
        console.log("Search Results Data:", data);

        if (!response.ok || data.length === 0) throw new Error(data.message || 'No assets found.');

        renderLibraryCards(data);
    } catch (error) {
        resultsDisplay.innerHTML = `<div style="grid-column: 1/-1; text-align:center; color:#fc8181; padding:20px; border:1px dashed #fc8181; border-radius:10px;">${error.message}</div>`;
    }
}

/**
 * FIX: Using book._id to prevent "undefined" CastError
 */
function renderLibraryCards(books) {
    resultsDisplay.innerHTML = '';
    
    books.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        
        // Escape titles to handle names like "O'Reilly Guide"
        const safeTitle = book.title.replace(/'/g, "\\'");
        
        // MongoDB uses _id. If your backend uses id, change this to book.id
        const bookId = book._id || book.id; 

        card.innerHTML = `
            <h3>${book.title}</h3>
            <p style="opacity:0.6; font-size:0.95rem; margin-bottom:15px; font-style: italic;">By ${book.author}</p>
            <p style="opacity:0.6; font-size:0.95rem; margin-bottom:15px; font-style: italic;">By ${book.category}</p>
            <p style="opacity:0.6; font-size:0.95rem; margin-bottom:15px; font-style: italic;">By ${book.section}</p>
            <p style="opacity:0.6; font-size:0.95rem; margin-bottom:15px; font-style: italic;">By ${book.floorNumber}</p>
            <div class="meta-row"><span class="meta-label">Shelf</span><span>${book.shelfNumber}</span></div>
            <div class="meta-row"><span class="meta-label">Status</span><span>${book.availableCopies} available</span></div>
            
            <button onclick="openBorrowModal('${bookId}', '${safeTitle}')" class="borrow-btn">
                Request Access
            </button>
        `;
        resultsDisplay.appendChild(card);
    });
}

// --- 2. BORROW TRANSACTION SYSTEM ---

function openBorrowModal(bookId, bookTitle) {
    // This is where 'undefined' was getting passed. 
    // If bookId is undefined here, the modal will fail.
    if (!bookId || bookId === 'undefined') {
        alert("Error: Book ID is missing. Please refresh search.");
        return;
    }

    document.getElementById('selectedBookId').value = bookId;
    document.getElementById('modalBookTitle').innerText = bookTitle;
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('returnDate').min = tomorrow.toISOString().split('T')[0];
    
    borrowModal.style.display = 'flex';
}

function closeModal() {
    borrowModal.style.display = 'none';
}

confirmBtn.addEventListener('click', async () => {
    const bookId = document.getElementById('selectedBookId').value;
    const dateInput = document.getElementById('returnDate').value;
    const token = localStorage.getItem('access_token');

    if (!dateInput) {
        alert("Please select a return date.");
        return;
    }

    confirmBtn.innerText = "Processing...";
    confirmBtn.disabled = true;

    try {
        const response = await fetch(`http://localhost:3000/book-catalog/borrow-book/${bookId}`, {
            method: 'POST', 
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                returnDate: new Date(dateInput).toISOString() 
            })
        });

        const result = await response.json();

        if (response.ok) {
            alert(`✅ Success: ${result.message}`);
            closeModal();
            performNexusSearch(searchField.value); // Refresh available copies
        } else {
            alert(`❌ Request Denied: ${result.message}`);
        }
    } catch (error) {
        alert("Critical Error: Unable to communicate with Nexus server.");
    } finally {
        confirmBtn.innerText = "Confirm Request";
        confirmBtn.disabled = false;
    }
});

///////////////////////
// Global Configuration
const API_BASE_URL = 'http://localhost:3000/book-catalog';

/**
 * 1. GET AUTH TOKEN
 * Uses 'access_token' to match your Login Script
 */
function getValidToken() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        handleAuthFailure("Session missing. Redirecting to login...");
        return null;
    }
    return token;
}

/**
 * 2. FETCH ACTIVE LOANS
 */
async function loadRegistry() {
    const token = getValidToken();
    if (!token) return;

    const loader = document.getElementById('loan-loader');
    const tbody = document.getElementById('loan-list-body');

    try {
        const response = await fetch(`${API_BASE_URL}/my-active-loans`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // If backend says token is expired or invalid
        if (response.status === 401) {
            handleAuthFailure("Session expired. Please log in again.");
            return;
        }

        if (!response.ok) throw new Error('Failed to synchronize with server.');

        const loans = await response.json();
        renderRegistryTable(loans);

    } catch (error) {
        console.error("Registry Error:", error);
        showAlert(error.message, "red");
    } finally {
        if (loader) loader.style.display = 'none';
    }
}

/**
 * 3. RENDER TABLE ROWS
 */
function renderRegistryTable(loans) {
    const tbody = document.getElementById('loan-list-body');
    const countBadge = document.getElementById('loan-count');
    
    if (!tbody) return;

    // Update count UI
    if (countBadge) countBadge.innerText = `${loans.length} Active`;

    if (!loans || loans.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center; padding: 3rem; color: #94a3b8;">
                    <div style="font-size: 2rem; margin-bottom: 10px;">📚</div>
                    <p>No active loans found in your registry.</p>
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = loans.map(loan => `
     <tr id="row-${loan._id}" class="registry-row">
            <td>
                <span class="book-title-bold">${loan.bookCatalogId?.title || 'Unknown Title'}</span>
            </td>
            <td>${loan.bookCatalogId?.author || 'N/A'}</td>
            <td><span class="status-badge">Active Borrow</span></td>
            <td class="text-right">
                <button class="btn-return" onclick="processReturn('${loan._id}')">
                    Return Item
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * 4. PROCESS RETURN ACTION
 */
async function processReturn(borrowId) {
    const token = getValidToken();
    if (!token) return;

    if (!confirm("Confirm the return of this item?")) return;

    const row = document.getElementById(`row-${borrowId}`);
    const btn = row.querySelector('.btn-return');
    
    // UI Loading State
    btn.disabled = true;
    btn.innerText = "Syncing...";
    row.style.opacity = "0.6";

    try {
        const response = await fetch(`${API_BASE_URL}/return-book/${borrowId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            showAlert("Success: Item returned to library.", "green");
            // Animated removal
            row.style.transition = "all 0.4s ease";
            row.style.transform = "translateX(20px)";
            row.style.opacity = "0";
            
            setTimeout(() => {
                row.remove();
                updateCount();
            }, 400);
        } else {
            const errData = await response.json();
            throw new Error(errData.message || "Return failed.");
        }
    } catch (error) {
        showAlert(error.message, "red");
        btn.disabled = false;
        btn.innerText = "Return Item";
        row.style.opacity = "1";
    }
}

/**
 * 5. SEARCH / FILTERING LOGIC
 */
function filterLoans() {
    const query = document.getElementById('loanSearch').value.toLowerCase();
    const rows = document.querySelectorAll('.registry-row');

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(query) ? "" : "none";
    });
}

/**
 * 6. UTILITIES
 */
function showAlert(message, type) {
    const alertBox = document.getElementById('loan-status-alert');
    if (!alertBox) return;

    alertBox.style.display = 'block';
    alertBox.style.backgroundColor = type === 'red' ? '#fee2e2' : '#dcfce7';
    alertBox.style.color = type === 'red' ? '#991b1b' : '#166534';
    alertBox.innerText = message;
    
    setTimeout(() => { alertBox.style.display = 'none'; }, 4000);
}

function handleAuthFailure(msg) {
    localStorage.removeItem('access_token');
    showAlert(msg, "red");
    setTimeout(() => { window.location.href = 'index.html'; }, 2000);
}

function updateCount() {
    const remaining = document.querySelectorAll('.registry-row').length;
    const countBadge = document.getElementById('loan-count');
    if (countBadge) countBadge.innerText = `${remaining} Active`;
    if (remaining === 0) renderRegistryTable([]);
}

// Initialization
document.addEventListener('DOMContentLoaded', loadRegistry);




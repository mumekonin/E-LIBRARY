window.onload = () => {
    const logo = document.querySelector('.nav-logo');
    // Adding ?v= + timestamp forces the browser to download the NEW version
    logo.src = "/uploads/system/logo.mp4?v=" + new Date().getTime();
}
document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');

    // Toggle the menu visibility
    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');

        // Simple visual feedback: lower the bars' opacity when menu is open
        menuBtn.style.opacity = navLinks.classList.contains('active') ? '0.6' : '1';
    });

    // Close the menu automatically when a link is clicked
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuBtn.style.opacity = '1';
        });
    });
});
const BACKEND_URL = "http://localhost:3000";

async function loadWelcomeVideo() {
    try {
        const response = await fetch(`${BACKEND_URL}/settings`);
        const settings = await response.json();

        if (settings && settings.welcomeVideoUrl) {
            const videoEl = document.getElementById('welcome-bg');

            // Apply the path from the database
            videoEl.src = `${BACKEND_URL}${settings.welcomeVideoUrl}`;

            // Load and play
            videoEl.load();
            videoEl.play().catch(() => {
                console.log("Autoplay blocked: Browser requires user interaction.");
            });
        }
    } catch (error) {
        console.error("Failed to load welcome settings:", error);
    }
}

// Start once the DOM is ready
document.addEventListener('DOMContentLoaded', loadWelcomeVideo);
//!BROWSE BOOK
const API_URL = 'http://localhost:3000/books/getAllBooks';

// Example: replace this with your real login check
const isLoggedIn = !!localStorage.getItem('authToken'); // or true/false from backend

function redirectToLogin() {
    alert('Please login to read or download this book.');
    window.location.href = '/login';
}

async function loadFeaturedBooks() {
    const grid = document.getElementById('book-grid');

    try {
        const response = await fetch(API_URL);
        const books = await response.json();

        grid.innerHTML = ''; // Clear existing content
        const featured = books.slice(0, 6); // First 6 books

        featured.forEach(book => {
            // Construct the image URL
            const imageUrl = book.coverPath
                ? `http://localhost:3000${book.coverPath}`
                : '/assets/no-cover.png';

            const cardHTML = `
                <div class="book-card">
                    <div class="book-cover-wrapper">
                        <img 
                            src="${imageUrl}"
                            alt="${book.title}"
                            class="book-cover"
                            onerror="this.onerror=null; this.src='/assets/no-cover.png';"
                        >
                        <span class="category-tag">${book.category}</span>
                    </div>

                    <div class="book-info">
                        <h3>${book.title}</h3>
                        <p class="author">By ${book.author}</p>
                        <p>${book.description.substring(0, 300)}...</p>

                      <div class="book-actions">
                            <button 
                                class="btn read-btn"
                                onclick="${isLoggedIn 
                                    ? `window.location.href='http://localhost:3000/books/read/${book._id}'` 
                                    : `redirectToLogin()`}">
                                Read
                            </button>
                            <button 
                                class="btn download-btn"
                                onclick="${isLoggedIn 
                                    ? `window.location.href='http://localhost:3000/books/download/${book._id}'` 
                                    : `redirectToLogin()`}" >
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            `;
            grid.insertAdjacentHTML('beforeend', cardHTML);
        });
    } catch (error) {
        grid.innerHTML = '<p style="color:red;">Server connection failed.</p>';
        console.error('Error:', error);
    }
}

// Call the function to load books
loadFeaturedBooks();

function redirectToLogin() {
    alert("Please login to read or download this book.");
    window.location.href = "/login";
}
/**
 * Checks for login token. 
 * If exists, opens file. If not, sends to login.
 */
function gatekeeper(url) {
    const token = localStorage.getItem('token');

    if (!token) {
        alert("🔒 Access Restricted: Please log in to read or download books.");
        window.location.href = 'login.html';
    } else {
        // Logged in: Proceed to the dynamic Backend URL
        window.open(url, '_blank');
    }
}
document.addEventListener('DOMContentLoaded', loadFeaturedBooks);

//search
   const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('bookSearch');
    const resultsContainer = document.getElementById('results-container');
    let debounceTimer;

    // The function that hits your NestJS backend
    async function performSearch() {
        const key = searchInput.value.trim();
        
        if (!key) {
            resultsContainer.innerHTML = '';
            resultsContainer.classList.remove('results-display-area');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/books/search-books?key=${encodeURIComponent(key)}`);
            
            if (!response.ok) throw new Error('No books found matching that key.');

            const books = await response.json();
            renderBooks(books);
        } catch (err) {
            resultsContainer.innerHTML = `<p style="color:white; text-align:center; padding:20px; grid-column:1/-1;">${err.message}</p>`;
            resultsContainer.classList.add('results-display-area');
        }
    }

    // Live search as user types
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(performSearch, 400);
    });

    // Search when button clicked or Enter pressed
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        performSearch();
    });

    function renderBooks(books) {
        resultsContainer.classList.add('results-display-area');
        
        resultsContainer.innerHTML = books.map(book => `
            <div class="academic-book-card">
                <div>
                    <h3 class="book-card-title">${book.title}</h3>
                    <p class="book-card-author">By ${book.author}</p>
                </div>
                <div class="book-card-btns">
                    <a href="${book.readUrl}" class="btn-read-now" target="_blank">READ</a>
                    <a href="${book.downloadUrl}" class="btn-download-now">DOWNLOAD</a>
                </div>
            </div>
        `).join('');
        } 
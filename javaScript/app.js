
 window.onload = () => {
  const logo = document.querySelector('.nav-logo');
  // Adding ?v= + timestamp forces the browser to download the NEW version
  logo.src = "/uploads/system/logo.mp4?v=" + new Date().getTime();}

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

async function loadFeaturedBooks() {
    const grid = document.getElementById('book-grid');
    
    try {
        const response = await fetch(API_URL);
        const books = await response.json(); // Array of BookResponse objects

        grid.innerHTML = ''; // Remove loader

        // Force only 6 books for the landing page
        const featured = books.slice(0, 6);

featured.forEach(book => {
    // Construct the full URL for the image
    const imageUrl = `http://localhost:3000${book.coverPath}`;
    const cardHTML = `
        <div class="book-card">
            <div class="book-cover-wrapper">
                <img src="${imageUrl}" alt="${book.title}" class="book-cover">
                <span class="category-tag">${book.category}</span>
            </div>
            
            <div class="book-info">
                <h3>${book.title}</h3>
                <p>${book.description.substring(0, 60)}...</p>
            </div>
            
            <div class="card-actions">
                <button onclick="gatekeeper('${book.readUrl}')" class="btn read-btn">Read</button>
                <button onclick="gatekeeper('${book.downloadUrl}')" class="btn down-btn">Download</button>
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
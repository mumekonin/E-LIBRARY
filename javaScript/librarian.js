/* --- LIBRIDASH PRO: CORE ENGINE --- */
const API_URL = "http://localhost:3000";

// Helper for Auth
const getHeaders = (multi = false) => {
    const token = localStorage.getItem('access_token');
    const h = { 'Authorization': `Bearer ${token}` };
    if (!multi) h['Content-Type'] = 'application/json';
    return h;
};

document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('access_token')) window.location.href = "index.html";
    
    // Tab Navigation Logic
    document.querySelectorAll('.menu-item[data-view]').forEach(item => {
        item.onclick = (e) => {
            e.preventDefault();
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
            document.querySelectorAll('.content-view').forEach(v => v.classList.remove('active'));
            
            item.classList.add('active');
            document.getElementById(`view-${item.dataset.view}`).classList.add('active');
        };
    });

    // Initial Load
    getProfile();
    getAllBooks();
    loadCategories();
});

// --- #10: PROFILE ---
async function getProfile() {
    const res = await fetch(`${API_URL}/users/profile`, { headers: getHeaders() });
    const user = await res.json();
    
    document.getElementById('nav-user-fullname').innerText = user.fullname;
    document.getElementById('nav-avatar').innerText = user.fullname[0];
    document.getElementById('welcome-name').innerText = user.fullname.split(' ')[0];
    
    // Detailed Profile View
    document.getElementById('p-fullname').innerText = user.fullname;
    document.getElementById('p-email').innerText = user.email || 'No email provided';
    document.getElementById('p-username').innerText = `@${user.username}`;
    document.getElementById('p-avatar-large').innerText = user.fullname[0];
}

// --- #1: UPLOAD BOOK (Multipart) ---
document.getElementById('uploadBookForm').onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const res = await fetch(`${API_URL}/books/Upload-book`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
        body: fd
    });
    if (res.ok) { closeModal('uploadModal'); getAllBooks(); }
};

// --- #2: GET ALL BOOKS ---
async function getAllBooks() {
    const res = await fetch(`${API_URL}/books/get-all-books`, { headers: getHeaders() });
    const books = await res.json();
    
    document.getElementById('count-books').innerText = books.length;
    const table = document.getElementById('bookTableBody');
    
    table.innerHTML = books.map(book => `
        <tr>
            <td><code style="background:#eee; padding:2px 5px; border-radius:4px;">${book.id.slice(-6)}</code></td>
            <td><img src="${API_URL}${book.coverPath}" class="cover-img" onerror="this.src='https://placehold.co/50x70'"></td>
            <td>
                <div class="book-details">
                    <h4>${book.title}</h4>
                    <p>${book.author}</p>
                </div>
            </td>
            <td><span class="badge" style="background:#eef2ff; color:#6366f1; padding:5px 10px; border-radius:20px; font-size:0.7rem; font-weight:700;">${book.category}</span></td>
            <td><button class="btn-refresh" onclick="getBookDetail('${book.id}')"><i class="fas fa-ellipsis-v"></i></button></td>
        </tr>
    `).join('');
}

// --- #3: GET BOOK DETAIL ---
async function getBookDetail(id) {
    const res = await fetch(`${API_URL}/books/get-book-detail/${id}`, { headers: getHeaders() });
    const book = await res.json();
    
    document.getElementById('editBookId').value = book.id;
    document.getElementById('editTitle').value = book.title;
    document.getElementById('editAuthor').value = book.author;
    document.getElementById('editDescription').value = book.description;
    openModal('editModal');
}

// --- #4: UPDATE BOOK ---
document.getElementById('updateBookForm').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('editBookId').value;
    const fd = new FormData();
    fd.append('title', document.getElementById('editTitle').value);
    fd.append('author', document.getElementById('editAuthor').value);
    fd.append('description', document.getElementById('editDescription').value);
    
    const file = document.getElementById('editFile').files[0];
    if (file) fd.append('book', file);

    const res = await fetch(`${API_URL}/books/update-book/${id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
        body: fd
    });
    if (res.ok) { closeModal('editModal'); getAllBooks(); }
};

// --- #6: DELETE BOOK BY ID ---
document.getElementById('deleteBtn').onclick = async () => {
    const bookId = document.getElementById('editBookId').value;
    
    if (!bookId) return alert("Invalid Book ID");
    
    if (confirm(`Are you sure you want to delete book ID: ${bookId}?`)) {
        const res = await fetch(`${API_URL}/books/delete-book/${bookId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        
        if (res.ok) {
            alert("Book deleted successfully.");
            closeModal('editModal');
            getAllBooks();
        } else {
            alert("Failed to delete book.");
        }
    }
};

// --- #7 & #8: CATEGORIES ---
document.getElementById('categoryForm').onsubmit = async (e) => {
    e.preventDefault();
    const body = { name: document.getElementById('catName').value, description: document.getElementById('catDesc').value };
    await fetch(`${API_URL}/books/Create-category`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) });
    closeModal('categoryModal'); loadCategories();
};

async function loadCategories() {
    const res = await fetch(`${API_URL}/books/get-all-categories`, { headers: getHeaders() });
    const cats = await res.json();
    document.getElementById('count-cats').innerText = cats.length;
    
    const select = document.getElementById('categorySelect');
    if (select) select.innerHTML = cats.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
}

// --- #9: CATALOG ---
document.getElementById('catalogForm').onsubmit = async (e) => {
    e.preventDefault();
    const body = { name: document.getElementById('catalogName').value, description: document.getElementById('catalogDesc').value };
    await fetch(`${API_URL}/book-catalog/create-catalog`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) });
    alert("Catalog Generated"); closeModal('catalogModal');
};

// Utils
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function logout() { localStorage.clear(); window.location.href = "index.html"; }

// Global Search
document.getElementById('globalSearch').oninput = (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('#bookTableBody tr').forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(term) ? '' : 'none';
    });
};
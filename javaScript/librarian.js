const API_BASE_URL = "http://localhost:3000";
const TOKEN_KEY = 'access_token';

/**
 * AUTHORIZED FETCH HELPER
 * Fixed to handle both JSON and FormData (Files) correctly.
 */
async function authorizedFetch(endpoint, options = {}) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
        window.location.href = "login.html";
        return null;
    }

    const headers = {
        'Authorization': `Bearer ${token}`
    };

    // If we are NOT sending FormData, default to JSON
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                ...headers,
                ...options.headers
            }
        });

        if (response.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            alert("Session expired. Please login again.");
            window.location.href = "login.html";
            return null;
        }
        return response;
    } catch (error) {
        console.error("Fetch error:", error);
        return null;
    }
}

async function fetchLibrarianProfile() {
    const response = await authorizedFetch('/users/profile');
    if (response && response.ok) {
        const user = await response.json();
        document.querySelector('.librarian-name').textContent = `${user.firstName} ${user.lastName}`;
        document.getElementById('welcome-name').textContent = user.firstName;
        document.getElementById('prof-username').textContent = user.username;
        document.getElementById('prof-firstname').textContent = user.firstName;
        document.getElementById('prof-lastname').textContent = user.lastName;
        document.getElementById('prof-role').textContent = user.role.toUpperCase();
    }
}
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', function(e) { 
            const targetId = this.getAttribute('href').substring(1);  
            showSection(targetId);
            if (targetId === 'view-categories-section') {
                fetchAllCategories();
            }
        });
    });

    showSection('dashboard-home');
});

// --- 3. Your Functions (Keep these outside the listener) ---
function showSection(sectionId) {
    const sections = ['dashboard-home', 'profile-section', 'upload-section', 'books-section','category-section','view-categories-section'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = (id === sectionId) ? 'block' : 'none';
    });
}

async function fetchAllCategories() {
    // ... the rest of your fetch code
}

function showSection(sectionId) {
    const sections = ['dashboard-home', 'profile-section', 'upload-section', 'books-section','category-section','view-categories-section','catalog-section'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = (id === sectionId) ? 'block' : 'none';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem(TOKEN_KEY)) {
        window.location.href = "login.html";
        return;
    }

    fetchLibrarianProfile();

    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const profileTrigger = document.getElementById('profileTrigger');
    const profileDropdown = document.getElementById('profileDropdown');
    const uploadForm = document.getElementById('uploadBookForm');
    const updateForm = document.getElementById('updateBookForm'); // Added

    hamburger.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    });

    profileTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
    });

    window.addEventListener('click', () => profileDropdown.classList.remove('show'));

    document.querySelectorAll('.nav-item, .dropdown-menu a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                showSection(targetId);

                if (targetId === 'books-section') {
                    fetchAllBooks();
                }

                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                if (link.classList.contains('nav-item')) {
                    link.classList.add('active');
                }
            }

            if (link.classList.contains('logout-btn')) {
                e.preventDefault();
                localStorage.removeItem(TOKEN_KEY);
                window.location.href = "login.html";
            }
        });
    });

    if (uploadForm) uploadForm.addEventListener('submit', processUpload);
    if (updateForm) updateForm.addEventListener('submit', handleUpdateSubmit);
});

async function processUpload(event) {
    event.preventDefault();
    const feedback = document.getElementById('uploadFeedback');
    const btn = document.getElementById('uploadBtn');
    const token = localStorage.getItem(TOKEN_KEY);

    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('author', document.getElementById('author').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('category', document.getElementById('category').value);
    formData.append('book', document.getElementById('bookFile').files[0]);
    const cover = document.getElementById('coverFile').files[0];
    if (cover) formData.append('cover', cover);

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';

    try {
        const response = await fetch(`${API_BASE_URL}/books/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (response.ok) {
            feedback.innerHTML = `<div class="status-success">✨ Book uploaded successfully!</div>`;
            event.target.reset();
        } else {
            const err = await response.json();
            throw new Error(err.message || "Failed to upload");
        }
    } catch (error) {
        feedback.innerHTML = `<div class="status-error">❌ Error: ${error.message}</div>`;
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Publish Book';
    }
}

async function fetchAllBooks() {
    const tableBody = document.getElementById('booksTableBody');
    const loader = document.getElementById('tableLoader');

    if (!tableBody) return;
    tableBody.innerHTML = '';
    if (loader) loader.style.display = 'block';

    try {
        const response = await authorizedFetch('/books/get-all-books');
        const books = await response.json();
        if (loader) loader.style.display = 'none';

        if (!books || books.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">No books found.</td></tr>';
            return;
        }

        books.forEach(book => {
            const rawType = book.fileType || book.filetype || 'application/pdf';
            const format = rawType.split('/')[1].toUpperCase();

            const row = `
                <tr id="row-${book.id}">
                    <td><strong class="title-cell">${book.title}</strong></td>
                    <td class="author-cell">${book.author}</td>
                    <td>${book.category}</td>
                    <td><span class="format-badge">${format}</span></td>
                    <td>${book.description}</td>
                    <td>${new Date(book.createdAt).toLocaleDateString()}</td>
                    <td class="action-btns">
                        <button class="btn-icon btn-edit" onclick="openEditPanel('${book.id}', this)">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteBook('${book.id}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>`;
            tableBody.insertAdjacentHTML('beforeend', row);
        });
    } catch (error) {
        if (loader) loader.style.display = 'none';
        tableBody.innerHTML = `<tr><td colspan="6" style="color:red; text-align:center;">${error.message}</td></tr>`;
    }
}

async function deleteBook(bookId) {
    if (!confirm("Are you sure you want to delete this book?")) return;
    try {
        const response = await authorizedFetch(`/books/delete-book/${bookId}`, { method: 'DELETE' });
        if (response && response.ok) {
            const row = document.getElementById(`row-${bookId}`);
            if (row) row.remove();
            alert("Deleted successfully");
        }
    } catch (error) {
        alert("Delete failed: " + error.message);
    }
}

// UPDATE LOGIC
function openEditPanel(bookId, btnElement) {
    const row = btnElement.closest('tr');
    
    // Fill basic fields from the table
    document.getElementById('updateBookId').value = bookId;
    document.getElementById('display-update-id').innerText = bookId;
    document.getElementById('updateTitle').value = row.querySelector('.title-cell').innerText;
    document.getElementById('updateAuthor').value = row.querySelector('.author-cell').innerText;
    
    // Fill Category based on the text in the table
    const currentCategory = row.cells[2].innerText; // 3rd column
    document.getElementById('updateCategory').value = currentCategory;

    // Note: If description isn't in the table, you might need to fetch it 
    // or just leave it blank for the user to overwrite.
    
    document.getElementById('edit-book-panel').style.display = 'block';
    document.getElementById('edit-book-panel').scrollIntoView({ behavior: 'smooth' });
}
function hideEditPanel() {
    document.getElementById('edit-book-panel').style.display = 'none';
    document.getElementById('updateBookForm').reset();
}

async function handleUpdateSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('updateBookId').value;
    const formData = new FormData();
    
    const file = document.getElementById('updateFile').files[0];
    const title = document.getElementById('updateTitle').value;
    const author = document.getElementById('updateAuthor').value;
    const category = document.getElementById('updateCategory').value;
    const description = document.getElementById('updateDescription').value;

    // Append all fields
    if (file) formData.append('file', file);
    if (title) formData.append('title', title);
    if (author) formData.append('author', author);
    if (category) formData.append('category', category);
    if (description) formData.append('description', description);

    const response = await authorizedFetch(`/books/update-book/${id}`, {
        method: 'PUT',
        body: formData
    });

    if (response && response.ok) {
        alert("Book updated successfully!");
        hideEditPanel();
        fetchAllBooks(); // Refresh table
    } else {
        const err = await response.json();
        alert("Error: " + err.message);
    }
}

// CREATE CATEGORY FUNCTION
document.getElementById('createCategoryForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('catName').value;
    const description = document.getElementById('catDesc').value;
    const feedback = document.getElementById('categoryFeedback');
    const btn = document.getElementById('catBtn');

    // Reset feedback
    feedback.className = 'feedback-msg';
    feedback.style.display = 'none';

    // Disable button during request
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    try {
        const response = await authorizedFetch('/books/Create-category', { // Update this to your exact endpoint
            method: 'POST',
            body: JSON.stringify({ name, description })
        });

        const result = await response.json();

        if (response.ok) {
            feedback.innerHTML = `✨ Category "${result.name}" created successfully!`;
            feedback.classList.add('status-success');
            feedback.style.display = 'block';
            e.target.reset(); // Clear form
        } else {
            throw new Error(result.message || "Failed to create category");
        }
    } catch (error) {
        feedback.innerHTML = ` Error: ${error.message}`;
        feedback.classList.add('status-error');
        feedback.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-plus"></i> Create Category';
    }
});
/*
 * FETCH ALL CATEGORIES
 */
async function fetchAllCategories() {
    const tableBody = document.getElementById('categoriesTableBody');
    const loader = document.getElementById('categoryLoader');

    if (!tableBody) return;

    tableBody.innerHTML = ''; 
    if (loader) loader.style.display = 'block';

    try {
        const response = await authorizedFetch('/books/get-all-categories');
        
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || "Failed to load categories");
        }

        const categories = await response.json();
        if (loader) loader.style.display = 'none';

        // Check if categories is empty
        if (categories.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No categories found.</td></tr>';
            return;
        }

        categories.forEach(cat => {
            // FIX: Added closing </td> and the delete button logic
            const row = `
                <tr id="cat-row-${cat.id}">
                    <td><strong>${cat.name}</strong></td>
                    <td>${cat.description || '<span class="text-muted">No description</span>'}</td>
                    <td style="text-align: right;">
                        <button class="btn-delete" onclick="deleteCategory('${cat.id}')" style="color:red; border:none; background:none; cursor:pointer;">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>`;
            tableBody.insertAdjacentHTML('beforeend', row);
        });
    } catch (error) {
        if (loader) loader.style.display = 'none';
        tableBody.innerHTML = `<tr><td colspan="3" class="error-msg" style="color:red; text-align:center;">${error.message}</td></tr>`;
    }
}
const catalogForm = document.getElementById('createCatalogForm');
if (catalogForm) {
    catalogForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = document.getElementById('catalogBtn');
        const feedback = document.getElementById('catalogFeedback');

        // Prepare Data according to your BookCatalogDto
        const catalogData = {
            title: document.getElementById('catalogTitle').value,
            author: document.getElementById('catalogAuthor').value,
            category: document.getElementById('catalogCategory').value,
            floorNumber: parseInt(document.getElementById('floorNumber').value),
            section: document.getElementById('sectionName').value,
            shelfNumber: document.getElementById('shelfNumber').value,
            totalCopies: parseInt(document.getElementById('totalCopies').value)
        };

        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

        try {
            // Using your endpoint: http://localhost:3000/book-catalog/create-catalog
            const response = await authorizedFetch('/book-catalog/create-catalog', {
                method: 'POST',
                body: JSON.stringify(catalogData)
            });

            const result = await response.json();

            if (response.ok) {
                feedback.innerHTML = `✅ ${result.message}`;
                feedback.style.color = "green";
                catalogForm.reset();
            } else {
                throw new Error(result.message || "Failed to create catalog");
            }
        } catch (error) {
            feedback.innerHTML = ` Error: ${error.message}`;
            feedback.style.color = "red";
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-plus"></i> Add to Catalog';
        }
    });
}
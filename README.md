# 📚 E-Library — Digital Library System

A full-stack digital library system where users can manage books, borrow and return physical copies, and read or download e-books online.

---

## 🌟 Features

**📖 Book Management**
- Add, update, and remove books
- Track availability of both physical and digital copies

**👤 User Management**
- Registration and authentication
- Role-based access control (Admin / Member)

**🔄 Borrowing & Returning**
- Borrow and return physical books
- Automatic due date tracking and book status updates

**💻 Digital Library**
- Read e-books online without downloading
- Download e-books for offline reading

**🔍 Search & Filter**
- Search books by title, author, or category
- View full borrowing history per user

**📱 Responsive UI**
- Fully responsive on desktop and mobile

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, JavaScript |
| Backend | NestJS |
| Database | MongoDB + Mongoose |
| Auth | JWT + Role-Based Access Control |
| API | RESTful API |

---

## 📂 Project Structure

```
E-Library/
├── frontend/     # UI built with HTML, CSS, and JavaScript
└── backend/      # API server with NestJS, MongoDB, JWT, and RBAC
```

> Each folder contains its own README with detailed setup instructions.

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/E-Library.git
cd E-Library
```

### 2. Backend Setup
```bash
cd backend
npm install
# Add your .env file with MongoDB URI and JWT secret
npm run start:dev
```

### 3. Frontend Setup
```bash
cd frontend
# Open index.html with Live Server or any static server
# Make sure the backend is running first
```


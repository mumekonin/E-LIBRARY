📚 Library System

A full-stack digital library system that allows users to manage books, borrow and return physical copies, and read e-books online. The system combines a frontend built with HTML, CSS, and JavaScript with a backend using NestJS, MongoDB, and a RESTful API.

🌟 Features

Book Management

         Add, remove, and update books
      
        Track availability of physical and digital copies

User Management

        Registration and authentication (handled by backend)
      
        Role-based access control (Admin / Member)

Borrowing & Returning
      
        Borrow and return physical books
      
        Automatic tracking of due dates and book status

Digital Library Access

         Download e-books for offline reading
      
         Read books online without downloading

Search & Filter

        Search books by title, author, or category
      
         Maintain borrowing history for users

Responsive UI

         on both desktop and mobile devices

🛠 Technology Stack
        
        Frontend: HTML, CSS, JavaScript
        
        Backend: NestJS, MongoDB (Mongoose), REST API
        
        Authentication & Authorization: JWT and Role-Based Access Control


🚀 Getting Started
1. Clone the Repository
        git clone https://github.com/your-username/E-Library.git
        cd library-system
2. Backend Setup

Navigate to backend/

Install dependencies

      npm install

      Configure environment variables (.env) for MongoDB and JWT

Start the server:

      npm run start:dev
3. Frontend Setup

    Navigate to frontend/
    
    Open index.html in your web browser
    
    Ensure the backend server is running to handle API requests

📂 Repository Structure

        frontend/ — User interface built with HTML, CSS, and JS
        
        backend/ — API server with NestJS, MongoDB, JWT, and RBAC
        
        Each folder contains its own README with detailed setup instructions.


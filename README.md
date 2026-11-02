# FSD Mid Term 1 (CSE-11_182)

## Description
Library Management System built with Node.js and Express, using an in-memory array instead of a database.

## How to run
1. Run `npm install`
2. Run `npm start`
3. Server runs on http://localhost:3000

## API Endpoints
- POST /api/books : add a book
- GET /api/books : get all books
- GET /api/books/search?title= : search books by title (case-insensitive)
- GET /api/books/:id : get one book
- PUT /api/books/:id : update book details (id cannot be changed)
- DELETE /api/books/:id : delete a book (blocked if copies are issued)
- POST /api/books/:id/issue : issue a book (decreases available copies)
- POST /api/books/:id/return : return a book (increases available copies)
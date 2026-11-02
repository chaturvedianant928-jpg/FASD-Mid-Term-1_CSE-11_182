const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

let books = [];

// Task 2: add a book
app.post('/api/books', (req, res) => {
  const { id, title, author, category, copiesAvailable } = req.body;

  // Validate required fields
  const missing = [];
  if (id === undefined) missing.push('id');
  if (!title) missing.push('title');
  if (!author) missing.push('author');
  if (!category) missing.push('category');
  if (copiesAvailable === undefined) missing.push('copiesAvailable');

  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missing.join(', ')}`
    });
  }

  // Prevent duplicate ids
  if (books.find(book => book.id === id)) {
    return res.status(409).json({
      success: false,
      message: `Book with id ${id} already exists`
    });
  }

  // Store in the in-memory array
  const newBook = { id, title, author, category, copiesAvailable };
  books.push(newBook);

  // Success response
  res.status(201).json({
    success: true,
    message: 'Book added successfully',
    data: newBook
  });
});

// Task 3a: get all books
app.get('/api/books', (req, res) => {
  if (books.length === 0) {
    return res.status(200).json({
      success: true,
      message: 'No books available in the library',
      count: 0,
      data: []
    });
  }

  res.status(200).json({
    success: true,
    count: books.length,
    data: books
  });
});

// Task 3b: get one book by id
app.get('/api/books/:id', (req, res) => {
  const id = Number(req.params.id);
  const book = books.find(b => b.id === id);

  if (!book) {
    return res.status(404).json({
      success: false,
      message: `Book with id ${req.params.id} not found`
    });
  }

  res.status(200).json({ success: true, data: book });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

let books = [];

// Task 2: add a book
app.post('/api/books', (req, res) => {
  const { id, title, author, category, copiesAvailable } = req.body;

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

  if (typeof id !== 'number' || typeof copiesAvailable !== 'number' || copiesAvailable < 0) {
    return res.status(400).json({
      success: false,
      message: 'id and copiesAvailable must be numbers (copiesAvailable cannot be negative)'
    });
  }

  if (books.find(book => book.id === id)) {
    return res.status(409).json({
      success: false,
      message: `Book with id ${id} already exists`
    });
  }

  const newBook = {
    id,
    title,
    author,
    category,
    copiesAvailable,
    totalCopies: copiesAvailable
  };
  books.push(newBook);

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

// Task 6: search by title (must be BEFORE /api/books/:id)
app.get('/api/books/search', (req, res) => {
  const title = req.query.title;

  if (!title || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: 'title query parameter is required'
    });
  }

  const query = title.trim().toLowerCase();
  const results = books.filter(b => b.title.toLowerCase().includes(query));

  if (results.length === 0) {
    return res.status(404).json({
      success: false,
      message: `No books found matching "${title}"`
    });
  }

  res.status(200).json({
    success: true,
    count: results.length,
    data: results
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

// Task 4: update a book
app.put('/api/books/:id', (req, res) => {
  const id = Number(req.params.id);
  const book = books.find(b => b.id === id);

  if (!book) {
    return res.status(404).json({
      success: false,
      message: `Book with id ${req.params.id} not found`
    });
  }

  const { id: bodyId, title, author, category, copiesAvailable } = req.body;

  if (bodyId !== undefined && bodyId !== id) {
    return res.status(400).json({
      success: false,
      message: 'Book id cannot be changed'
    });
  }

  if (title === undefined && author === undefined &&
      category === undefined && copiesAvailable === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Provide at least one field to update'
    });
  }

  if (title !== undefined && !title) {
    return res.status(400).json({ success: false, message: 'title cannot be empty' });
  }
  if (author !== undefined && !author) {
    return res.status(400).json({ success: false, message: 'author cannot be empty' });
  }
  if (category !== undefined && !category) {
    return res.status(400).json({ success: false, message: 'category cannot be empty' });
  }
  if (copiesAvailable !== undefined &&
      (typeof copiesAvailable !== 'number' || copiesAvailable < 0)) {
    return res.status(400).json({
      success: false,
      message: 'copiesAvailable must be a non-negative number'
    });
  }

  if (title !== undefined) book.title = title;
  if (author !== undefined) book.author = author;
  if (category !== undefined) book.category = category;
  if (copiesAvailable !== undefined) {
    book.copiesAvailable = copiesAvailable;
    if (copiesAvailable > book.totalCopies) book.totalCopies = copiesAvailable;
  }

  res.status(200).json({
    success: true,
    message: 'Book updated successfully',
    data: book
  });
});

// Task 5: delete a book
app.delete('/api/books/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = books.findIndex(b => b.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `Book with id ${req.params.id} not found`
    });
  }

  const book = books[index];

  if (book.copiesAvailable < book.totalCopies) {
    return res.status(409).json({
      success: false,
      message: `Cannot delete: ${book.totalCopies - book.copiesAvailable} copy/copies are currently issued`
    });
  }

  books.splice(index, 1);

  res.status(200).json({
    success: true,
    message: 'Book deleted successfully',
    data: book
  });
});

// Task 7a: issue a book
app.post('/api/books/:id/issue', (req, res) => {
  const id = Number(req.params.id);
  const book = books.find(b => b.id === id);

  if (!book) {
    return res.status(404).json({
      success: false,
      message: `Book with id ${req.params.id} not found`
    });
  }

  if (book.copiesAvailable < 1) {
    return res.status(409).json({
      success: false,
      message: 'No copies available to issue'
    });
  }

  book.copiesAvailable -= 1;

  res.status(200).json({
    success: true,
    message: 'Book issued successfully',
    data: book
  });
});

// Task 7b: return a book
app.post('/api/books/:id/return', (req, res) => {
  const id = Number(req.params.id);
  const book = books.find(b => b.id === id);

  if (!book) {
    return res.status(404).json({
      success: false,
      message: `Book with id ${req.params.id} not found`
    });
  }

  if (book.copiesAvailable >= book.totalCopies) {
    return res.status(400).json({
      success: false,
      message: 'All copies are already in the library'
    });
  }

  book.copiesAvailable += 1;

  res.status(200).json({
    success: true,
    message: 'Book returned successfully',
    data: book
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
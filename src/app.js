const express = require('express');
const cors = require('cors');

// Import routes
const categoryRoutes = require('./routes/categoryRoutes');
const courseRoutes = require('./routes/courseRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check / welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Home Task API is running',
    endpoints: {
      categories: '/api/categories',
      courses: '/api/courses',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
      },
    },
  });
});

// Mount Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/auth', authRoutes);

// Catch-All 404 Route Handler for Unknown URLs (e.g., /api/batman)
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;

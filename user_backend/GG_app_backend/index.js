const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const testRoutes = require('./routes/testRoutes');
require('dotenv').config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Add more detailed logging for production debugging
const logRequestDetails = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers));
  console.log('Body:', JSON.stringify(req.body));
  next();
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logRequestDetails); // Add request logging

// Test database connection
testConnection();

// Routes - ensure they're correctly registered
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);

// Special health check route for Vercel
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Backend API is running',
    routes: {
      auth: [
        { method: 'POST', path: '/api/auth/register' },
        { method: 'POST', path: '/api/auth/login' },
        { method: 'GET', path: '/api/auth/profile' },
        { method: 'PUT', path: '/api/auth/profile' }
      ]
    }
  });
});

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to GG_MobileApp Authentication API',
    status: 'Server is running'
  });
});

// Handle 404 errors
app.use((req, res) => {
  console.log(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // For Vercel serverless deployment

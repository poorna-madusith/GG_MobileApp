const express = require('express');
const { pool, testConnection } = require('../config/db');

const router = express.Router();

// Test database connection
router.get('/db-connection', async (req, res) => {
  try {
    const result = await testConnection();
    
    if (result) {
      return res.status(200).json({
        success: true,
        message: 'Database connection successful',
        environment: process.env.NODE_ENV || 'development',
        vercel: process.env.VERCEL === '1' ? 'Yes' : 'No'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to connect to database'
      });
    }
  } catch (error) {
    console.error('Test route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error testing database connection',
      error: error.message
    });
  }
});

module.exports = router;

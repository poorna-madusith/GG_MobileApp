// Standalone Vercel serverless function for account deletion
// Deploy at /api/auth/profile with DELETE method

const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Simplified database connection
const getConnection = async () => {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'gg-mobileapp-db.c7auia8qwau3.ap-southeast-2.rds.amazonaws.com',
      user: process.env.DB_USER || 'admin',
      password: process.env.DB_PASSWORD || 'poornamadusith',
      database: process.env.DB_NAME || 'gg_mobileapp',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    return pool;
  } catch (error) {
    console.error('Error creating database pool:', error);
    throw error;
  }
};

// Authenticate middleware
const authenticate = async (req) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, message: 'No token provided' };
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '7d675624028d713400e449107040e98c98083427c5b070d286a5998daf13a322de43952907cf8cd55183c8464f7734b491e992366c6f176182a2e8719824c7924');
    
    // Add user info to request
    req.user = decoded;
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Invalid token' };
  }
};

// Delete account handler
const deleteAccount = async (userId) => {
  try {
    const pool = await getConnection();
    
    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      console.log('Deleting crops for user:', userId);
      // Delete user's crops entries first (foreign key constraint)
      await connection.query(
        'DELETE FROM user_crops WHERE user_id = ?',
        [userId]
      );
      
      console.log('Deleting user account:', userId);
      // Delete user account
      await connection.query(
        'DELETE FROM users WHERE id = ?',
        [userId]
      );
      
      // Commit transaction
      await connection.commit();
      connection.release();
      
      return { 
        success: true, 
        message: 'Account deleted successfully' 
      };
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      connection.release();
      console.error('Database error:', error);
      return { 
        success: false, 
        message: 'Database error while deleting account', 
        error: error.message 
      };
    }
  } catch (error) {
    console.error('Connection error:', error);
    return { 
      success: false, 
      message: 'Server error', 
      error: error.message 
    };
  }
};

// Main handler function for Vercel serverless function
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle DELETE request
  if (req.method === 'DELETE') {
    // Authenticate user
    const authResult = await authenticate(req);
    if (!authResult.success) {
      return res.status(401).json({
        success: false,
        message: authResult.message
      });
    }
    
    // Delete account - use id instead of userId
    const userId = req.user.id;
    const result = await deleteAccount(userId);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(500).json(result);
    }
  } else {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }
};

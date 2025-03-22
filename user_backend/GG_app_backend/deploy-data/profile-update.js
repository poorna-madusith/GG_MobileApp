// Standalone Vercel serverless function for profile updates
// This functionality has been removed from the project

const jwt = require('jsonwebtoken');
require('dotenv').config();

// Main handler function for Vercel
module.exports = async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Return a message indicating this functionality has been removed
  return res.status(410).json({
    success: false,
    message: 'Profile update functionality has been removed from this application'
  });
};

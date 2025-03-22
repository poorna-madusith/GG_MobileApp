const mysql = require('mysql2/promise');
require('dotenv').config();

// Function to determine if we're running in production (Vercel)
const isProduction = () => process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

// For production, we'll use a connection string instead of individual parameters
let dbConfig = {};

if (isProduction()) {
  // For Vercel/production environment - using connection string
  dbConfig = {
    uri: process.env.DATABASE_URL, // This will be set in Vercel environment variables
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
} else {
  // For local development - using individual parameters
  dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
}

// Create connection pool without database initially (only for local development)
let initialPool;
if (!isProduction()) {
  initialPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

// Create connection pool with database
const pool = isProduction() 
  ? mysql.createPool(dbConfig) 
  : mysql.createPool(dbConfig);

// Initialize database and tables
const initializeDatabase = async () => {
  try {
    // Create database if it doesn't exist - only in development
    if (!isProduction() && initialPool) {
      await initialPool.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
      console.log(`Database ${process.env.DB_NAME} created or already exists`);
    }
    
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        age INT,
        address TEXT,
        phone_number VARCHAR(15) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table created or already exists');
    
    // Create user_crops table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_crops (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        crop_name VARCHAR(100) NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_crop (user_id, crop_name)
      )
    `);
    console.log('User_crops table created or already exists');
    
    return true;
  } catch (error) {
    console.error('Error initializing database:', error.message);
    return false;
  }
};

// Test database connection
const testConnection = async () => {
  try {
    // Initialize database first
    await initializeDatabase();
    
    const connection = await pool.getConnection();
    console.log('Database connection established successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('Error connecting to database:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  testConnection,
  initializeDatabase
};

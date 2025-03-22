require('dotenv').config({ path: './.env.production' });
const mysql = require('mysql2/promise');

const initDatabase = async () => {
  const connectionString = process.env.DATABASE_URL;
  console.log('Connecting to database:', connectionString.replace(/:[^:]*@/, ':****@')); // Hide password in logs

  try {
    // Create connection
    const connection = await mysql.createConnection(connectionString);
    console.log('Connection successful!');
    
    // Create users table
    console.log('Creating users table...');
    await connection.execute(`
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
    console.log('Creating user_crops table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_crops (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        crop_name VARCHAR(100) NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_crop (user_id, crop_name)
      )
    `);
    console.log('User_crops table created or already exists');
    
    // Close connection
    await connection.end();
    
    return true;
  } catch (error) {
    console.error('Error initializing database:', error.message);
    return false;
  }
};

// Run the initialization
initDatabase()
  .then(result => {
    if (result) {
      console.log('Database initialization completed successfully.');
    } else {
      console.log('Database initialization failed.');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });

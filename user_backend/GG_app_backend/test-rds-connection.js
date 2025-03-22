require('dotenv').config({ path: './.env.production' });
const mysql = require('mysql2/promise');

const testConnection = async () => {
  // Extract database name from connection string
  const connectionString = process.env.DATABASE_URL;
  const dbName = connectionString.split('/').pop();
  
  // Create connection string without database name for initial connection
  const baseConnectionString = connectionString.slice(0, connectionString.lastIndexOf('/'));
  
  console.log('Testing connection to:', baseConnectionString.replace(/:[^:]*@/, ':****@')); // Hide password in logs

  try {
    // First connect without specifying database to create it if needed
    const baseConnection = await mysql.createConnection(baseConnectionString);
    console.log('Base connection successful!');
    
    // Try to create the database if it doesn't exist
    await baseConnection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`Database '${dbName}' created or already exists`);
    
    // Close base connection
    await baseConnection.end();
    
    // Now connect with the database name
    console.log('Connecting to the database...');
    const connection = await mysql.createConnection(connectionString);
    console.log('Database connection successful!');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 + 1 AS result');
    console.log('Query result:', rows[0].result);
    
    // Close connection
    await connection.end();
    
    return true;
  } catch (error) {
    console.error('Error connecting to database:', error.message);
    return false;
  }
};

// Run the test
testConnection()
  .then(result => {
    if (result) {
      console.log('Database connection test passed.');
    } else {
      console.log('Database connection test failed.');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });

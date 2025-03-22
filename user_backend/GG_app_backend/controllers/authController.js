const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
require('dotenv').config();

// Register a new user
const register = async (req, res) => {
  const { fullName, age, address, phoneNumber, password, selectedCrops } = req.body;

  // Validate input
  if (!fullName || !phoneNumber || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, phone number, and password are required'
    });
  }

  try {
    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE phone_number = ?',
      [phoneNumber]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this phone number already exists'
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert user
      const [result] = await connection.query(
        'INSERT INTO users (full_name, age, address, phone_number, password) VALUES (?, ?, ?, ?, ?)',
        [fullName, age || null, address || null, phoneNumber, hashedPassword]
      );

      const userId = result.insertId;

      // Insert crops if provided
      if (selectedCrops && selectedCrops.length > 0) {
        const cropValues = selectedCrops.map(crop => [userId, crop]);
        await connection.query(
          'INSERT INTO user_crops (user_id, crop_name) VALUES ?',
          [cropValues]
        );
      }

      // Commit transaction
      await connection.commit();
      connection.release();

      // Generate JWT token
      const token = jwt.sign(
        { id: userId, phoneNumber },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: userId,
          fullName,
          phoneNumber
        }
      });
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

// Login user
const login = async (req, res) => {
  const { phoneNumber, password } = req.body;

  // Validate input
  if (!phoneNumber || !password) {
    return res.status(400).json({
      success: false,
      message: 'Phone number and password are required'
    });
  }

  try {
    // Get user from database
    const [users] = await pool.query(
      'SELECT users.*, GROUP_CONCAT(user_crops.crop_name) as crops FROM users ' +
      'LEFT JOIN user_crops ON users.id = user_crops.user_id ' +
      'WHERE users.phone_number = ? ' +
      'GROUP BY users.id',
      [phoneNumber]
    );

    // Check if user exists
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this phone number. Please sign up.'
      });
    }

    const user = users[0];

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password. Please try again.'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, phoneNumber: user.phone_number },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Parse crops string into array
    const selectedCrops = user.crops ? user.crops.split(',') : [];

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        phoneNumber: user.phone_number,
        age: user.age,
        address: user.address,
        selectedCrops: selectedCrops
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    // Get user details including crops
    const [users] = await pool.query(
      'SELECT users.*, GROUP_CONCAT(user_crops.crop_name) as crops FROM users ' +
      'LEFT JOIN user_crops ON users.id = user_crops.user_id ' +
      'WHERE users.id = ? ' +
      'GROUP BY users.id',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];
    const selectedCrops = user.crops ? user.crops.split(',') : [];

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        fullName: user.full_name,
        phoneNumber: user.phone_number,
        age: user.age,
        address: user.address,
        selectedCrops: selectedCrops
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// Delete user account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Delete user's crops entries first (foreign key constraint)
      await connection.query(
        'DELETE FROM user_crops WHERE user_id = ?',
        [userId]
      );

      // Delete user
      await connection.query(
        'DELETE FROM users WHERE id = ?',
        [userId]
      );

      // Commit transaction
      await connection.commit();
      connection.release();

      return res.status(200).json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Delete account error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting account',
      error: error.message
    });
  }
};

const updateUserDetails = async (req, res) => {
  const { fullName, age, address, selectedCrops } = req.body;
  const userId = req.user.id;

  try {
    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update user details
      await connection.query(
        'UPDATE users SET full_name = ?, age = ?, address = ? WHERE id = ?',
        [fullName, age || null, address || null, userId]
      );

      // Handle crops update
      if (selectedCrops && Array.isArray(selectedCrops)) {
        // Delete existing crop associations
        await connection.query('DELETE FROM user_crops WHERE user_id = ?', [userId]);
        
        // Insert new crop associations
        if (selectedCrops.length > 0) {
          const cropValues = selectedCrops.map(crop => [userId, crop]);
          await connection.query(
            'INSERT INTO user_crops (user_id, crop_name) VALUES ?',
            [cropValues]
          );
        }
      }

      // Commit transaction
      await connection.commit();
      
      // Fetch updated user data
      const [updatedUser] = await connection.query(
        'SELECT id, full_name, age, address, phone_number FROM users WHERE id = ?',
        [userId]
      );
      
      const [userCrops] = await connection.query(
        'SELECT crop_name FROM user_crops WHERE user_id = ?',
        [userId]
      );

      connection.release();

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          ...updatedUser[0],
          selectedCrops: userCrops.map(crop => crop.crop_name)
        }
      });

    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }

  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  const { fullName, age, address, selectedCrops } = req.body;
  const userId = req.user.id;

  try {
    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update user details
      await connection.query(
        'UPDATE users SET full_name = ?, age = ?, address = ? WHERE id = ?',
        [fullName, age || null, address || null, userId]
      );

      // Handle crops update if provided
      if (selectedCrops && Array.isArray(selectedCrops)) {
        // Delete existing crop associations
        await connection.query('DELETE FROM user_crops WHERE user_id = ?', [userId]);
        
        // Insert new crop associations
        if (selectedCrops.length > 0) {
          const cropValues = selectedCrops.map(crop => [userId, crop]);
          await connection.query(
            'INSERT INTO user_crops (user_id, crop_name) VALUES ?',
            [cropValues]
          );
        }
      }

      // Commit transaction
      await connection.commit();
      
      // Fetch updated user data
      const [users] = await connection.query(
        'SELECT users.*, GROUP_CONCAT(user_crops.crop_name) as crops FROM users ' +
        'LEFT JOIN user_crops ON users.id = user_crops.user_id ' +
        'WHERE users.id = ? ' +
        'GROUP BY users.id',
        [userId]
      );

      connection.release();

      const user = users[0];
      const updatedCrops = user.crops ? user.crops.split(',') : [];

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          fullName: user.full_name,
          phoneNumber: user.phone_number,
          age: user.age,
          address: user.address,
          selectedCrops: updatedCrops
        }
      });

    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }

  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  deleteAccount,
  updateUserDetails,
  updateProfile
};

import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const AUTH_TOKEN_KEY = 'auth_token';
export const USER_DATA_KEY = 'user_data';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise} - Promise with registration result
 */
export const register = async (userData) => {
  try {
    console.log('Attempting to register user with backend:', userData.phoneNumber);
    
    try {
      // Try to register with backend first
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        // Store auth token
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
        
        // Store user data
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response.data.user));
        
        console.log('User registered successfully with backend');
        return { success: true, user: response.data.user };
      } else {
        return { success: false, message: response.data.message || 'Registration failed' };
      }
    } catch (apiError) {
      console.error('Backend registration failed:', apiError.message);
      
      // If in development mode, create a local user for testing
      if (__DEV__) {
        console.log('Development mode: Creating local user');
        
        // Generate a fake user ID for local testing
        const localUser = {
          ...userData,
          id: Math.floor(Math.random() * 10000),
          createdAt: new Date().toISOString()
        };
        
        // Store fake token and user data
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, 'local-dev-token');
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(localUser));
        
        console.log('Created local user for development:', localUser);
        return { 
          success: true, 
          user: localUser, 
          localOnly: true,
          message: 'Created local user for development'
        };
      }
      
      // For production, return the error
      return { 
        success: false, 
        message: apiError.response?.data?.message || 'Network error during registration',
        statusCode: apiError.response?.status
      };
    }
  } catch (error) {
    console.error('Registration error:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Network error during registration'
    };
  }
};

/**
 * Login a user
 * @param {string} phoneNumber - User's phone number
 * @param {string} password - User's password
 * @returns {Promise} - Promise with login result
 */
export const login = async (phoneNumber, password) => {
  try {
    console.log('Attempting to login with backend:', phoneNumber);
    
    try {
      // Try to login with backend first
      const response = await api.post('/auth/login', { phoneNumber, password });
      
      if (response.data.success) {
        // Store auth token
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
        
        // Store user data
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response.data.user));
        
        console.log('User logged in successfully with backend');
        return { success: true, user: response.data.user };
      } else {
        return { success: false, message: response.data.message || 'Login failed' };
      }
    } catch (apiError) {
      console.error('Backend login failed:', apiError.message);
      
      // If in development mode, try to login with local storage
      if (__DEV__) {
        console.log('Development mode: Trying local login');
        
        // Get stored users data (for development testing)
        const storedUserData = await AsyncStorage.getItem(USER_DATA_KEY);
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          
          // Simple local validation
          if (userData.phoneNumber === phoneNumber) {
            console.log('Local login successful for development');
            await AsyncStorage.setItem(AUTH_TOKEN_KEY, 'local-dev-token');
            
            return { 
              success: true, 
              user: userData, 
              localOnly: true,
              message: 'Logged in with local storage (development mode)'
            };
          }
        }
      }
      
      // For production or if local login fails, return the error
      return { 
        success: false, 
        message: apiError.response?.data?.message || 'Network error during login',
        statusCode: apiError.response?.status
      };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Network error during login'
    };
  }
};

/**
 * Get the current user profile
 * @returns {Promise} - Promise with user profile
 */
export const getUserProfile = async () => {
  try {
    console.log('Fetching user profile from API...');
    const response = await api.get('/auth/profile');
    
    console.log('Profile API response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      // Update stored user data with latest from server
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response.data.user));
      console.log('Updated stored user data with fresh profile data');
      
      return { success: true, user: response.data.user };
    } else {
      console.log('Profile fetch failed:', response.data.message);
      return { success: false, message: response.data.message || 'Failed to get profile' };
    }
  } catch (error) {
    console.error('Get profile error:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Network error getting profile'
    };
  }
};

/**
 * Check if user is logged in
 * @returns {Promise<boolean>} - Promise with login status
 */
export const isLoggedIn = async () => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    return !!token;
  } catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
};

/**
 * Logout the current user
 * @returns {Promise} - Promise indicating logout success
 */
export const logout = async () => {
  try {
    // Remove auth token
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    
    // Remove user data
    await AsyncStorage.removeItem(USER_DATA_KEY);
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, message: 'Error during logout' };
  }
};

/**
 * Get stored user data
 * @returns {Promise<Object|null>} - User data or null if not found
 */
export const getStoredUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Get stored user data error:', error);
    return null;
  }
};

/**
 * Update user profile
 * @param {Object} userData - User data to update
 * @returns {Promise} - Promise with update result
 */
export const updateUserProfile = async (userData) => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    
    if (!token) {
      return { success: false, message: 'Authentication required' };
    }

    const response = await api.put('/auth/update-profile', userData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      // Update stored user data
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response.data.user));
      return { success: true, user: response.data.user };
    } else {
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error('Profile update error:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Error updating profile'
    };
  }
};

export default {
  register,
  login,
  getUserProfile,
  isLoggedIn,
  logout,
  getStoredUserData,
  updateUserProfile
};

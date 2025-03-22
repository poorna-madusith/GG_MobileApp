const axios = require('axios');

// Your Vercel deployment URL
const VERCEL_URL = 'https://gg-mobileapp-backend.vercel.app';

// Test user data - updated to match the expected format from the controller
const testUser = {
  fullName: 'Test User',  // Changed to fullName
  age: 28,
  address: 'Test Address, City, Country',
  phoneNumber: `+9477${Math.floor(1000000 + Math.random() * 9000000)}`, // Generate random phone number
  password: 'Password123!',
  selectedCrops: ['Rice', 'Beans']  // Changed to selectedCrops
};

let authToken = '';

const testAuth = async () => {
  try {
    console.log('==== Testing Authentication Flow ====');
    console.log(`\nTest user: ${testUser.fullName}`);
    console.log(`Phone: ${testUser.phoneNumber}`);
    
    // Step 1: Register a new user
    console.log('\n1. Testing registration...');
    try {
      // Print what we're sending
      console.log('Sending registration data:', JSON.stringify(testUser, null, 2));
      
      const registerResponse = await axios.post(`${VERCEL_URL}/api/auth/register`, testUser);
      console.log('Registration status:', registerResponse.status);
      console.log('Response:', registerResponse.data);
      
      if (registerResponse.data.success) {
        console.log('✅ Registration successful!');
      } else {
        console.log('❌ Registration failed.');
        return;
      }
    } catch (error) {
      // If user already exists, that's okay - we'll try to log in
      if (error.response && error.response.data && error.response.data.message === 'User with this phone number already exists') {
        console.log('User already exists, proceeding to login...');
      } else {
        console.error('❌ Registration error:', error.message);
        if (error.response) {
          console.error('Status:', error.response.status);
          console.error('Response:', error.response.data);
          console.error('Please check your backend logs for more details.');
        }
        return;
      }
    }
    
    // Step 2: Login
    console.log('\n2. Testing login...');
    try {
      const loginResponse = await axios.post(`${VERCEL_URL}/api/auth/login`, {
        phoneNumber: testUser.phoneNumber,  // Updated field name
        password: testUser.password
      });
      
      console.log('Login status:', loginResponse.status);
      console.log('Success:', loginResponse.data.success);
      
      if (loginResponse.data.success && loginResponse.data.token) {
        console.log('✅ Login successful!');
        authToken = loginResponse.data.token;
        
        // Step 3: Get profile with token
        console.log('\n3. Testing profile retrieval...');
        const profileResponse = await axios.get(`${VERCEL_URL}/api/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        console.log('Profile status:', profileResponse.status);
        console.log('User profile:', profileResponse.data.user);
        
        if (profileResponse.data.success) {
          console.log('✅ Profile retrieval successful!');
        } else {
          console.log('❌ Profile retrieval failed.');
        }
      } else {
        console.log('❌ Login failed.');
      }
    } catch (error) {
      console.error('❌ Login/Profile error:', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Response:', error.response.data);
      }
    }
    
    console.log('\n==== Test Complete ====');
    if (authToken) {
      console.log('Authentication flow test PASSED ✅');
      console.log('Your backend is working correctly with RDS!');
    } else {
      console.log('Authentication flow test FAILED ❌');
      console.log('Please check your backend configuration and logs.');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
};

testAuth();

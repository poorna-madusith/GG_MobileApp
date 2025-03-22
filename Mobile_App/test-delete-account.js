const axios = require('axios');

const API_URL = 'https://gg-mobileapp-backend.vercel.app/api';

const testDeleteAccount = async () => {
  try {
    // First login to get token
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      phoneNumber: '+949962058',
      password: 'ScreenTest123!'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }

    const token = loginResponse.data.token;
    
    // Test delete endpoint
    const deleteResponse = await axios.delete(
      `${API_URL}/auth/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('Delete response:', deleteResponse.data);
    
  } catch (error) {
    console.error('Test error:', error.response?.data || error.message);
  }
};

testDeleteAccount();
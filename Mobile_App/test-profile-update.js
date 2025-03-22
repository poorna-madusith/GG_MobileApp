const axios = require('axios');

const API_URL = 'https://gg-mobileapp-backend.vercel.app/api';
const testUser = {
  phoneNumber: '+949962058',
  password: 'ScreenTest123!'
};

const testProfileUpdate = async () => {
  try {
    const loginResponse = await axios.post(`${API_URL}/auth/login`, testUser);
    const token = loginResponse.data.token;

    const updateData = {
      fullName: 'Test Update',
      age: 25,
      address: 'Test Address',
      selectedCrops: ['Rice', 'Tea']
    };

    const response = await axios.put(`${API_URL}/auth/profile`, updateData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Update response:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

testProfileUpdate();
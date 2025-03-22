const axios = require('axios');

// Your Vercel deployment URL
const VERCEL_URL = 'https://gg-mobileapp-backend.vercel.app';

const testDeployment = async () => {
  try {
    console.log('Testing root endpoint...');
    const rootResponse = await axios.get(`${VERCEL_URL}/`);
    
    console.log('Root endpoint status:', rootResponse.status);
    console.log('Root endpoint data:', rootResponse.data);
    
    console.log('\nTesting auth endpoint...');
    try {
      // Just checking if the endpoint exists, not trying to actually log in
      const authResponse = await axios.get(`${VERCEL_URL}/api/auth`);
      console.log('Auth endpoint status:', authResponse.status);
      console.log('Auth endpoint data:', authResponse.data);
    } catch (authError) {
      if (authError.response && authError.response.status === 404) {
        console.log('Auth endpoint returns 404. This might be normal if it only accepts POST requests.');
      } else {
        console.log('Auth endpoint error:', authError.message);
      }
    }
  } catch (error) {
    console.error('❌ Error testing deployment:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

testDeployment();

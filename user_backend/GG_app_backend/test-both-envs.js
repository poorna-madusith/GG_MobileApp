const axios = require('axios');

// URLs to test
const VERCEL_URL = 'https://gg-mobileapp-backend.vercel.app'; // Production
const LOCAL_URL = 'http://localhost:3000'; // Local development

// Test user data
const testUser = {
  fullName: 'Test User',
  age: 28,
  address: 'Test Address, City, Country',
  phoneNumber: `+9477${Math.floor(1000000 + Math.random() * 9000000)}`,
  password: 'Password123!',
  selectedCrops: ['Rice', 'Beans']
};

const testEnvironment = async (baseUrl, environment) => {
  console.log(`\n==== Testing ${environment} Environment (${baseUrl}) ====\n`);
  
  try {
    // Test root endpoint
    console.log(`Testing root endpoint on ${environment}...`);
    try {
      const response = await axios.get(baseUrl, { timeout: 10000 });
      console.log(`✅ Root endpoint (${environment}): Status ${response.status}`);
      console.log(`Response: ${JSON.stringify(response.data)}`);
    } catch (error) {
      console.error(`❌ Root endpoint (${environment}) error:`, error.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Unexpected error in ${environment} test:`, error.message);
    return false;
  }
};

const runTests = async () => {
  // Test both environments
  const vercelResult = await testEnvironment(VERCEL_URL, 'Production');
  
  // Start local server
  console.log('\nStarting local server for testing...');
  console.log('(If this hangs, you may need to manually start your local server in another terminal)');
  
  // We'll check if local server is already running
  let localResult = false;
  try {
    await axios.get(LOCAL_URL, { timeout: 5000 });
    localResult = await testEnvironment(LOCAL_URL, 'Local');
  } catch (error) {
    console.log('Local server is not running. Please start it manually to test local environment.');
  }
  
  // Summary
  console.log('\n==== Test Summary ====');
  console.log(`Production (Vercel): ${vercelResult ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Local Development: ${localResult ? '✅ PASSED' : '⚠️ NOT TESTED (server not running)'}`);
  
  if (vercelResult) {
    console.log('\n✅ Your backend is deployed and the base API is working!');
    console.log('\nPossible issues with authentication endpoints:');
    console.log('1. Make sure your RDS security group allows connections from Vercel');
    console.log('2. Check your database credentials in Vercel environment variables');
    console.log('3. Verify that the database and tables exist in RDS');
    console.log('\nCheck the Vercel logs in your dashboard for more details on the 504 error.');
  } else {
    console.log('\n❌ There are issues with your backend deployment on Vercel.');
  }
};

runTests();

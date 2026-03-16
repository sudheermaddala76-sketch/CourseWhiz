const axios = require('axios');

async function testAuth() {
  try {
    console.log('Testing Registration...');
    const registerRes = await axios.post('http://localhost:3001/api/auth/register', {
      name: 'Test User 4',
      email: 'test4@test.com',
      password: 'password123'
    });
    console.log('Register Success:', registerRes.data);

    console.log('\nTesting Login...');
    const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'test4@test.com',
      password: 'password123'
    });
    console.log('Login Success:', loginRes.data);
  } catch (error) {
    if (error.response) {
      console.error('API Error - Status:', error.response.status);
      console.error('API Error - Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received - Request Options:', error.request._options);
      console.error('Actual Error:', error);
    } else {
      console.error('Request Setup Error:', error.message);
    }
  }
}

testAuth();

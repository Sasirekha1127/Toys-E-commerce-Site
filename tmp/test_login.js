import fetch from 'node-fetch';

async function testLogin() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sasi@gmail.com',
        password: 'Sasi@1234',
      }),
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Data:', data);
  } catch (err) {
    console.error('Test failed:', err.message);
  }
}

testLogin();

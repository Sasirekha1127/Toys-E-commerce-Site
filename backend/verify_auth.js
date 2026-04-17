// Using global fetch (Node.js 18+)


const BASE_URL = 'http://localhost:5000/api/auth';

async function testAuth() {
  console.log('--- Starting Auth Verification Tests ---');

  try {
    // 1. Test Admin Login (seeded earlier)
    console.log('\nTesting Admin Login...');
    const adminRes = await fetch(`${BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@toystore.com',
        password: 'admin123',
      }),
    });
    const adminData = await adminRes.json();
    if (adminRes.ok && adminData.token) {
      console.log('✅ Admin Login Successful');
    } else {
      console.error('❌ Admin Login Failed:', adminData);
    }

    // 2. Test Customer Registration (formerly User)
    const testCustomer = {
      name: 'Test Customer',
      email: `test_${Date.now()}@example.com`,
      password: 'password123',
    };
    console.log(`\nTesting Customer Registration: ${testCustomer.email}...`);
    const regRes = await fetch(`${BASE_URL}/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCustomer),
    });
    const regData = await regRes.json();
    if (regRes.ok) {
      console.log('✅ Customer Registration Successful');
      console.log('   New Customer ID:', regData.user.customer_id);
    } else {
      console.error('❌ Customer Registration Failed:', regData);
    }

    // 3. Test Customer Login
    console.log('Testing Customer Login...');
    const loginRes = await fetch(`${BASE_URL}/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testCustomer.email,
        password: testCustomer.password,
      }),
    });
    const loginData = await loginRes.json();
    if (loginRes.ok && loginData.token) {
      console.log('✅ Customer Login Successful');
      console.log('   Customer ID:', loginData.user.id);
      console.log('   Customer Role:', loginData.user.role);
    } else {
      console.error('❌ Customer Login Failed:', loginData);
    }

    // 4. Test Seller Registration
    const testSeller = {
      name: 'Test Seller',
      email: `seller_${Date.now()}@example.com`,
      password: 'sellerpassword123',
    };
    console.log(`\nTesting Seller Registration: ${testSeller.email}...`);
    const sRegRes = await fetch(`${BASE_URL}/seller/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testSeller),
    });
    const sRegData = await sRegRes.json();
    if (sRegRes.ok) {
      console.log('✅ Seller Registration Successful');
      console.log('   New Seller ID:', sRegData.seller.id);
    } else {
      console.error('❌ Seller Registration Failed:', sRegData);
    }

    // 5. Test Seller Login
    console.log('Testing Seller Login...');
    const sLoginRes = await fetch(`${BASE_URL}/seller/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testSeller.email,
        password: testSeller.password,
      }),
    });
    const sLoginData = await sLoginRes.json();
    if (sLoginRes.ok && sLoginData.token) {
      console.log('✅ Seller Login Successful');
      console.log('   Seller ID:', sLoginData.user.id);
      console.log('   Seller Role:', sLoginData.user.role);
    } else {
      console.error('❌ Seller Login Failed:', sLoginData);
    }

    console.log('\n--- Verification Tests Completed ---');
  } catch (err) {
    console.error('❌ Connection error (is the server running?):', err.message);
  }
}

testAuth();

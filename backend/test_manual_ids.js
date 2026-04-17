import axios from 'axios';

async function test() {
  try {
    const timestamp = Date.now();
    const res = await axios.post('http://localhost:5000/api/auth/user/register', {
      name: 'Manual ID Test',
      email: `manualtest_${timestamp}@example.com`,
      password: 'password123'
    });
    console.log('Registration Success:', res.data.user.customer_id);

    const productRes = await axios.post('http://localhost:5000/api/products', {
      seller_id: 'S001',
      title: 'Manual ID Product',
      price: 99.99,
      category: 'Test'
    });
    console.log('Product Success:', productRes.data.product.id);

  } catch (err) {
    console.error('Test Failed:', err.response?.data || err.message);
  }
}

test();


async function testProfile() {
  const sellerId = 1; // Assuming the sample seller has ID 1
  const baseUrl = 'http://localhost:5000/api/seller/profile';

  try {
    console.log('--- Testing GET Profile ---');
    const getRes = await fetch(`${baseUrl}/${sellerId}`);
    const getData = await getRes.json();
    console.log('GET Result:', JSON.stringify(getData, null, 2));

    if (getRes.ok) {
      console.log('--- Testing PUT Profile ---');
      const putRes = await fetch(`${baseUrl}/${sellerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Updated Name',
          email: getData.seller.email, // Keep same email to avoid conflict
          store_name: 'Updated Store',
          phone: '9876543210',
          location: 'New Location',
          bio: 'New Bio'
        })
      });
      const putData = await putRes.json();
      console.log('PUT Result:', JSON.stringify(putData, null, 2));

      if (putRes.ok) {
        console.log('--- Verifying Update with GET ---');
        const verifyRes = await fetch(`${baseUrl}/${sellerId}`);
        const verifyData = await verifyRes.json();
        console.log('Verify Result:', JSON.stringify(verifyData, null, 2));
      }
    }
  } catch (err) {
    console.error('Test error:', err);
  }
}

testProfile();

const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'sasi',
  port: 5432,
});

async function updateCoupons() {
  try {
    await pool.query("UPDATE coupons SET product_id = '1adea012-f834-4ae9-9bc0-aa6927f63726' WHERE code = 'AD123'");
    await pool.query("UPDATE coupons SET product_id = '00000000-0000-0000-0000-000000000005' WHERE code = 'TUS123'");
    console.log('Updated coupons with valid product IDs');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

updateCoupons();

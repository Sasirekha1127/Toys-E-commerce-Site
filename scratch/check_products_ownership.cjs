const pg = require('pg');
const pool = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'sasi',
  port: 5432,
});

async function check() {
  try {
    const res = await pool.query('SELECT id, admin_id, seller_id FROM products');
    console.log('Total products:', res.rows.length);
    console.log('Products with admin_id or seller_id:', res.rows.filter(r => r.admin_id || r.seller_id).length);
    console.log('Sample rows:', res.rows.slice(0, 5));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

check();

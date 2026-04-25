const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'sasi',
  port: 5432,
});

async function check() {
  try {
    console.log('--- Orders ---');
    const orders = await pool.query('SELECT id, seller_id, order_status, payment_status, total_amount FROM orders LIMIT 5');
    console.table(orders.rows);
    
    console.log('--- Order Items ---');
    const items = await pool.query('SELECT * FROM order_items LIMIT 5');
    console.table(items.rows);
    
    console.log('--- Seller IDs in Products ---');
    const sellers = await pool.query('SELECT DISTINCT seller_id FROM products');
    console.table(sellers.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

check();

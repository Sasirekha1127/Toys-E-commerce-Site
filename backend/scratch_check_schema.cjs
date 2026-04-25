const pg = require('pg');
const { Pool } = pg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'sasi',
  port: 5432,
});

async function testQuery() {
  try {
    const res = await pool.query(`
      SELECT ci.cart_item_id 
      FROM cart_items ci 
      JOIN carts c ON ci.cart_id = c.cart_id 
      LEFT JOIN products p ON ci.product_id = p.id 
      WHERE c.customer_id = 'CUS104'
    `);
    console.log('Query Success! Row count:', res.rows.length);
  } catch (err) {
    console.error('Query Failed Diagnostic:', err.message);
  }
}

async function checkSchema() {
  await testQuery();
  const tables = ['products', 'carts', 'cart_items'];
  // ... rest of checkSchema code if needed, but I'll just run testQuery
  pool.end();
}

checkSchema();

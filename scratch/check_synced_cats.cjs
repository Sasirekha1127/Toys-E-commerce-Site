const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  password: 'sasi',
  host: 'localhost',
  port: 5432,
  database: 'local_db'
});

async function checkFinalCats() {
  try {
    const res = await pool.query("SELECT name, product_count FROM (SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category = c.name) as product_count FROM categories c) sub");
    console.log('FINAL CATEGORIES SYNCED:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
checkFinalCats();

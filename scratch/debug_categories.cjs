const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  password: 'sasi',
  host: 'localhost',
  port: 5432,
  database: 'local_db'
});

async function debugCategories() {
  try {
    const prodCats = await pool.query("SELECT DISTINCT category FROM products");
    console.log('PRODUCT CATEGORIES:', prodCats.rows.map(r => r.category));
    
    const dbCats = await pool.query("SELECT name FROM categories");
    console.log('DB CATEGORIES:', dbCats.rows.map(r => r.name));
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
debugCategories();

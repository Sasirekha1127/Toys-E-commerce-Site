const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  password: 'sasi',
  host: 'localhost',
  port: 5432,
  database: 'local_db'
});

async function checkCategories() {
  try {
    const cats = await pool.query("SELECT * FROM categories");
    console.log('CATEGORIES TABLE:', cats.rows);
    
    const prodCats = await pool.query("SELECT DISTINCT category FROM products");
    console.log('DISTINCT PRODUCT CATEGORIES:', prodCats.rows.map(r => r.category));
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
checkCategories();

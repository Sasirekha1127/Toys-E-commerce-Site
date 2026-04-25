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
    const res = await pool.query("SELECT * FROM categories");
    console.log('FINAL CATEGORIES:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
checkFinalCats();

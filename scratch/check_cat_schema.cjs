const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  password: 'sasi',
  host: 'localhost',
  port: 5432,
  database: 'local_db'
});

async function checkCategorySchema() {
  try {
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'categories'");
    console.log('CATEGORIES SCHEMA:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
checkCategorySchema();

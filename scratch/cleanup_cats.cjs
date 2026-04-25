const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  password: 'sasi',
  host: 'localhost',
  port: 5432,
  database: 'local_db'
});

async function cleanup() {
  try {
    await pool.query("DELETE FROM categories WHERE name IS NULL OR name = ''");
    console.log('Cleaned up invalid categories');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
cleanup();

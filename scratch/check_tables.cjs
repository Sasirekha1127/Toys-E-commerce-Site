const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  password: 'sasi',
  host: 'localhost',
  port: 5432,
  database: 'local_db'
});

async function checkTables() {
  try {
    const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('TABLES:', res.rows.map(r => r.table_name));
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
checkTables();

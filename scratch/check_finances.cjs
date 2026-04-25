const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  password: 'sasi',
  host: 'localhost',
  port: 5432,
  database: 'local_db'
});

async function checkData() {
  try {
    const res = await pool.query("SELECT * FROM monthly_finances LIMIT 5");
    console.log('MONTHLY_FINANCES:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
checkData();

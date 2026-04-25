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
    const columns = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'seller_payouts'");
    console.table(columns.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

check();

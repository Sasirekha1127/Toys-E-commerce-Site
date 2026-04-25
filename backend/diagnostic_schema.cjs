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
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'customer'");
    console.log('Customer columns:', res.rows.map(r => r.column_name));
    
    const usersRes = await pool.query("SELECT count(*) FROM information_schema.tables WHERE table_name = 'users'");
    console.log('Users table exists:', usersRes.rows[0].count > 0);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
check();

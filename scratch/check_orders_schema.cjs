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
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders'");
    console.log('Orders columns:');
    res.rows.forEach(r => console.log(`- ${r.column_name}: ${r.data_type}`));
    
    const sample = await pool.query("SELECT * FROM orders LIMIT 1");
    console.log('Sample order:', sample.rows[0]);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
check();

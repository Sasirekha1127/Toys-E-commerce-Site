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
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'categories'");
    console.log('Categories columns:');
    res.rows.forEach(r => console.log(`- ${r.column_name}: ${r.data_type}`));
    
    const countRes = await pool.query("SELECT count(*) FROM categories");
    console.log('Total categories:', countRes.rows[0].count);
    
    const sampleRes = await pool.query("SELECT * FROM categories LIMIT 1");
    console.log('Sample category:', sampleRes.rows[0]);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
check();

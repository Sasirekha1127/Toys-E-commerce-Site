import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'sasi',
  port: 5432,
});

async function check() {
  try {
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables in DB:', tables.rows.map(r => r.table_name));

    const ordersCols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'orders'");
    console.log('Columns in orders:', ordersCols.rows.map(r => r.column_name));

    const orderItemsCols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'order_items'");
    console.log('Columns in order_items:', orderItemsCols.rows.map(r => r.column_name));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

check();

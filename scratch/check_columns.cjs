const pg = require('pg');
const pool = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'sasi',
  port: 5432,
});

async function run() {
  try {
    const tables = ['order_coupons', 'coupon_usage', 'order_items', 'orders'];
    for (const table of tables) {
      const res = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table}'`);
      console.log(`Table: ${table}`);
      console.table(res.rows);
    }
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}
run();

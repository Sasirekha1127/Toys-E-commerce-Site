const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  password: 'sasi',
  host: 'localhost',
  port: 5432,
  database: 'local_db'
});

async function checkDb() {
  try {
    const p = await pool.query("SELECT * FROM payments LIMIT 5");
    console.log("PAYMENTS:", p.rows);
    const o = await pool.query("SELECT * FROM orders LIMIT 5");
    console.log("ORDERS:", o.rows.map(x => ({ id: x.id, tax: x.tax_amount, ship: x.shipping_charge, total: x.total_amount, paid_at: x.paid_at, ordered_at: x.ordered_at, pay_status: x.payment_status })));
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
checkDb();

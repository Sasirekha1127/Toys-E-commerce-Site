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
    const orders = await pool.query('SELECT COUNT(*) FROM orders');
    console.log('Orders:', orders.rows[0].count);
    
    const commissions = await pool.query('SELECT COUNT(*) FROM seller_commissions');
    console.log('Commissions:', commissions.rows[0].count);
    
    const payouts = await pool.query('SELECT COUNT(*) FROM seller_payouts');
    console.log('Payouts:', payouts.rows[0].count);
    
    const sampleCommission = await pool.query('SELECT * FROM seller_commissions LIMIT 1');
    console.log('Sample Commission:', sampleCommission.rows[0]);

    const samplePayout = await pool.query('SELECT * FROM seller_payouts LIMIT 1');
    console.log('Sample Payout:', samplePayout.rows[0]);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

check();

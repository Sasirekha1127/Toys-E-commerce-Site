const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'sasi',
  port: 5432,
});

async function checkCoupons() {
  try {
    console.log('--- Coupons Table Schema ---');
    const schema = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'coupons'");
    console.log(JSON.stringify(schema.rows, null, 2));

    console.log('\n--- Coupons Data ---');
    const data = await pool.query("SELECT * FROM coupons");
    console.log(JSON.stringify(data.rows, null, 2));

    console.log('\n--- Checking Joins with Products ---');
    const joinCheck = await pool.query(`
      SELECT c.code, c.product_id, COALESCE(p.name, p.title) as product_name, p.sku as product_sku
      FROM coupons c
      LEFT JOIN products p ON c.product_id::text = p.product_id::text
    `);
    console.table(joinCheck.rows);

    console.log('\n--- Sample Products ---');
    const products = await pool.query("SELECT product_id, name, title, sku, category FROM products LIMIT 10");
    console.table(products.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkCoupons();

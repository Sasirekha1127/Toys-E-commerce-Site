const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'sasi',
  port: 5432
});

async function run() {
  try {
    const v = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'product_variants'");
    const i = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'product_images'");
    const p = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products'");
    console.log('product_variants:', v.rows);
    console.log('product_images:', i.rows);
    console.log('products:', p.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();

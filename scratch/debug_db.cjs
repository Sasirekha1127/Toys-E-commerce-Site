const pg = require('pg');
const pool = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'sasi',
  port: 5432
});

async function run() {
  try {
    const res = await pool.query("SELECT id, product_id, title FROM products LIMIT 5");
    console.log("RECENT PRODUCTS:");
    console.table(res.rows);

    for (const p of res.rows) {
      const v = await pool.query("SELECT * FROM product_variants WHERE product_id = $1", [p.product_id]);
      const v2 = await pool.query("SELECT * FROM product_variants WHERE product_id::text = $1", [p.id]);
      console.log(`Product: ${p.id} (${p.product_id}) -> Variants (by UUID): ${v.rows.length}, Variants (by Custom ID): ${v2.rows.length}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();

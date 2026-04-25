const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'sasi',
  port: 5432,
});

async function test() {
  try {
    const res = await pool.query(`
      SELECT 
        o.id as order_id, 
        p.pid as product_pid,
        item->>'id' as item_id,
        item->>'product_id' as item_product_id
      FROM orders o,
      jsonb_array_elements(CASE WHEN jsonb_typeof(o.items) = 'array' THEN o.items ELSE '[]'::jsonb END) AS item
      JOIN products p ON p.id = (item->>'id') OR p.product_id::text = (item->>'id') OR p.product_id::text = (item->>'product_id')
      WHERE o.id IN (32, 33, 34)
    `);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

test();

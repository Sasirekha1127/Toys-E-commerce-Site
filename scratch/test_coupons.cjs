const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'sasi',
  port: 5432,
});

async function testQuery() {
  try {
    const baseQuery = `
      SELECT c.*, p.name AS product_name, p.sku AS product_sku
      FROM coupons c
      LEFT JOIN products p ON c.product_id::text = p.product_id::text OR c.product_id = p.id
    `;
    console.log("Executing query...");
    const result = await pool.query(`${baseQuery} ORDER BY c.created_at DESC`);
    console.log(`Success! Found ${result.rows.length} rows.`);
    console.log(result.rows);
  } catch (err) {
    console.error("Query failed:", err);
  } finally {
    await pool.end();
  }
}

testQuery();

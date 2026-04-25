const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  password: 'sasi',
  host: 'localhost',
  port: 5432,
  database: 'local_db'
});

async function checkConstraints() {
  try {
    const res = await pool.query(`
      SELECT conname, contype, am.amname as method
      FROM pg_constraint c
      JOIN pg_class t ON c.conrelid = t.oid
      LEFT JOIN pg_am am ON c.contype = 'u' AND am.oid = 0 -- just a placeholder
      WHERE t.relname = 'categories'
    `);
    console.log('CONSTRAINTS:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
checkConstraints();

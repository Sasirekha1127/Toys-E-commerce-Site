import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'sasi',
  port: 5432,
});

async function run() {
  const res = await pool.query(`
    SELECT id, title, price FROM products LIMIT 20;
  `);
  console.table(res.rows);
  pool.end();
}
run();

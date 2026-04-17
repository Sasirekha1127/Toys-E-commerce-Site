import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'sasi',
  port: 5432,
});

async function dumpUsers() {
  try {
    const res = await pool.query('SELECT id, name, email, phone, address FROM users');
    console.log('--- Users Table Content ---');
    console.table(res.rows);
  } catch (err) {
    console.error('Error dumping users:', err);
  } finally {
    await pool.end();
  }
}

dumpUsers();

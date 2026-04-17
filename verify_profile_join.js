import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'sasi',
  port: 5432,
});

async function verify() {
  try {
    const res = await pool.query(`
      SELECT 
        u.id, u.name, u.email, 
        p.phone, p.address, p.bio, p.birthdate
      FROM users u
      LEFT JOIN profile_page p ON u.id = p.user_id
      LIMIT 5
    `);
    console.log('--- Joined Profile Data (Top 5) ---');
    console.table(res.rows);
  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    await pool.end();
  }
}

verify();

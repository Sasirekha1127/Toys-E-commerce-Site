import pg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'sasi',
  port: 5432,
});

async function checkUser() {
  try {
    const email = 'sasi@gmail.com';
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      console.log(`User ${email} does not exist. Creating...`);
      const hashedPassword = await bcrypt.hash('Sasi@1234', 10);
      await pool.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
        ['Sasi', email, hashedPassword]
      );
      console.log('User created successfully.');
    } else {
      console.log(`User ${email} already exists.`);
      // Update password just in case
      const hashedPassword = await bcrypt.hash('Sasi@1234', 10);
      await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);
      console.log('Password updated for sasi@gmail.com');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkUser();

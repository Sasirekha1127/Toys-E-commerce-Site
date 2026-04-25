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

async function createTestUser() {
  const email = 'testuser@example.com';
  const password = 'password123';
  const name = 'Test User';
  const phone = '9876543210';
  const address = '123 Test St';

  try {
    const existing = await pool.query('SELECT customer_id FROM customer WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      console.log('User already exists:', email);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const customer_id = 'CUS999'; // Dedicated test ID

    await pool.query('BEGIN');
    
    await pool.query(
      "INSERT INTO customer (customer_id, name, email, password) VALUES ($1, $2, $3, $4)",
      [customer_id, name, email, hashedPassword]
    );

    await pool.query(
      `INSERT INTO profile_page (customer_id, phone, address) VALUES ($1, $2, $3)`,
      [customer_id, phone, address]
    );

    await pool.query('COMMIT');
    console.log('Test user created successfully:', email);
  } catch (err) {
    console.error('Error creating test user:', err.message);
  } finally {
    await pool.end();
  }
}

createTestUser();

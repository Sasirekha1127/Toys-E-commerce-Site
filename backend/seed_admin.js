import pg from 'pg';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'sasi',
  port: 5432,
});

async function runSetup() {
  try {
    console.log('--- Starting Database Setup ---');

    // 1. Run Schema Initialization
    const schemaPath = path.join(__dirname, 'init_db.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('Reading init_db.sql...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(schemaSql);
      console.log('✅ Database schema initialized/verified.');
    } else {
      console.warn('⚠️ init_db.sql not found. Skipping schema initialization.');
    }

    // 2. Seed Admin User
    const adminEmail = 'admin@toystore.com';
    const adminPass = 'admin123';

    console.log(`Checking for admin: ${adminEmail}...`);
    const existing = await pool.query('SELECT id FROM admins WHERE email = $1', [adminEmail]);

    if (existing.rows.length === 0) {
      const hashedPass = await bcrypt.hash(adminPass, 10);
      await pool.query(
        'INSERT INTO admins (email, password) VALUES ($1, $2)',
        [adminEmail, hashedPass]
      );
      console.log('✅ Initial admin account created successfully.');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPass}`);
    } else {
      console.log('ℹ️ Admin account already exists. Skipping seeding.');
    }

    console.log('--- Setup Complete ---');
  } catch (err) {
    console.error('❌ Error during setup:', err);
  } finally {
    await pool.end();
  }
}

runSetup();

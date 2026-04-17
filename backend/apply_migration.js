import pg from 'pg';
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

async function applyMigration() {
  try {
    const migrationPath = path.join(__dirname, 'migration_cart_metadata.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Running migration...');
    await pool.query(sql);
    console.log(' Migration successful: Added metadata columns to cart_items.');
  } catch (err) {
    console.error(' Migration failed:', err);
  } finally {
    await pool.end();
  }
}

applyMigration();

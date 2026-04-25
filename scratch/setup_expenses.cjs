const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  password: 'sasi',
  host: 'localhost',
  port: 5432,
  database: 'local_db'
});

async function setupAndSeed() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        category TEXT,
        amount DECIMAL(12,2),
        description TEXT,
        date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query("INSERT INTO expenses (category, amount, description) VALUES ('Marketing', 5000, 'Social media ads'), ('Inventory', 12000, 'Restocking soft toys'), ('Salaries', 8000, 'Staff monthly pay')");
    console.log('Expenses table created and seeded');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
setupAndSeed();

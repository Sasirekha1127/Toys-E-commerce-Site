const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  password: 'sasi',
  host: 'localhost',
  port: 5432,
  database: 'local_db'
});

async function seedExpenses() {
  try {
    await pool.query("INSERT INTO expenses (category, amount, description) VALUES ('Marketing', 5000, 'Social media ads'), ('Inventory', 12000, 'Restocking soft toys'), ('Salaries', 8000, 'Staff monthly pay')");
    console.log('Expenses seeded');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
seedExpenses();

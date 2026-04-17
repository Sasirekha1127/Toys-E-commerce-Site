import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'sasi',
  port: 5432,
});

async function checkTable() {
  try {
    const tables = ['carts'];
    for (const table of tables) {
      console.log(`\n--- ${table.toUpperCase()} TABLE ---`);
      const cols = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1;
      `, [table]);
      console.log('Columns:');
      cols.rows.forEach(row => console.log(`- ${row.column_name}: ${row.data_type}`));

      const data = await pool.query(`SELECT * FROM ${table} LIMIT 5`);
      console.log('Data (sample):');
      console.table(data.rows);
    }
  } catch (err) {
    console.error('Error checking table:', err);
  } finally {
    await pool.end();
  }
}

checkTable();

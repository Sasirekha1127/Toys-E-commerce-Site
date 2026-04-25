const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  password: 'sasi',
  host: 'localhost',
  port: 5432,
  database: 'local_db'
});

pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
  .then(res => {
    console.log("TABLES:", res.rows.map(r => r.table_name));
    pool.end();
  })
  .catch(err => {
    console.error(err);
    pool.end();
  });

const { Pool } = require('pg');
const pool = new Pool({ user: 'postgres', password: 'password', host: 'localhost', port: 5432, database: 'local_db' });
pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'wishlist_page'")
  .then(r => { console.table(r.rows); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); });
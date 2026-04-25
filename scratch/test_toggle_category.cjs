const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'sasi',
  port: 5432,
});

async function testToggle() {
  try {
    const res = await pool.query("SELECT * FROM categories LIMIT 1");
    const cat = res.rows[0];
    if (!cat) {
      console.log('No categories found.');
      return;
    }
    console.log('Initial category:', cat.name, 'is_active:', cat.is_active);
    
    // Simulate toggle
    const id = cat.category_id;
    const newActive = !cat.is_active;
    
    console.log(`Toggling ${cat.name} to ${newActive}...`);
    
    // We can't easily call the API from here without fetch, so we'll simulate the SQL
    // that the API would run.
    const fields = { is_active: newActive };
    const updates = [];
    const values = [];
    let idx = 1;

    Object.keys(fields).forEach(key => {
      if (fields[key] !== undefined) {
        updates.push(`${key} = $${idx}`);
        values.push(fields[key]);
        idx++;
      }
    });
    values.push(id);
    const query = `UPDATE categories SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE category_id = $${idx} RETURNING *`;
    
    const result = await pool.query(query, values);
    const updatedCat = result.rows[0];
    
    console.log('Updated category:', updatedCat.name, 'is_active:', updatedCat.is_active);
    
    if (updatedCat.name === null) {
      console.error('ERROR: Name became NULL!');
    } else {
      console.log('SUCCESS: Name preserved.');
    }
    
    // Toggle back
    await pool.query(`UPDATE categories SET is_active = $1 WHERE category_id = $2`, [cat.is_active, id]);
    
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
testToggle();

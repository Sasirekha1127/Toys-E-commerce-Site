const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/local_db'
});

async function checkAndFix() {
  const brokenId = '61yBuPQZ7QL';
  const newPath = '/images/rc_car.png';

  try {
    console.log(`Checking for '${brokenId}' in products table...`);
    const res = await pool.query("SELECT id, name, image FROM products WHERE image LIKE $1", [`%${brokenId}%`]);
    
    if (res.rows.length > 0) {
      console.log('Found broken links in products:', res.rows);
      for (const row of res.rows) {
        await pool.query("UPDATE products SET image = $1 WHERE id = $2", [newPath, row.id]);
        console.log(`Updated product ${row.id}`);
      }
    } else {
      console.log('No matches found in products table.');
    }

    console.log(`Checking for '${brokenId}' in product_images table...`);
    const resImg = await pool.query("SELECT id, product_id, image_url FROM product_images WHERE image_url LIKE $1", [`%${brokenId}%`]);
    
    if (resImg.rows.length > 0) {
      console.log('Found broken links in product_images:', resImg.rows);
      for (const row of resImg.rows) {
        await pool.query("UPDATE product_images SET image_url = $1 WHERE id = $2", [newPath, row.id]);
        console.log(`Updated image ${row.id}`);
      }
    } else {
      console.log('No matches found in product_images table.');
    }

  } catch (err) {
    console.error('Database error:', err);
  } finally {
    await pool.end();
  }
}

checkAndFix();

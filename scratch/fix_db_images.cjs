const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'sasi',
  port: 5432
});

async function fixDbImages() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Select products to see what needs fixing
    const res = await client.query('SELECT product_id, image_urls, image_url FROM products');
    let fixedCount = 0;

    for (const row of res.rows) {
      let needsFix = false;
      let cleanUrls = [];

      // Check image_urls
      if (Array.isArray(row.image_urls)) {
        cleanUrls = row.image_urls.filter(u => u && typeof u === 'string' && u.trim() !== '');
      } else if (typeof row.image_urls === 'string' && row.image_urls.trim() !== '') {
        cleanUrls = [row.image_urls.trim()];
      }

      // If array is empty, we check image_url
      if (cleanUrls.length === 0) {
        if (row.image_url && typeof row.image_url === 'string' && row.image_url.trim() !== '') {
          cleanUrls = [row.image_url.trim()];
          needsFix = true; // Needs to be moved to image_urls
        } else {
          cleanUrls = ['https://placehold.co/400x400/f3f4f6/a1a1aa?text=No+Image'];
          needsFix = true;
        }
      } else if (JSON.stringify(cleanUrls) !== JSON.stringify(row.image_urls)) {
        needsFix = true; // Was dirty (contained empty strings, nulls, etc.)
      }
      
      // Check if image_url itself needs fixing (even if image_urls was okay)
      let finalImageUrl = cleanUrls[0];
      if (row.image_url !== finalImageUrl) {
          needsFix = true;
      }

      if (needsFix) {
        await client.query(
          'UPDATE products SET image_urls = $1, image_url = $2 WHERE product_id = $3',
          [cleanUrls, finalImageUrl, row.product_id]
        );
        fixedCount++;
      }
    }

    await client.query('COMMIT');
    console.log(`Successfully fixed images for ${fixedCount} products in the database.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error fixing db images:', err);
  } finally {
    client.release();
    pool.end();
  }
}

fixDbImages();

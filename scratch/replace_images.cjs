const { Pool } = require('pg');
const pool = new Pool({ user: 'postgres', host: 'localhost', database: 'local_db', password: 'sasi', port: 5432 });

const placeholder = 'https://placehold.co/400x400/f3f4f6/a1a1aa?text=Toy+Image';

async function run() {
  try {
    const brokenUrl = 'https://m.media-amazon.com/images/I/71a8dFnJLjL._AC_UF894,1000_QL80_.jpg';
    const workingUrl = 'https://m.media-amazon.com/images/I/81+mUfV5nBL._AC_SL1500_.jpg';

    const res1 = await pool.query(`UPDATE products SET image_url = $1 WHERE image_url = $2`, [workingUrl, brokenUrl]);
    console.log('Updated products.image_url:', res1.rowCount);
    
    // For image_urls array, we use jsonb_set or similar if it's jsonb, or array_replace if it's text array
    // Let's use a broad UPDATE with string replacement to be safe for any format
    const res2 = await pool.query(`
      UPDATE products 
      SET image_urls = array_replace(image_urls, $1, $2) 
      WHERE $1 = ANY(image_urls)
    `, [brokenUrl, workingUrl]);
    console.log('Updated products.image_urls:', res2.rowCount);

    // Also update product_images table
    const res3 = await pool.query(`UPDATE product_images SET image_url = $1 WHERE image_url = $2`, [workingUrl, brokenUrl]);
    console.log('Updated product_images.image_url:', res3.rowCount);

    process.exit(0);
  } catch(err) {
    console.error(err);
    process.exit(1);
  }
}

run();

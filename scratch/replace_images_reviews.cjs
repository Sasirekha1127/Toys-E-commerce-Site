const { Pool } = require('pg');
const pool = new Pool({ user: 'postgres', host: 'localhost', database: 'local_db', password: 'sasi', port: 5432 });

const placeholder = 'https://placehold.co/400x400/f3f4f6/a1a1aa?text=Toy+Image';

async function run() {
  try {
    // Some reviews might have product_image or images array.
    // Let's check what columns exist in reviews.
    const res = await pool.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1', ['reviews']);
    const cols = res.rows.map(r => r.column_name);
    
    if (cols.includes('product_image')) {
      const r1 = await pool.query(`UPDATE reviews SET product_image = $1 WHERE product_image LIKE '%amazon.com%'`, [placeholder]);
      console.log('Updated reviews.product_image:', r1.rowCount);
    }
    
    if (cols.includes('images')) {
       // If images is an array of text
       try {
           const r2 = await pool.query(`UPDATE reviews SET images = array_replace(images, images[1], $1) WHERE images::text LIKE '%amazon.com%'`, [placeholder]);
           console.log('Updated reviews.images:', r2.rowCount);
       } catch(e) {
           console.log('Could not update reviews.images:', e.message);
       }
    }

    process.exit(0);
  } catch(err) {
    console.error(err);
    process.exit(1);
  }
}

run();

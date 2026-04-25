const pg = require('pg');
const pool = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'sasi',
  port: 5432
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    console.log('Cleanup...');
    await client.query('DELETE FROM product_variants');
    await client.query("DELETE FROM product_images WHERE variant_reference IS NOT NULL");
    
    console.log('Inserting variants...');
    await client.query(`
      INSERT INTO product_variants (product_id, variant_name, variant_value, price, stock_quantity, sku)
      SELECT product_id, 'Color', 'Default Blue', COALESCE(price, 0), CASE WHEN stock_quantity = 0 THEN 25 ELSE stock_quantity END, CONCAT(id, '-BLUE') FROM products;
      INSERT INTO product_variants (product_id, variant_name, variant_value, price, stock_quantity, sku)
      SELECT product_id, 'Color', 'Classic Red', COALESCE(price, 0), CASE WHEN stock_quantity = 0 THEN 15 ELSE stock_quantity END, CONCAT(id, '-RED') FROM products;
    `);

    console.log('Mapping images...');
    await client.query(`
      INSERT INTO product_images (product_id, image_url, is_primary, variant_reference, image_type)
      SELECT pv.product_id, p.image_urls[1], false, pv.sku, 'gallery'
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.product_id
      WHERE pv.sku LIKE '%-BLUE' AND array_length(p.image_urls, 1) >= 1;

      INSERT INTO product_images (product_id, image_url, is_primary, variant_reference, image_type)
      SELECT pv.product_id, COALESCE(p.image_urls[2], p.image_urls[1]), false, pv.sku, 'gallery'
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.product_id
      WHERE pv.sku LIKE '%-RED' AND array_length(p.image_urls, 1) >= 1;
    `);

    console.log('High-quality overrides...');
    await client.query(`
      UPDATE product_images SET image_url = '/uploads/products/blue_teddy.png' WHERE variant_reference = 'SOFT001-BLUE';
      UPDATE product_images SET image_url = '/uploads/products/red_teddy.png' WHERE variant_reference = 'SOFT001-RED';
      UPDATE product_images SET image_url = '/uploads/products/blue_elephant.png' WHERE variant_reference = 'SOFT004-BLUE';
      UPDATE product_images SET image_url = '/uploads/products/red_elephant.png' WHERE variant_reference = 'SOFT004-RED';
    `);

    await client.query('COMMIT');
    console.log('Sync successful');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Sync failed:', e);
  } finally {
    client.release();
    pool.end();
  }
}

run();

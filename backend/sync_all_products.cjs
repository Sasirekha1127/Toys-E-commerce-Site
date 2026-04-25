const fs = require('fs');
const path = require('path');
const pg = require('pg');

const pool = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'sasi',
  port: 5432
});

const dataDir = path.join(__dirname, '../src/data/user');
const files = ['softToys.js', 'educationalToys.js', 'electronicToys.js', 'woodenToys.js'];

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Ensure 'id' is unique for our upsert
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'products_id_key'
        ) THEN
          ALTER TABLE products ADD CONSTRAINT products_id_key UNIQUE (id);
        END IF;
      END $$;
    `);

    for (const file of files) {
      const filePath = path.join(dataDir, file);
      if (!fs.existsSync(filePath)) continue;

      console.log(`Processing ${file}...`);
      let content = fs.readFileSync(filePath, 'utf8');

      // Simple regex to extract objects from the array
      // This is a bit risky but we can try to find { id: '...', ... } blocks
      const productRegex = /\{[\s\S]*?id:\s*['"]([^'"]+)['"][\s\S]*?\}/g;
      let match;
      while ((match = productRegex.exec(content)) !== null) {
        const productText = match[0];
        const id = match[1];

        // Extract basic info
        const nameMatch = productText.match(/name:\s*["']([^"']+)["']/);
        const descriptionMatch = productText.match(/description:\s*[`"']([\s\S]*?)[`"']/);
        const priceMatch = productText.match(/price:\s*["']?(\d+)["']?/);
        const imageMatch = productText.match(/image:\s*["']([^"']+)["']/);
        const categoryMatch = productText.match(/category:\s*["']([^"']+)["']/);

        const name = nameMatch ? nameMatch[1] : 'Unknown';
        const description = descriptionMatch ? descriptionMatch[1].trim() : '';
        const price = priceMatch ? parseFloat(priceMatch[1]) : 0;
        const image = imageMatch ? imageMatch[1] : '';
        const category = categoryMatch ? categoryMatch[1] : 'Uncategorized';

        // Upsert product
        // We use a generated UUID if it doesn't exist, but we should keep it consistent if possible.
        // For now, let's just use a hash or just let the DB handle it if we can't find it.
        
        await client.query(`
          INSERT INTO products (id, title, description, price, stock_quantity, category, image_urls, is_active)
          VALUES ($1, $2, $3, $4, 50, $5, $6, true)
          ON CONFLICT (id) DO UPDATE 
          SET title = EXCLUDED.title, description = EXCLUDED.description, price = EXCLUDED.price, 
              category = EXCLUDED.category, image_urls = EXCLUDED.image_urls
        `, [id, name, description, price, category, [image]]);
      }
    }

    await client.query('COMMIT');
    console.log('Product sync successful');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Product sync failed:', e);
  } finally {
    client.release();
    pool.end();
  }
}

run();

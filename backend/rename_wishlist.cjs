const fs = require('fs');
let b = fs.readFileSync('server.js', 'utf8');
b = b.replace(/wishlist_page/g, 'wishlist_items');
b = b.replace(/console\.log\('\[Schema\] Step 1/, "await client.query('ALTER TABLE IF EXISTS wishlist_page RENAME TO wishlist_items;');\n    console.log('[Schema] Step 1");
fs.writeFileSync('server.js', b);
console.log('Renamed wishlist_page to wishlist_items');

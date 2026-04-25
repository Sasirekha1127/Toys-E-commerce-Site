const { Pool } = require('pg');
const pool = new Pool({ user: 'postgres', host: 'localhost', database: 'local_db', password: 'sasi', port: 5432 });

const query = `
  SELECT s.*, 
         COALESCE(sp.store_name, s.name) as store_name,
         sp.contact_number, sp.business_type,
         (SELECT COUNT(*) FROM products p WHERE p.seller_id = s.seller_id) as total_products
  FROM sellers s
  LEFT JOIN seller_profile sp ON s.seller_id = sp.seller_id
  ORDER BY s.created_at DESC
`;

pool.query(query).then(res => { 
  console.log('Query successful'); 
  process.exit(0); 
}).catch(err => { 
  console.error(err); 
  process.exit(1); 
});

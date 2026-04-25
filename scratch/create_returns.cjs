const { Pool } = require('pg');
const pool = new Pool({ user: 'postgres', host: 'localhost', database: 'local_db', password: 'sasi', port: 5432 });

const sql = `
  CREATE TABLE return_requests (
    return_request_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id        INTEGER,
    customer_id          VARCHAR(255),
    order_id             INTEGER,
    resolved_by_admin_id UUID,
    reason               TEXT,
    return_type          VARCHAR(100),
    refund_amount        DECIMAL(10,2),
    refund_status        refund_status_enum,
    resolution_note      TEXT,
    requested_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at          TIMESTAMP
  );
`;

pool.query(sql).then(res => { 
  console.log('Created return_requests'); 
  process.exit(0); 
}).catch(err => { 
  console.error(err); 
  process.exit(1); 
});

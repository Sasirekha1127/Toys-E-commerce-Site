const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'sasi',
  port: 5432,
});

const categories = [
  { name:'Soft Toys', icon:'🧸', products:6, is_active:true, description:'Plush and cuddly toys for all ages', age_range:'0–8 yrs', slug: 'soft-toys' },
  { name:'Educational Toys', icon:'🔬', products:6, is_active:true, description:'STEM and learning toys to spark curiosity', age_range:'3–12 yrs', slug: 'educational-toys' },
  { name:'Electronic Toys', icon:'🤖', products:6, is_active:true, description:'Tech-powered toys with lights and sound', age_range:'5–14 yrs', slug: 'electronic-toys' },
  { name:'0–2 Years', icon:'🍼', products:4, is_active:true, description:'Safe soft toys for babies and toddlers', age_range:'0–2 yrs', slug: '0-2-years' },
  { name:'3–5 Years', icon:'🎨', products:9, is_active:true, description:'Creative and imaginative play toys', age_range:'3–5 yrs', slug: '3-5-years' },
  { name:'6–12 Years', icon:'🏗️', products:8, is_active:true, description:'Building, science, and adventure toys', age_range:'6–12 yrs', slug: '6-12-years' },
];

async function seed() {
  try {
    console.log('Clearing existing categories...');
    await pool.query('DELETE FROM categories');
    
    console.log('Seeding categories...');
    for (const c of categories) {
      await pool.query(
        `INSERT INTO categories (name, slug, icon, description, age_range, is_active) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [c.name, c.slug, c.icon, c.description, c.age_range, c.is_active]
      );
    }
    console.log('Seeding complete.');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await pool.end();
  }
}

seed();

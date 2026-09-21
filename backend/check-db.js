const { Client } = require('pg');
require('dotenv').config();

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  const res = await client.query(`
    SELECT count(*) FROM "Product" p 
    JOIN "Category" c ON p."categoryId" = c.id
    WHERE c.slug = 'laptops' AND p.status = 'ACTIVE'
  `);
  console.log(`Active laptops: ${res.rows[0].count}`);
  
  const c = await client.query(`SELECT count(*) FROM "Collection"`);
  console.log(`Collections: ${c.rows[0].count}`);
  
  const pc = await client.query(`SELECT count(*) FROM "ProductCollection"`);
  console.log(`ProductCollections: ${pc.rows[0].count}`);
  
  await client.end();
}
main().catch(console.error);

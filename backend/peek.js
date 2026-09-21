const { Client } = require('pg');
require('dotenv').config();

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  const res = await client.query(`
    SELECT p.name, p.tags, p."shortDescription" 
    FROM "Product" p 
    JOIN "Category" c ON p."categoryId" = c.id 
    WHERE c.slug = 'laptops' AND p.status = 'ACTIVE'
    LIMIT 3
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}
main().catch(console.error);

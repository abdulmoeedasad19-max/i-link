const { Client } = require('pg');
require('dotenv').config();

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  const cCount = await client.query(`SELECT count(*) FROM "Collection"`);
  console.log(`Collections: ${cCount.rows[0].count}`);
  
  const pcCount = await client.query(`SELECT count(*) FROM "ProductCollection"`);
  console.log(`ProductCollections: ${pcCount.rows[0].count}`);
  
  const activeCount = await client.query(`SELECT count(*) FROM "Product" p JOIN "Category" c ON p."categoryId" = c.id WHERE c.slug = 'laptops' AND p.status = 'ACTIVE'`);
  console.log(`Active Laptops: ${activeCount.rows[0].count}`);
  
  const byCollection = await client.query(`
    SELECT c.slug, count(pc."productId") as pc_count 
    FROM "Collection" c 
    LEFT JOIN "ProductCollection" pc ON c.id = pc."collectionId" 
    JOIN "Product" p ON pc."productId" = p.id
    WHERE p.status = 'ACTIVE'
    GROUP BY c.slug
  `);
  console.log("Active Product Counts by collection:");
  console.table(byCollection.rows);
  
  await client.end();
}
main().catch(console.error);

const { Client } = require('pg');
require('dotenv').config();

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  const id = 'f01ba289-fef4-45bf-a1d4-5afd9953fe0e';
  
  const before = await client.query(`SELECT status FROM "Product" WHERE id = $1`, [id]);
  console.log(`Status before: ${before.rows[0].status}`);
  
  await client.query(`UPDATE "Product" SET status = 'ARCHIVED' WHERE id = $1`, [id]);
  
  const after = await client.query(`SELECT status FROM "Product" WHERE id = $1`, [id]);
  console.log(`Status after: ${after.rows[0].status}`);
  
  const activeCount = await client.query(`SELECT count(*) FROM "Product" WHERE status = 'ACTIVE'`);
  console.log(`Total active products now: ${activeCount.rows[0].count}`);
  
  const colCount = await client.query(`SELECT count(*) FROM "Collection"`);
  const pcCount = await client.query(`SELECT count(*) FROM "ProductCollection"`);
  console.log(`Collections: ${colCount.rows[0].count}`);
  console.log(`ProductCollections: ${pcCount.rows[0].count}`);
  
  await client.end();
}
main().catch(console.error);

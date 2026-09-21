const { Client } = require('pg');
require('dotenv').config();

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  const res = await client.query(`
    SELECT p.id, p.name, p.sku, p.price, p.stock, p.tags, p."shortDescription", p.description, 
           b.name as brand_name, p."seoTitle", p."seoDescription"
    FROM "Product" p 
    LEFT JOIN "Brand" b ON p."brandId" = b.id
    WHERE p.name IN (
      'ASUS ROG Zephyrus G14',
      'Lenovo ThinkPad X1 Carbon Gen 11',
      'Dell XPS 13 9310',
      'HP EliteBook 840 G9'
    )
  `);
  
  console.log(JSON.stringify(res.rows, null, 2));
  
  await client.end();
}
main().catch(console.error);

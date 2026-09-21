import { Client } from 'pg';
import 'dotenv/config';

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  // Get Laptops Category ID
  const catRes = await client.query('SELECT id FROM "Category" WHERE slug = $1', ['laptops']);
  const laptopId = catRes.rows[0].id;
  
  // Insert new collections
  await client.query(
    'INSERT INTO "Collection" (id, name, slug, "categoryId", "updatedAt") VALUES ($1, $2, $3, $4, NOW()) ON CONFLICT (slug) DO NOTHING',
    ['cuid_prog', 'Programming & Coding Laptops', 'programming', laptopId]
  );
  await client.query(
    'INSERT INTO "Collection" (id, name, slug, "categoryId", "updatedAt") VALUES ($1, $2, $3, $4, NOW()) ON CONFLICT (slug) DO NOTHING',
    ['cuid_game', 'Gaming Laptops', 'gaming', laptopId]
  );
  
  // Verify state
  const colRes = await client.query('SELECT * FROM "Collection" ORDER BY "createdAt" ASC');
  console.log('Collections:', colRes.rowCount);
  colRes.rows.forEach(r => console.log('- ' + r.name + ' (' + r.slug + ')'));

  const pColRes = await client.query('SELECT COUNT(*) FROM "ProductCollection"');
  console.log('ProductCollections:', pColRes.rows[0].count);

  await client.end();
}

main().catch(console.error);

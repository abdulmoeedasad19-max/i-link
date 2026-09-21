import { Client } from 'pg';
import 'dotenv/config';

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  const colRes = await client.query('SELECT * FROM "Collection"');
  console.log('Collections:', colRes.rowCount);
  colRes.rows.forEach(r => console.log('- ' + r.name + ' (' + r.slug + ')'));

  const pColRes = await client.query('SELECT COUNT(*) FROM "ProductCollection"');
  console.log('ProductCollections:', pColRes.rows[0].count);

  await client.end();
}

main().catch(console.error);

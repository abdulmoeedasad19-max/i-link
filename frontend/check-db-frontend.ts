import { db } from './src/lib/db';

async function main() {
  // @ts-ignore
  const collections = await db.collection.findMany();
  // @ts-ignore
  const productCollections = await db.productCollection.count();
  
  console.log('--- DATABASE STATE ---');
  console.log('Total Collections: ' + collections.length);
  // @ts-ignore
  collections.forEach(c => console.log('- ' + c.name + ' (Slug: ' + c.slug + ', CategoryID: ' + c.categoryId + ')'));
  console.log('Total ProductCollection records: ' + productCollections);
}

main().catch(console.error).finally(() => process.exit(0));

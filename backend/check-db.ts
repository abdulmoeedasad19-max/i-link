import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const collections = await prisma.collection.findMany();
  const productCollections = await prisma.productCollection.count();
  
  console.log('--- DATABASE STATE ---');
  console.log('Total Collections: ' + collections.length);
  collections.forEach(c => console.log('- ' + c.name + ' (Slug: ' + c.slug + ', CategoryID: ' + c.categoryId + ')'));
  console.log('Total ProductCollection records: ' + productCollections);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

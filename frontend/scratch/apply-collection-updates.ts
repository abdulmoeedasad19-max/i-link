import 'dotenv/config';
import { db } from "../src/lib/db";
import * as fs from 'fs';

async function main() {
  const updates = JSON.parse(fs.readFileSync('scratch/collection-updates.json', 'utf8'));

  for (const update of updates) {
    // Delete all existing collections for this product
    await db.productCollection.deleteMany({
      where: { productId: update.id }
    });
    
    // Add new collections back
    if (update.collectionIds.length > 0) {
      await db.productCollection.createMany({
        data: update.collectionIds.map(cid => ({
          productId: update.id,
          collectionId: cid
        }))
      });
    }
    
    console.log(`Updated collections for ${update.name}`);
  }

  console.log('Collection updates applied successfully.');
}

main().catch(console.error).finally(() => db.$disconnect());


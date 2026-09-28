import 'dotenv/config';
import { db } from "../src/lib/db";
import * as fs from 'fs';

async function main() {
  const updatesPath = process.argv[2] || 'scratch/updates.json';
  if (!fs.existsSync(updatesPath)) {
    console.error(`Updates file not found at ${updatesPath}`);
    return;
  }

  const updates = JSON.parse(fs.readFileSync(updatesPath, 'utf-8'));
  console.log(`Applying updates for ${updates.length} products...`);

  for (const update of updates) {
    const { 
      id, 
      oldSlug, 
      slug, 
      name, 
      shortDescription, 
      description, 
      tags, 
      seoTitle, 
      seoDescription,
      collections, // array of collection IDs
      imageUpdates // array of { id: string, altText: string }
    } = update;

    // 1. Handle slug change and redirects
    if (slug && slug !== oldSlug) {
      // Check if old slug is already in redirects
      const existingRedirect = await db.productRedirect.findUnique({
        where: { oldSlug: oldSlug }
      });
      
      if (!existingRedirect) {
        await db.productRedirect.create({
          data: {
            oldSlug: oldSlug,
            productId: id
          }
        });
      }
    }

    // 2. Update product fields
    await db.product.update({
      where: { id },
      data: {
        name: name || undefined,
        slug: slug || undefined,
        shortDescription: shortDescription || undefined,
        description: description || undefined,
        tags: tags || undefined,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
      }
    });

    // 3. Update collections
    if (collections && Array.isArray(collections)) {
      // Clear existing
      await db.productCollection.deleteMany({
        where: { productId: id }
      });
      // Add new
      if (collections.length > 0) {
        await db.productCollection.createMany({
          data: collections.map(collectionId => ({
            productId: id,
            collectionId: collectionId
          }))
        });
      }
    }

    // 4. Update image alt texts
    if (imageUpdates && Array.isArray(imageUpdates)) {
      for (const img of imageUpdates) {
        await db.productImage.update({
          where: { id: img.id },
          data: { altText: img.altText }
        });
      }
    }

    console.log(`Updated product: ${id}`);
  }

  console.log("All updates applied successfully.");
}

main().catch(console.error).finally(() => db.$disconnect());


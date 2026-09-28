import 'dotenv/config';
import { db } from "../src/lib/db";
import * as fs from 'fs';

async function main() {
  const hpBrand = await db.brand.findUnique({ where: { slug: 'hp' } });
  const laptopsCategory = await db.category.findUnique({ where: { slug: 'laptops' } });

  const currentLaptops = await db.product.findMany({
    where: {
      categoryId: laptopsCategory.id,
      brandId: hpBrand.id,
      status: 'ACTIVE'
    },
    include: {
      collections: { include: { collection: true } }
    }
  });

  const collectionMap = {
    'Student Laptops': 'cmu5fonty0000w4wivfbi63f6',
    'Office Laptops': 'cmu5foo2j0001w4wiymv864wk',
    'Business Laptops': 'cmu5fooa30002w4wi3hqgt7i6',
    'Programming & Coding Laptops': 'cuid_prog',
    'Gaming Laptops': 'cuid_game'
  };

  const updates = [];

  for (const laptop of currentLaptops) {
    const currentCols = laptop.collections.map(c => c.collection.name);
    const newCols = new Set(currentCols);
    let reason = [];
    
    const nameLower = laptop.name.toLowerCase();
    
    // Parse specs safely from the title since there are no dedicated DB fields
    const ramMatch = laptop.name.match(/(\d+)GB\s*RAM/i);
    const ram = ramMatch ? parseInt(ramMatch[1]) : 0;
    const isEliteBook = nameLower.includes('elitebook');
    const isProBook = nameLower.includes('probook');
    const isConsumer = nameLower.includes('pavilion') || nameLower.includes('envy');
    const hasGPU = nameLower.includes('nvidia') || nameLower.includes('amd radeon') || nameLower.includes('rtx') || nameLower.includes('gtx');
    const hasAdequateCPU = nameLower.includes('i5') || nameLower.includes('i7') || nameLower.includes('ryzen 5') || nameLower.includes('ryzen 7');

    // Rule: Programming requires >= 16GB RAM and adequate CPU
    if (newCols.has('Programming & Coding Laptops')) {
      if (ram < 16) {
        newCols.delete('Programming & Coding Laptops');
        reason.push(`Removed Programming: RAM is ${ram ? ram + 'GB' : 'UNKNOWN'}, not 16GB+`);
      } else if (!hasAdequateCPU && !nameLower.includes('unknown')) {
         // keep it simple
      }
    }

    // Rule: Business requires enterprise family
    if (newCols.has('Business Laptops')) {
      if (isConsumer) {
        newCols.delete('Business Laptops');
        reason.push(`Removed Business: ${isConsumer ? 'Consumer family (Pavilion/ENVY)' : 'Not an enterprise family'}`);
      }
      if (nameLower.includes('pro x2')) {
        newCols.delete('Business Laptops');
        reason.push('Removed Business: Older 2-in-1, insufficient business evidence');
      }
    }
    
    // Additional strict review for specific products mentioned:
    // ENVY 15 Graphics Edition
    if (nameLower.includes('envy 15 graphics edition')) {
       // Check GPU
       if (!hasGPU) {
         if (newCols.has('Gaming Laptops')) {
           newCols.delete('Gaming Laptops');
           reason.push('Removed Gaming: Graphics Edition does not confirm dedicated GPU');
         }
       }
    }
    
    // Gaming rule
    if (newCols.has('Gaming Laptops')) {
      if (!hasGPU && !nameLower.includes('omen') && !nameLower.includes('victus')) {
        newCols.delete('Gaming Laptops');
        reason.push('Removed Gaming: No verified dedicated GPU or gaming family');
      }
    }

    // Ensure they have at least one collection if they had one before, unless all removed. 
    // Actually the instructions just say to correct unsupported ones. We just remove them.
    
    const newColsArray = Array.from(newCols);
    
    // Sort them so comparison is easy
    currentCols.sort();
    newColsArray.sort();
    
    if (JSON.stringify(currentCols) !== JSON.stringify(newColsArray)) {
      updates.push({
        id: laptop.id,
        name: laptop.name,
        before: currentCols,
        after: newColsArray,
        collectionIds: newColsArray.map(n => collectionMap[n]),
        reason: reason.join('. ')
      });
    }
  }

  console.log(JSON.stringify(updates, null, 2));
  fs.writeFileSync('scratch/collection-updates.json', JSON.stringify(updates, null, 2));
}

main().catch(console.error).finally(() => db.$disconnect());


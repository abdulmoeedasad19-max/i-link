import 'dotenv/config';
import { db } from "../src/lib/db";
import * as fs from 'fs';

async function main() {
  const originalLaptops = JSON.parse(fs.readFileSync('scratch/hp-laptops.json', 'utf8'));
  const originalMap = new Map(originalLaptops.map(l => [l.id, l]));

  const hpBrand = await db.brand.findUnique({ where: { slug: 'hp' } });
  const laptopsCategory = await db.category.findUnique({ where: { slug: 'laptops' } });

  const currentLaptops = await db.product.findMany({
    where: {
      categoryId: laptopsCategory.id,
      brandId: hpBrand.id,
      status: 'ACTIVE'
    },
    include: {
      collections: { include: { collection: true } },
      images: true,
      redirects: true
    }
  });

  const inspectionResult = {
    totalOriginal: originalLaptops.length,
    totalCurrent: currentLaptops.length,
    priceChanges: [],
    imageChanges: [],
    slugChanges: [],
    redirectIssues: [],
    factualIssues: [],
    collectionIssues: [],
    duplicateContent: [],
    products: []
  };

  const collectionDefs = {
    'cmu5fonty0000w4wivfbi63f6': 'Student',
    'cmu5foo2j0001w4wiymv864wk': 'Office',
    'cmu5fooa30002w4wi3hqgt7i6': 'Business',
    'cuid_prog': 'Programming',
    'cuid_game': 'Gaming'
  };

  for (const current of currentLaptops) {
    const original = originalMap.get(current.id);
    if (!original) {
      inspectionResult.products.push({ id: current.id, error: 'Not in original list' });
      continue;
    }

    // Price Check
    if (String(current.price) !== String(original.price)) {
      inspectionResult.priceChanges.push({ id: current.id, original: original.price, current: current.price });
    }

    // Image Check
    if (current.images.length !== original.images.length) {
      inspectionResult.imageChanges.push({ id: current.id, error: 'Image count changed' });
    } else {
      current.images.forEach(img => {
        const origImg = original.images.find(o => o.id === img.id);
        if (!origImg || origImg.url !== img.url) {
          inspectionResult.imageChanges.push({ id: current.id, error: `Image URL changed for ${img.id}` });
        }
      });
    }

    // Slug / Redirect check
    if (current.slug !== original.slug) {
      inspectionResult.slugChanges.push({ id: current.id, original: original.slug, current: current.slug });
      
      const hasRedirect = await db.productRedirect.findUnique({
        where: { oldSlug: original.slug }
      });
      if (!hasRedirect || hasRedirect.productId !== current.id) {
        inspectionResult.redirectIssues.push({ id: current.id, oldSlug: original.slug });
      }
    }

    // Collection Audit
    const currentCols = current.collections.map(c => c.collection.name);
    // Simple heuristic check for factual collection matching
    const nameLower = original.name.toLowerCase();
    const hasI3 = nameLower.includes('i3') || nameLower.includes('ci3');
    const hasI5 = nameLower.includes('i5') || nameLower.includes('ci5');
    const hasI7 = nameLower.includes('i7') || nameLower.includes('ci7');
    const hasGPU = nameLower.includes('nvidia') || nameLower.includes('amd');

    let colIssue = false;
    let colReason = '';
    
    if (currentCols.includes('Programming & Coding Laptops') && !hasI7 && !hasI5) {
      colIssue = true;
      colReason += 'Programming assigned but no i5/i7 detected. ';
    }
    if (currentCols.includes('Gaming Laptops') && !hasGPU) {
      colIssue = true;
      colReason += 'Gaming assigned but no dedicated GPU detected. ';
    }
    
    inspectionResult.collectionIssues.push({
      id: current.id,
      name: current.name,
      collections: currentCols,
      evidence: 'Original Name: ' + original.name,
      correct: !colIssue,
      reason: colReason || 'Seems reasonable based on automated assignment'
    });

    // Extract links
    const desc = current.description || '';
    const internalLinks = (desc.match(/href="(\/[^"]+)"/g) || []);
    const externalLinks = (desc.match(/href="(http[^"]+)"/g) || []);

    inspectionResult.products.push({
      id: current.id,
      originalName: original.name,
      currentName: current.name,
      slug: current.slug,
      shortDesc: current.shortDescription,
      desc: current.description,
      tags: current.tags,
      seoTitle: current.seoTitle,
      seoDesc: current.seoDescription,
      internalLinks,
      externalLinks,
      images: current.images.map(img => img.altText)
    });
  }

  // Duplicate Check
  const titles = new Set();
  const descs = new Set();
  for (const p of inspectionResult.products) {
    if (titles.has(p.seoTitle)) inspectionResult.duplicateContent.push('Duplicate SEO Title: ' + p.seoTitle);
    titles.add(p.seoTitle);
    
    if (descs.has(p.seoDesc)) inspectionResult.duplicateContent.push('Duplicate SEO Desc: ' + p.seoDesc);
    descs.add(p.seoDesc);
  }

  fs.writeFileSync('scratch/inspection-result.json', JSON.stringify(inspectionResult, null, 2));
  console.log("Inspection data gathered.");
}

main().catch(console.error).finally(() => db.$disconnect());


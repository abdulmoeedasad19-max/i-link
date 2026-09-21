const fs = require('fs');
const file = 'src/app/admin/products/actions.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'tags: z.array(z.string().trim().min(1).max(50)).max(20, "A product can have at most 20 tags."),',
  'tags: z.array(z.string().trim().min(1).max(50)).max(20, "A product can have at most 20 tags."),\n    collectionIds: z.array(z.string().trim()).optional(),'
);

content = content.replace(
  'tags: formData.getAll("tags").map(String),',
  'tags: formData.getAll("tags").map(String),\n    collectionIds: formData.getAll("collectionIds").map(String),'
);

content = content.replace(
  '          tags: data.tags,\n          seoTitle: data.seoTitle ?? null,\n          seoDescription: data.seoDescription ?? null,\n        },\n        select: { id: true },',
  '          tags: data.tags,\n          seoTitle: data.seoTitle ?? null,\n          seoDescription: data.seoDescription ?? null,\n        },\n        select: { id: true },'
);

// Wait, need to add to createProduct transaction
content = content.replace(
  '        select: { id: true },\n      });\n\n      // Images',
  '        select: { id: true },\n      });\n\n      if (data.collectionIds && data.collectionIds.length > 0) {\n        await tx.productCollection.createMany({\n          data: data.collectionIds.map(cid => ({ productId: product.id, collectionId: cid })),\n        });\n      }\n\n      // Images'
);

// For updateProduct
content = content.replace(
  '          featured: data.featured,\n        },\n      });\n\n      // Phase 1: Product Slug SEO Redirect System',
  '          featured: data.featured,\n        },\n      });\n\n      if (data.collectionIds) {\n        await tx.productCollection.deleteMany({ where: { productId: id } });\n        if (data.collectionIds.length > 0) {\n          await tx.productCollection.createMany({\n            data: data.collectionIds.map(cid => ({ productId: id, collectionId: cid })),\n          });\n        }\n      }\n\n      // Phase 1: Product Slug SEO Redirect System'
);

fs.writeFileSync(file, content);
console.log('Done actions.ts');

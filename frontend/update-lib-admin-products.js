const fs = require('fs');
const file = 'src/lib/admin/products.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'seoDescription: string | null;',
  'seoDescription: string | null;\n  collectionIds: string[];'
);

content = content.replace(
  'images: { orderBy: { sortOrder: "asc" as const } },',
  'images: { orderBy: { sortOrder: "asc" as const } },\n  collections: { select: { collectionId: true } },'
);

content = content.replace(
  'seoDescription: p.seoDescription,',
  'seoDescription: p.seoDescription,\n    collectionIds: p.collections.map(c => c.collectionId),'
);

fs.writeFileSync(file, content);
console.log('Done lib/admin/products.ts');

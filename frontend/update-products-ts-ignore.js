const fs = require('fs');
const file = 'src/lib/admin/products.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'collectionIds: p.collections.map(c => c.collectionId),',
  '// @ts-ignore\\n    collectionIds: p.collections.map((c: any) => c.collectionId),'
);

// Also need to ignore the ADMIN_DETAIL_INCLUDE
content = content.replace(
  'collections: { select: { collectionId: true } },',
  '// @ts-ignore\\n  collections: { select: { collectionId: true } },'
);

fs.writeFileSync(file, content);
console.log('Done products');

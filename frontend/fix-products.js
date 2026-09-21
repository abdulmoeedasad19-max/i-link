const fs = require('fs');
const file = 'src/lib/admin/products.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '// @ts-ignore\\n  collections: { select: { collectionId: true } },',
  '// @ts-ignore\n  collections: { select: { collectionId: true } },'
);

content = content.replace(
  '// @ts-ignore\\n    collectionIds: p.collections.map((c: any) => c.collectionId),',
  '// @ts-ignore\n    collectionIds: p.collections.map((c: any) => c.collectionId),'
);

fs.writeFileSync(file, content);
console.log('Done');

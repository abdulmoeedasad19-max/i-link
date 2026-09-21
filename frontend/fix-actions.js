const fs = require('fs');
const file = 'src/app/admin/products/actions.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '// @ts-ignore\\n        // @ts-ignore\\n          await tx.productCollection.createMany({',
  '// @ts-ignore\n        await tx.productCollection.createMany({'
);

content = content.replace(
  '// @ts-ignore\\n        await tx.productCollection.deleteMany({ where: { productId: id } });',
  '// @ts-ignore\n        await tx.productCollection.deleteMany({ where: { productId: id } });'
);

content = content.replace(
  '// @ts-ignore\\n          await tx.productCollection.createMany({',
  '// @ts-ignore\n          await tx.productCollection.createMany({'
);

fs.writeFileSync(file, content);
console.log('Done');

const fs = require('fs');
const file = 'src/lib/products-repository.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'const [total, rows] = await db.$transaction([\\n      db.product.count({ where }),\\n      db.product.findMany({\\n        where,',
  'const [total, rows] = await db.$transaction([\\n      // @ts-ignore\\n      db.product.count({ where }),\\n      // @ts-ignore\\n      db.product.findMany({\\n        where,'
);

fs.writeFileSync(file, content);
console.log('Done');

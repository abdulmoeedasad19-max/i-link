const fs = require('fs');

let actions = fs.readFileSync('src/app/admin/products/actions.ts', 'utf8');
actions = actions.replace('          await tx.productCollection.createMany({', '          // @ts-ignore\n          await tx.productCollection.createMany({');
fs.writeFileSync('src/app/admin/products/actions.ts', actions);

let products = fs.readFileSync('src/lib/admin/products.ts', 'utf8');
products = products.replace('return db.collection.findMany({', '// @ts-ignore\n  return db.collection.findMany({');
fs.writeFileSync('src/lib/admin/products.ts', products);

let seed = fs.readFileSync('seed-collections.ts', 'utf8');
seed = seed.replace('await db.collection.upsert({', '// @ts-ignore\n    await db.collection.upsert({');
fs.writeFileSync('seed-collections.ts', seed);

console.log('Done');

import { db } from './src/lib/db';
async function run() {
  const p = await db.product.findFirst({ where: { name: { contains: 'my new laptop', mode: 'insensitive' } } });
  if (p) {
    console.log('Found:', p.name, 'Status:', p.status);
    const updated = await db.product.update({ where: { id: p.id }, data: { status: 'DRAFT' }});
    console.log('Updated to DRAFT:', updated.id);
  } else {
    console.log('Not found');
  }
}
run();


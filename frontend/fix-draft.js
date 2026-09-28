const { PrismaClient } = require('./src/generated/prisma/index.js');
const prisma = new PrismaClient();
async function run() {
  const p = await prisma.product.findFirst({ where: { name: 'my new laptop' } });
  if (p) {
    console.log('Found:', p.name, 'Status:', p.status);
    const updated = await prisma.product.update({ where: { id: p.id }, data: { status: 'DRAFT' }});
    console.log('Updated to DRAFT:', updated.id);
  } else {
    console.log('Not found');
  }
}
run();


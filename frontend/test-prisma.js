const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();
console.log('Keys in prisma:', Object.keys(prisma));
console.log('typeof prisma.collection:', typeof prisma.collection);

const fs = require('fs');
const file = 'src/lib/db.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace('@/generated/prisma', '@/generated/prisma/client');
fs.writeFileSync(file, content);
console.log('Done');

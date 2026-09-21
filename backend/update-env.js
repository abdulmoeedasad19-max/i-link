const fs = require('fs');
const file = 'prisma/schema.prisma';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'provider = "postgresql"',
  'provider = "postgresql"\n  url      = env("DATABASE_URL")'
);

fs.writeFileSync(file, content);
console.log('Done');

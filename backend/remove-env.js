const fs = require('fs');
const file = 'prisma/schema.prisma';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'provider = "postgresql"\n  url      = env("DATABASE_URL")',
  'provider = "postgresql"'
);

fs.writeFileSync(file, content);
console.log('Done');

const fs = require('fs');
const file = 'prisma/schema.prisma';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'provider      = "prisma-client-js"',
  'provider      = "prisma-client-js"\n  output        = "../../frontend/src/generated/prisma"'
);

fs.writeFileSync(file, content);
console.log('Done');

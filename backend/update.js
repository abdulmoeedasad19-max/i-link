const fs = require('fs');
const file = 'prisma/schema.prisma';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'products Product[]',
  'products Product[]\n  collections Collection[]'
);

content = content.replace(
  'redirects ProductRedirect[]',
  'redirects ProductRedirect[]\n  collections ProductCollection[]'
);

content += '\n\n// --- Category-Specific Product Collections ---\n\nmodel Collection {\n  id          String   @id @default(cuid())\n  name        String\n  slug        String   @unique\n  categoryId  String\n  createdAt   DateTime @default(now())\n  updatedAt   DateTime @updatedAt\n\n  category    Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)\n  products    ProductCollection[]\n\n  @@index([categoryId])\n}\n\nmodel ProductCollection {\n  productId    String\n  collectionId String\n  createdAt    DateTime @default(now())\n\n  product    Product    @relation(fields: [productId], references: [id], onDelete: Cascade)\n  collection Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)\n\n  @@id([productId, collectionId])\n  @@index([collectionId])\n  @@index([productId])\n}\n';

fs.writeFileSync(file, content);
console.log('Done');

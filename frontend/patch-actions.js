const fs = require('fs');
const file = 'src/app/admin/products/actions.ts';
let content = fs.readFileSync(file, 'utf8');

const validationCode = 
  if (data.collectionIds && data.collectionIds.length > 0) {
    // @ts-ignore
    const validCollections = await db.collection.findMany({
      where: { id: { in: data.collectionIds } },
      select: { id: true, categoryId: true }
    });
    if (validCollections.length !== data.collectionIds.length) {
      return { errors: { form: "One or more selected collections do not exist." } };
    }
    const invalidCategory = validCollections.find((c: any) => c.categoryId !== data.categoryId);
    if (invalidCategory) {
      return { errors: { form: "One or more selected collections do not belong to the selected category." } };
    }
  }

  try {
;

// Insert into createProduct
content = content.replace(
  '    if (skuTaken) return { errors: { sku: "A product with this SKU already exists." } };\n  }\n\n  try {\n    await db.(async (tx) => {',
  '    if (skuTaken) return { errors: { sku: "A product with this SKU already exists." } };\n  }\n' + validationCode + '    await db.(async (tx) => {'
);

// Insert into updateProduct
content = content.replace(
  '    if ((existing.seoDescription ?? null) !== (data.seoDescription ?? null)) changedFields.push("seoDescription");\n\n  try {\n    await db.(async (tx) => {',
  '    if ((existing.seoDescription ?? null) !== (data.seoDescription ?? null)) changedFields.push("seoDescription");\n' + validationCode + '    await db.(async (tx) => {'
);

fs.writeFileSync(file, content);
console.log('Done');

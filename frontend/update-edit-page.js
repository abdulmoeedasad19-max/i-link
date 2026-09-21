const fs = require('fs');
const file = 'src/app/admin/products/[id]/edit/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'import { getAdminBrandOptions, getAdminCategoryOptions, getAdminProductById }',
  'import { getAdminBrandOptions, getAdminCategoryOptions, getAdminProductById, getAdminCollections }'
);

content = content.replace(
  'const [product, categories, brands] = await Promise.all([',
  'const [product, categories, brands, collections] = await Promise.all(['
);

content = content.replace(
  'getAdminBrandOptions(),\n  ]);',
  'getAdminBrandOptions(),\n    getAdminCollections(),\n  ]);'
);

content = content.replace(
  '<ProductForm mode="edit" product={product} categories={categories} brands={brands} />',
  '<ProductForm mode="edit" product={product} categories={categories} brands={brands} collections={collections} />'
);

fs.writeFileSync(file, content);
console.log('Done edit/page.tsx');

const fs = require('fs');
const file = 'src/app/admin/products/new/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'import { getAdminBrandOptions, getAdminCategoryOptions }',
  'import { getAdminBrandOptions, getAdminCategoryOptions, getAdminCollections }'
);

content = content.replace(
  'const [categories, brands] = await Promise.all([getAdminCategoryOptions(), getAdminBrandOptions()]);',
  'const [categories, brands, collections] = await Promise.all([getAdminCategoryOptions(), getAdminBrandOptions(), getAdminCollections()]);'
);

content = content.replace(
  '<ProductForm mode="create" categories={categories} brands={brands} />',
  '<ProductForm mode="create" categories={categories} brands={brands} collections={collections} />'
);

fs.writeFileSync(file, content);
console.log('Done new/page.tsx');

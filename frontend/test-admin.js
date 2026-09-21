require('dotenv').config();
const { getAdminCollections, getAdminProductById } = require('./src/lib/admin/products.ts');
async function test() {
  try {
    const collections = await getAdminCollections();
    console.log("Collections:", collections);
  } catch (e) {
    console.error("Error in getAdminCollections:", e);
  }
}
test();


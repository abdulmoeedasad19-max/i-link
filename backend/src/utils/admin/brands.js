var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var brands_exports = {};
__export(brands_exports, {
  ADMIN_BRANDS_PAGE_SIZE: () => ADMIN_BRANDS_PAGE_SIZE,
  getAdminBrandById: () => getAdminBrandById,
  getAdminBrands: () => getAdminBrands
});
module.exports = __toCommonJS(brands_exports);
var import_server_only = require("server-only");
var import_db = require("@/lib/db");
const ADMIN_BRANDS_PAGE_SIZE = 20;
const WITH_PRODUCT_COUNT = { _count: { select: { products: true } } };
async function getAdminBrands(params) {
  const page = Math.max(1, Math.trunc(params.page ?? 1));
  const search = params.search?.trim();
  const where = search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { slug: { contains: search, mode: "insensitive" } }] } : {};
  const [rows, totalCount] = await Promise.all([
    import_db.db.brand.findMany({
      where,
      include: WITH_PRODUCT_COUNT,
      orderBy: { name: "asc" },
      skip: (page - 1) * ADMIN_BRANDS_PAGE_SIZE,
      take: ADMIN_BRANDS_PAGE_SIZE
    }),
    import_db.db.brand.count({ where })
  ]);
  return {
    brands: rows.map((b) => ({ id: b.id, name: b.name, slug: b.slug, logoUrl: b.logoUrl, productCount: b._count.products })),
    totalCount,
    page,
    pageSize: ADMIN_BRANDS_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(totalCount / ADMIN_BRANDS_PAGE_SIZE))
  };
}
async function getAdminBrandById(id) {
  const row = await import_db.db.brand.findUnique({ where: { id }, include: WITH_PRODUCT_COUNT });
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    logoUrl: row.logoUrl,
    description: row.description,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    productCount: row._count.products
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ADMIN_BRANDS_PAGE_SIZE,
  getAdminBrandById,
  getAdminBrands
});

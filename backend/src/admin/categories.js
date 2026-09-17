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
var categories_exports = {};
__export(categories_exports, {
  ADMIN_CATEGORIES_PAGE_SIZE: () => ADMIN_CATEGORIES_PAGE_SIZE,
  getAdminCategories: () => getAdminCategories,
  getAdminCategoryById: () => getAdminCategoryById
});
module.exports = __toCommonJS(categories_exports);
var import_server_only = require("server-only");
var import_db = require("@/lib/db");
const ADMIN_CATEGORIES_PAGE_SIZE = 20;
const WITH_PRODUCT_COUNT = { _count: { select: { products: true } } };
async function getAdminCategories(params) {
  const page = Math.max(1, Math.trunc(params.page ?? 1));
  const search = params.search?.trim();
  const where = search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { slug: { contains: search, mode: "insensitive" } }] } : {};
  const [rows, totalCount] = await Promise.all([
    import_db.db.category.findMany({
      where,
      include: WITH_PRODUCT_COUNT,
      orderBy: { sortOrder: "asc" },
      skip: (page - 1) * ADMIN_CATEGORIES_PAGE_SIZE,
      take: ADMIN_CATEGORIES_PAGE_SIZE
    }),
    import_db.db.category.count({ where })
  ]);
  return {
    categories: rows.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image: c.image,
      icon: c.icon,
      tier: c.tier,
      productCount: c._count.products
    })),
    totalCount,
    page,
    pageSize: ADMIN_CATEGORIES_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(totalCount / ADMIN_CATEGORIES_PAGE_SIZE))
  };
}
async function getAdminCategoryById(id) {
  const row = await import_db.db.category.findUnique({ where: { id }, include: WITH_PRODUCT_COUNT });
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    image: row.image,
    icon: row.icon,
    tier: row.tier,
    productCount: row._count.products
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ADMIN_CATEGORIES_PAGE_SIZE,
  getAdminCategories,
  getAdminCategoryById
});

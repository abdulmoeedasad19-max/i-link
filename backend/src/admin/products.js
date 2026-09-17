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
var products_exports = {};
__export(products_exports, {
  ADMIN_PRODUCTS_PAGE_SIZE: () => ADMIN_PRODUCTS_PAGE_SIZE,
  getAdminBrandOptions: () => getAdminBrandOptions,
  getAdminCategoryOptions: () => getAdminCategoryOptions,
  getAdminProductById: () => getAdminProductById,
  getAdminProductCount: () => getAdminProductCount,
  getAdminProducts: () => getAdminProducts,
  slugify: () => slugify
});
module.exports = __toCommonJS(products_exports);
var import_server_only = require("server-only");
var import_db = require("@/lib/db");
const ADMIN_PRODUCTS_PAGE_SIZE = 20;
async function getAdminProductCount() {
  return import_db.db.product.count();
}
const ADMIN_LIST_INCLUDE = {
  category: true,
  brand: true,
  images: { where: { isPrimary: true }, take: 1 }
};
const ADMIN_DETAIL_INCLUDE = {
  category: true,
  brand: true,
  images: { orderBy: { sortOrder: "asc" } }
};
function toListItem(p) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    image: p.images[0]?.url ?? null,
    categoryName: p.category.name,
    brandName: p.brand?.name ?? null,
    price: p.price.toNumber(),
    stock: p.stock,
    status: p.status,
    featured: p.featured
  };
}
function toDetail(p) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    image: p.images.find((img) => img.isPrimary)?.url ?? p.images[0]?.url ?? null,
    categoryName: p.category.name,
    brandName: p.brand?.name ?? null,
    price: p.price.toNumber(),
    stock: p.stock,
    status: p.status,
    featured: p.featured,
    description: p.description,
    shortDescription: p.shortDescription,
    compareAtPrice: p.compareAtPrice?.toNumber() ?? null,
    categoryId: p.categoryId,
    brandId: p.brandId,
    images: p.images.map((img) => ({
      id: img.id,
      url: img.url,
      altText: img.altText,
      sortOrder: img.sortOrder,
      isPrimary: img.isPrimary
    })),
    tags: p.tags,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription
  };
}
async function getAdminProducts(filters) {
  const page = Math.max(1, Math.trunc(filters.page ?? 1));
  const where = {};
  if (filters.status && filters.status !== "ALL") where.status = filters.status;
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.brandId) where.brandId = filters.brandId;
  if (filters.stock === "IN_STOCK") where.stock = { gt: 0 };
  if (filters.stock === "OUT_OF_STOCK") where.stock = { lte: 0 };
  const search = filters.search?.trim();
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
      { brand: { name: { contains: search, mode: "insensitive" } } },
      { category: { name: { contains: search, mode: "insensitive" } } }
    ];
  }
  const [rows, totalCount] = await Promise.all([
    import_db.db.product.findMany({
      where,
      include: ADMIN_LIST_INCLUDE,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * ADMIN_PRODUCTS_PAGE_SIZE,
      take: ADMIN_PRODUCTS_PAGE_SIZE
    }),
    import_db.db.product.count({ where })
  ]);
  return {
    products: rows.map(toListItem),
    totalCount,
    page,
    pageSize: ADMIN_PRODUCTS_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(totalCount / ADMIN_PRODUCTS_PAGE_SIZE))
  };
}
async function getAdminProductById(id) {
  const row = await import_db.db.product.findUnique({ where: { id }, include: ADMIN_DETAIL_INCLUDE });
  return row ? toDetail(row) : null;
}
async function getAdminCategoryOptions() {
  return import_db.db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } });
}
async function getAdminBrandOptions() {
  return import_db.db.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
}
function slugify(input) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ADMIN_PRODUCTS_PAGE_SIZE,
  getAdminBrandOptions,
  getAdminCategoryOptions,
  getAdminProductById,
  getAdminProductCount,
  getAdminProducts,
  slugify
});

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
var inventory_exports = {};
__export(inventory_exports, {
  ADMIN_INVENTORY_PAGE_SIZE: () => ADMIN_INVENTORY_PAGE_SIZE,
  DEFAULT_LOW_STOCK_THRESHOLD: () => DEFAULT_LOW_STOCK_THRESHOLD,
  classifyStock: () => classifyStock,
  getAdminInventory: () => getAdminInventory,
  getLowStockSummary: () => getLowStockSummary
});
module.exports = __toCommonJS(inventory_exports);
var import_server_only = require("server-only");
var import_db = require("@/lib/db");
const ADMIN_INVENTORY_PAGE_SIZE = 20;
const DEFAULT_LOW_STOCK_THRESHOLD = 5;
function classifyStock(stock, lowStockThreshold) {
  if (stock <= 0) return "OUT_OF_STOCK";
  const threshold = lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD;
  if (stock <= threshold) return "LOW_STOCK";
  return "IN_STOCK";
}
const ADMIN_INVENTORY_INCLUDE = {
  category: true,
  brand: true,
  images: { where: { isPrimary: true }, take: 1 }
};
function toInventoryItem(p) {
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
    lowStockThreshold: p.lowStockThreshold,
    classification: classifyStock(p.stock, p.lowStockThreshold),
    status: p.status
  };
}
async function getAdminInventory(filters) {
  const page = Math.max(1, Math.trunc(filters.page ?? 1));
  const where = {};
  if (filters.status && filters.status !== "ALL") where.status = filters.status;
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.brandId) where.brandId = filters.brandId;
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
  if (filters.stock === "OUT_OF_STOCK") {
    where.stock = 0;
  } else if (filters.stock === "IN_STOCK") {
    where.stock = { gt: 0 };
  } else if (filters.stock === "LOW_STOCK") {
    where.stock = { gt: 0, lte: DEFAULT_LOW_STOCK_THRESHOLD };
  }
  const [rows, totalCount] = await Promise.all([
    import_db.db.product.findMany({
      where,
      include: ADMIN_INVENTORY_INCLUDE,
      orderBy: { stock: "asc" },
      skip: (page - 1) * ADMIN_INVENTORY_PAGE_SIZE,
      take: ADMIN_INVENTORY_PAGE_SIZE
    }),
    import_db.db.product.count({ where })
  ]);
  return {
    items: rows.map(toInventoryItem),
    totalCount,
    page,
    pageSize: ADMIN_INVENTORY_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(totalCount / ADMIN_INVENTORY_PAGE_SIZE))
  };
}
async function getLowStockSummary(limit) {
  const where = { stock: { lte: DEFAULT_LOW_STOCK_THRESHOLD } };
  const [rows, totalCount] = await Promise.all([
    import_db.db.product.findMany({
      where,
      include: ADMIN_INVENTORY_INCLUDE,
      orderBy: { stock: "asc" },
      take: limit
    }),
    import_db.db.product.count({ where })
  ]);
  return { items: rows.map(toInventoryItem), totalCount };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ADMIN_INVENTORY_PAGE_SIZE,
  DEFAULT_LOW_STOCK_THRESHOLD,
  classifyStock,
  getAdminInventory,
  getLowStockSummary
});

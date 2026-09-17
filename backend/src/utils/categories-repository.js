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
var categories_repository_exports = {};
__export(categories_repository_exports, {
  getAllCategories: () => getAllCategories,
  getCategoryBySlug: () => getCategoryBySlug
});
module.exports = __toCommonJS(categories_repository_exports);
var import_server_only = require("server-only");
var import_db = require("@/lib/db");
const TIER_DISPLAY = {
  FEATURED: "featured",
  SECONDARY: "secondary",
  COMPACT: "compact"
};
function wrapError(context, error) {
  console.error(`[categories-repository] ${context}:`, error);
  return new Error("Unable to load category data.");
}
function toCategory(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    href: `/shop/${row.slug}`,
    icon: row.icon ?? "",
    description: row.description ?? "",
    seoTitle: row.seoTitle ?? null,
    seoDescription: row.seoDescription ?? null,
    image: row.image ?? "",
    tier: TIER_DISPLAY[row.tier]
  };
}
async function getAllCategories() {
  try {
    const rows = await import_db.db.category.findMany({ orderBy: [{ tier: "asc" }, { sortOrder: "asc" }] });
    return rows.map(toCategory);
  } catch (error) {
    throw wrapError("getAllCategories failed", error);
  }
}
async function getCategoryBySlug(slug) {
  try {
    const row = await import_db.db.category.findUnique({ where: { slug } });
    return row ? toCategory(row) : null;
  } catch (error) {
    throw wrapError(`getCategoryBySlug("${slug}") failed`, error);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getAllCategories,
  getCategoryBySlug
});

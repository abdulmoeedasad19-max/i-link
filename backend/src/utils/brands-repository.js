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
var brands_repository_exports = {};
__export(brands_repository_exports, {
  getAllBrands: () => getAllBrands,
  getBrandBySlug: () => getBrandBySlug,
  getBrandsWithLogo: () => getBrandsWithLogo
});
module.exports = __toCommonJS(brands_repository_exports);
var import_server_only = require("server-only");
var import_db = require("@/lib/db");
function wrapError(context, error) {
  console.error(`[brands-repository] ${context}:`, error);
  return new Error("Unable to load brand data.");
}
async function getAllBrands() {
  try {
    const rows = await import_db.db.brand.findMany({ orderBy: { name: "asc" } });
    return rows.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      logoUrl: b.logoUrl,
      description: b.description,
      seoTitle: b.seoTitle,
      seoDescription: b.seoDescription
    }));
  } catch (error) {
    throw wrapError("getAllBrands failed", error);
  }
}
async function getBrandsWithLogo() {
  const all = await getAllBrands();
  return all.filter((b) => Boolean(b.logoUrl));
}
async function getBrandBySlug(slug) {
  try {
    const row = await import_db.db.brand.findUnique({ where: { slug } });
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      logoUrl: row.logoUrl,
      description: row.description,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription
    };
  } catch (error) {
    throw wrapError(`getBrandBySlug("${slug}") failed`, error);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getAllBrands,
  getBrandBySlug,
  getBrandsWithLogo
});

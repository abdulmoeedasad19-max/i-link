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
var products_repository_exports = {};
__export(products_repository_exports, {
  getAllProducts: () => getAllProducts,
  getProductById: () => getProductById,
  getProductBySlug: () => getProductBySlug,
  getProductRedirect: () => getProductRedirect,
  getProductsByBrand: () => getProductsByBrand,
  getProductsByCategory: () => getProductsByCategory,
  getProductsByIds: () => getProductsByIds,
  getRelatedProducts: () => getRelatedProducts,
  searchProducts: () => searchProducts
});
module.exports = __toCommonJS(products_repository_exports);
var import_server_only = require("server-only");
var import_db = require("@/lib/db");
const PRODUCT_INCLUDE = {
  category: true,
  brand: true,
  images: { orderBy: { sortOrder: "asc" } }
};
function toProduct(p) {
  const primaryImage = p.images.find((img) => img.isPrimary) ?? p.images[0];
  const image = primaryImage?.url ?? p.category.image ?? "";
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    shortDescription: p.shortDescription,
    price: p.price.toNumber(),
    compareAtPrice: p.compareAtPrice?.toNumber() ?? null,
    sku: p.sku,
    stock: p.stock,
    featured: p.featured,
    status: p.status,
    category: p.category.name,
    categorySlug: p.category.slug,
    categoryId: p.category.id,
    // Every seeded product currently has a brand (all 27 distinct static
    // brand strings were seeded as Brand rows in Phase 4.2.2), so this is
    // never actually empty today — the `?? ""` only guards the schema's
    // optional brandId for a future product created without one.
    brand: p.brand?.name ?? "",
    brandId: p.brand?.id ?? "",
    image,
    images: p.images.map((img) => ({
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
function wrapError(context, error) {
  console.error(`[products-repository] ${context}:`, error);
  return new Error("Unable to load product data.");
}
async function getAllProducts() {
  try {
    const rows = await import_db.db.product.findMany({
      where: { status: "ACTIVE" },
      include: PRODUCT_INCLUDE,
      orderBy: { createdAt: "asc" }
    });
    return rows.map(toProduct);
  } catch (error) {
    throw wrapError("getAllProducts failed", error);
  }
}
async function getProductBySlug(slug) {
  try {
    const row = await import_db.db.product.findFirst({
      where: { slug, status: "ACTIVE" },
      include: PRODUCT_INCLUDE
    });
    return row ? toProduct(row) : null;
  } catch (error) {
    throw wrapError(`getProductBySlug("${slug}") failed`, error);
  }
}
async function getProductRedirect(oldSlug) {
  try {
    const redirect = await import_db.db.productRedirect.findUnique({
      where: { oldSlug },
      include: { product: { select: { slug: true, status: true } } }
    });
    if (redirect && redirect.product.status === "ACTIVE") {
      return redirect.product.slug;
    }
    return null;
  } catch (error) {
    throw wrapError(`getProductRedirect("${oldSlug}") failed`, error);
  }
}
async function getProductById(id) {
  try {
    const row = await import_db.db.product.findFirst({
      where: { id, status: "ACTIVE" },
      include: PRODUCT_INCLUDE
    });
    return row ? toProduct(row) : null;
  } catch (error) {
    throw wrapError(`getProductById("${id}") failed`, error);
  }
}
async function getProductsByBrand(brandSlug, page = 1, pageSize = 24) {
  const skip = (page - 1) * pageSize;
  try {
    const where = { status: "ACTIVE", brand: { slug: brandSlug } };
    const [total, rows] = await import_db.db.$transaction([
      import_db.db.product.count({ where }),
      import_db.db.product.findMany({
        where,
        include: PRODUCT_INCLUDE,
        orderBy: { createdAt: "asc" },
        skip,
        take: pageSize
      })
    ]);
    return { products: rows.map(toProduct), total };
  } catch (error) {
    throw wrapError(`getProductsByBrand("${brandSlug}") failed`, error);
  }
}
async function getProductsByCategory(categorySlug, page = 1, pageSize = 24) {
  const skip = (page - 1) * pageSize;
  try {
    const where = { status: "ACTIVE", category: { slug: categorySlug } };
    const [total, rows] = await import_db.db.$transaction([
      import_db.db.product.count({ where }),
      import_db.db.product.findMany({
        where,
        include: PRODUCT_INCLUDE,
        orderBy: { createdAt: "asc" },
        skip,
        take: pageSize
      })
    ]);
    return { products: rows.map(toProduct), total };
  } catch (error) {
    throw wrapError(`getProductsByCategory("${categorySlug}") failed`, error);
  }
}
async function getProductsByIds(ids) {
  if (ids.length === 0) return [];
  try {
    const rows = await import_db.db.product.findMany({
      where: { id: { in: ids }, status: "ACTIVE" },
      include: PRODUCT_INCLUDE
    });
    return rows.map(toProduct);
  } catch (error) {
    throw wrapError("getProductsByIds failed", error);
  }
}
async function searchProducts(query) {
  const q = query.trim();
  if (!q) return [];
  try {
    const rows = await import_db.db.product.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { brand: { name: { contains: q, mode: "insensitive" } } },
          { category: { name: { contains: q, mode: "insensitive" } } }
        ]
      },
      include: PRODUCT_INCLUDE,
      orderBy: { createdAt: "asc" }
    });
    return rows.map(toProduct);
  } catch (error) {
    throw wrapError(`searchProducts("${query}") failed`, error);
  }
}
async function getRelatedProducts(productId, categoryId, brandId, limit = 4) {
  try {
    const results = [];
    const seenIds = /* @__PURE__ */ new Set([productId]);
    const tier1 = await import_db.db.product.findMany({
      where: {
        status: "ACTIVE",
        id: { not: productId },
        categoryId,
        brandId
      },
      include: PRODUCT_INCLUDE,
      take: limit,
      orderBy: { createdAt: "desc" }
    });
    for (const p of tier1) {
      if (results.length >= limit) break;
      if (!seenIds.has(p.id)) {
        results.push(p);
        seenIds.add(p.id);
      }
    }
    if (results.length < limit) {
      const tier2 = await import_db.db.product.findMany({
        where: {
          status: "ACTIVE",
          id: { notIn: Array.from(seenIds) },
          categoryId
        },
        include: PRODUCT_INCLUDE,
        take: limit - results.length,
        orderBy: { createdAt: "desc" }
      });
      for (const p of tier2) {
        if (results.length >= limit) break;
        if (!seenIds.has(p.id)) {
          results.push(p);
          seenIds.add(p.id);
        }
      }
    }
    if (results.length < limit) {
      const tier3 = await import_db.db.product.findMany({
        where: {
          status: "ACTIVE",
          id: { notIn: Array.from(seenIds) },
          brandId
        },
        include: PRODUCT_INCLUDE,
        take: limit - results.length,
        orderBy: { createdAt: "desc" }
      });
      for (const p of tier3) {
        if (results.length >= limit) break;
        if (!seenIds.has(p.id)) {
          results.push(p);
          seenIds.add(p.id);
        }
      }
    }
    return results.map(toProduct);
  } catch (error) {
    throw wrapError(`getRelatedProducts("${productId}") failed`, error);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getAllProducts,
  getProductById,
  getProductBySlug,
  getProductRedirect,
  getProductsByBrand,
  getProductsByCategory,
  getProductsByIds,
  getRelatedProducts,
  searchProducts
});

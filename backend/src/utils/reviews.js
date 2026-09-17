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
var reviews_exports = {};
__export(reviews_exports, {
  getApprovedReviewsForProduct: () => getApprovedReviewsForProduct,
  getProductRatingSummary: () => getProductRatingSummary,
  hasUserReviewedProduct: () => hasUserReviewedProduct
});
module.exports = __toCommonJS(reviews_exports);
var import_server_only = require("server-only");
var import_db = require("@/lib/db");
async function getApprovedReviewsForProduct(productSlug) {
  const rows = await import_db.db.review.findMany({
    where: { status: "APPROVED", product: { slug: productSlug } },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" }
  });
  return rows.map((r) => ({
    id: r.id,
    reviewerName: r.user.name || "Anonymous",
    rating: r.rating,
    title: r.title,
    body: r.body,
    verifiedPurchase: r.verifiedPurchase,
    createdAt: r.createdAt
  }));
}
async function getProductRatingSummary(productSlug) {
  const result = await import_db.db.review.aggregate({
    where: { status: "APPROVED", product: { slug: productSlug } },
    _avg: { rating: true },
    _count: { rating: true }
  });
  return {
    averageRating: result._avg.rating,
    reviewCount: result._count.rating
  };
}
async function hasUserReviewedProduct(userId, productSlug) {
  const existing = await import_db.db.review.findFirst({
    where: { userId, product: { slug: productSlug } },
    select: { id: true }
  });
  return existing !== null;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getApprovedReviewsForProduct,
  getProductRatingSummary,
  hasUserReviewedProduct
});

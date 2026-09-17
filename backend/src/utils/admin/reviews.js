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
  ADMIN_REVIEWS_PAGE_SIZE: () => ADMIN_REVIEWS_PAGE_SIZE,
  getAdminReviewById: () => getAdminReviewById,
  getAdminReviews: () => getAdminReviews
});
module.exports = __toCommonJS(reviews_exports);
var import_server_only = require("server-only");
var import_db = require("@/lib/db");
const ADMIN_REVIEWS_PAGE_SIZE = 20;
const ADMIN_REVIEW_LIST_INCLUDE = {
  user: { select: { name: true, email: true } },
  product: { select: { name: true, slug: true } }
};
function toListItem(r) {
  return {
    id: r.id,
    productName: r.product.name,
    productSlug: r.product.slug,
    customerName: r.user.name,
    customerEmail: r.user.email,
    rating: r.rating,
    title: r.title,
    status: r.status,
    verifiedPurchase: r.verifiedPurchase,
    createdAt: r.createdAt
  };
}
async function getAdminReviews(filters) {
  const page = Math.max(1, Math.trunc(filters.page ?? 1));
  const where = {};
  if (filters.status && filters.status !== "ALL") where.status = filters.status;
  const search = filters.search?.trim();
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { body: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { product: { name: { contains: search, mode: "insensitive" } } },
      { product: { slug: { contains: search, mode: "insensitive" } } }
    ];
  }
  const [rows, totalCount] = await Promise.all([
    import_db.db.review.findMany({
      where,
      include: ADMIN_REVIEW_LIST_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_REVIEWS_PAGE_SIZE,
      take: ADMIN_REVIEWS_PAGE_SIZE
    }),
    import_db.db.review.count({ where })
  ]);
  return {
    reviews: rows.map(toListItem),
    totalCount,
    page,
    pageSize: ADMIN_REVIEWS_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(totalCount / ADMIN_REVIEWS_PAGE_SIZE))
  };
}
async function getAdminReviewById(id) {
  const r = await import_db.db.review.findUnique({ where: { id }, include: ADMIN_REVIEW_LIST_INCLUDE });
  if (!r) return null;
  return { ...toListItem(r), body: r.body };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ADMIN_REVIEWS_PAGE_SIZE,
  getAdminReviewById,
  getAdminReviews
});

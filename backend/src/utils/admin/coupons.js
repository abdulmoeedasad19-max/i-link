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
var coupons_exports = {};
__export(coupons_exports, {
  ADMIN_COUPONS_PAGE_SIZE: () => ADMIN_COUPONS_PAGE_SIZE,
  COUPON_CODE_MAX_LENGTH: () => COUPON_CODE_MAX_LENGTH,
  getAdminCouponById: () => getAdminCouponById,
  getAdminCoupons: () => getAdminCoupons,
  normalizeCouponCode: () => normalizeCouponCode
});
module.exports = __toCommonJS(coupons_exports);
var import_server_only = require("server-only");
var import_db = require("@/lib/db");
var import_coupon_status = require("@/lib/admin/coupon-status");
const ADMIN_COUPONS_PAGE_SIZE = 20;
const COUPON_CODE_MAX_LENGTH = 40;
function normalizeCouponCode(input) {
  return input.trim().toUpperCase();
}
function toListItem(c) {
  return {
    id: c.id,
    code: c.code,
    discountType: c.discountType,
    discountValue: c.discountValue.toNumber(),
    minimumOrderAmount: c.minimumOrderAmount ? c.minimumOrderAmount.toNumber() : null,
    maximumDiscountAmount: c.maximumDiscountAmount ? c.maximumDiscountAmount.toNumber() : null,
    startDate: c.startDate,
    endDate: c.endDate,
    usageLimit: c.usageLimit,
    usageCount: c.usageCount,
    isActive: c.isActive,
    status: (0, import_coupon_status.classifyCoupon)(c)
  };
}
async function getAdminCoupons(filters) {
  const page = Math.max(1, Math.trunc(filters.page ?? 1));
  const now = /* @__PURE__ */ new Date();
  const where = {};
  const search = filters.search?.trim();
  if (search) {
    where.code = { contains: search, mode: "insensitive" };
  }
  if (filters.status === "DISABLED") {
    where.isActive = false;
  } else if (filters.status === "EXHAUSTED") {
    where.id = "__unreachable_in_stage_a__";
  } else if (filters.status === "SCHEDULED") {
    where.isActive = true;
    where.startDate = { gt: now };
  } else if (filters.status === "EXPIRED") {
    where.isActive = true;
    where.endDate = { lt: now };
  } else if (filters.status === "ACTIVE") {
    where.isActive = true;
    where.AND = [
      { OR: [{ startDate: null }, { startDate: { lte: now } }] },
      { OR: [{ endDate: null }, { endDate: { gte: now } }] }
    ];
  }
  const [rows, totalCount] = await Promise.all([
    import_db.db.coupon.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_COUPONS_PAGE_SIZE,
      take: ADMIN_COUPONS_PAGE_SIZE
    }),
    import_db.db.coupon.count({ where })
  ]);
  return {
    coupons: rows.map(toListItem),
    totalCount,
    page,
    pageSize: ADMIN_COUPONS_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(totalCount / ADMIN_COUPONS_PAGE_SIZE))
  };
}
async function getAdminCouponById(id) {
  const c = await import_db.db.coupon.findUnique({ where: { id } });
  if (!c) return null;
  return { ...toListItem(c), createdAt: c.createdAt, updatedAt: c.updatedAt };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ADMIN_COUPONS_PAGE_SIZE,
  COUPON_CODE_MAX_LENGTH,
  getAdminCouponById,
  getAdminCoupons,
  normalizeCouponCode
});

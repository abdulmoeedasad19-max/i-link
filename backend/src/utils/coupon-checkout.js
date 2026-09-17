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
var coupon_checkout_exports = {};
__export(coupon_checkout_exports, {
  evaluateCouponForOrder: () => evaluateCouponForOrder,
  getCheckoutCartSummary: () => getCheckoutCartSummary
});
module.exports = __toCommonJS(coupon_checkout_exports);
var import_server_only = require("server-only");
var import_client = require("@/generated/prisma/client");
var import_db = require("@/lib/db");
var import_products_repository = require("@/lib/products-repository");
var import_coupon_status = require("@/lib/admin/coupon-status");
var import_utils = require("@/lib/utils");
var import_store_settings = require("@/lib/admin/store-settings");
const MAX_QUANTITY = 99;
async function getCheckoutCartSummary(userId) {
  const cartItems = await import_db.db.cartItem.findMany({ where: { userId } });
  if (cartItems.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }
  const lineItems = [];
  for (const item of cartItems) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > MAX_QUANTITY) {
      return {
        ok: false,
        error: "One or more items in your cart have an invalid quantity. Please review your cart and try again."
      };
    }
    const product = await (0, import_products_repository.getProductById)(item.productId);
    if (!product) {
      return {
        ok: false,
        error: "One or more items in your cart are no longer available. Please review your cart and try again."
      };
    }
    lineItems.push({
      productSlug: product.slug,
      nameSnapshot: product.name,
      price: new import_client.Prisma.Decimal(product.price),
      quantity: item.quantity
    });
  }
  const subtotal = lineItems.reduce((sum, li) => sum.plus(li.price.times(li.quantity)), new import_client.Prisma.Decimal(0));
  const settings = await (0, import_store_settings.getStoreSettings)();
  const shipping = settings.shippingCost;
  return { ok: true, summary: { lineItems, subtotal, shipping } };
}
function evaluateCouponForOrder(coupon, subtotal, now = /* @__PURE__ */ new Date()) {
  if (!coupon) {
    return { ok: false, error: "Coupon not found." };
  }
  const status = (0, import_coupon_status.classifyCoupon)(coupon, now);
  if (status === "DISABLED") return { ok: false, error: "This coupon is currently disabled." };
  if (status === "SCHEDULED") return { ok: false, error: "This coupon is not active yet." };
  if (status === "EXPIRED") return { ok: false, error: "This coupon has expired." };
  if (status === "EXHAUSTED") return { ok: false, error: "This coupon has reached its usage limit." };
  if (coupon.minimumOrderAmount && subtotal.lessThan(coupon.minimumOrderAmount)) {
    return {
      ok: false,
      error: `Minimum order amount for this coupon is ${(0, import_utils.formatPrice)(coupon.minimumOrderAmount.toNumber())}.`
    };
  }
  let discount = coupon.discountType === "PERCENTAGE" ? subtotal.times(coupon.discountValue).dividedBy(100) : coupon.discountValue;
  if (coupon.maximumDiscountAmount) {
    discount = import_client.Prisma.Decimal.min(discount, coupon.maximumDiscountAmount);
  }
  discount = import_client.Prisma.Decimal.min(discount, subtotal);
  if (discount.lessThan(0)) discount = new import_client.Prisma.Decimal(0);
  return { ok: true, discountAmount: discount };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  evaluateCouponForOrder,
  getCheckoutCartSummary
});

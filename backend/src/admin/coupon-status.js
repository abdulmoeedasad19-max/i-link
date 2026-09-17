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
var coupon_status_exports = {};
__export(coupon_status_exports, {
  classifyCoupon: () => classifyCoupon,
  couponStatusLabel: () => couponStatusLabel,
  couponStatusVariant: () => couponStatusVariant
});
module.exports = __toCommonJS(coupon_status_exports);
const couponStatusLabel = {
  DISABLED: "Disabled",
  SCHEDULED: "Scheduled",
  ACTIVE: "Active",
  EXPIRED: "Expired",
  EXHAUSTED: "Exhausted"
};
const couponStatusVariant = {
  DISABLED: "navy",
  SCHEDULED: "royal",
  ACTIVE: "success",
  EXPIRED: "error",
  EXHAUSTED: "gold"
};
function classifyCoupon(coupon, now = /* @__PURE__ */ new Date()) {
  if (!coupon.isActive) return "DISABLED";
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) return "EXHAUSTED";
  if (coupon.startDate && now < coupon.startDate) return "SCHEDULED";
  if (coupon.endDate && now > coupon.endDate) return "EXPIRED";
  return "ACTIVE";
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  classifyCoupon,
  couponStatusLabel,
  couponStatusVariant
});

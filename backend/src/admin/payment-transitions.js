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
var payment_transitions_exports = {};
__export(payment_transitions_exports, {
  ALLOWED_PAYMENT_TRANSITIONS: () => ALLOWED_PAYMENT_TRANSITIONS
});
module.exports = __toCommonJS(payment_transitions_exports);
const ALLOWED_PAYMENT_TRANSITIONS = {
  PENDING: ["PAID", "FAILED"],
  PAID: ["REFUNDED"],
  FAILED: ["PENDING", "PAID"],
  REFUNDED: []
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ALLOWED_PAYMENT_TRANSITIONS
});

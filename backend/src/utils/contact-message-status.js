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
var contact_message_status_exports = {};
__export(contact_message_status_exports, {
  contactMessageStatusLabel: () => contactMessageStatusLabel,
  contactMessageStatusVariant: () => contactMessageStatusVariant
});
module.exports = __toCommonJS(contact_message_status_exports);
const contactMessageStatusLabel = {
  NEW: "New",
  READ: "Read",
  RESOLVED: "Resolved"
};
const contactMessageStatusVariant = {
  NEW: "gold",
  READ: "royal",
  RESOLVED: "success"
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  contactMessageStatusLabel,
  contactMessageStatusVariant
});

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
var reset_token_exports = {};
__export(reset_token_exports, {
  RESET_TOKEN_EXPIRY_MINUTES: () => RESET_TOKEN_EXPIRY_MINUTES,
  RESET_TOKEN_EXPIRY_MS: () => RESET_TOKEN_EXPIRY_MS,
  generateResetToken: () => generateResetToken,
  hashResetToken: () => hashResetToken
});
module.exports = __toCommonJS(reset_token_exports);
var import_server_only = require("server-only");
var import_crypto = require("crypto");
const RAW_TOKEN_BYTES = 32;
const RESET_TOKEN_EXPIRY_MINUTES = 30;
const RESET_TOKEN_EXPIRY_MS = RESET_TOKEN_EXPIRY_MINUTES * 60 * 1e3;
function generateResetToken() {
  const raw = (0, import_crypto.randomBytes)(RAW_TOKEN_BYTES).toString("base64url");
  return { raw, hash: hashResetToken(raw) };
}
function hashResetToken(raw) {
  return (0, import_crypto.createHash)("sha256").update(raw).digest("hex");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  RESET_TOKEN_EXPIRY_MINUTES,
  RESET_TOKEN_EXPIRY_MS,
  generateResetToken,
  hashResetToken
});

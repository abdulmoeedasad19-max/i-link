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
var newsletter_unsubscribe_exports = {};
__export(newsletter_unsubscribe_exports, {
  generateUnsubscribeToken: () => generateUnsubscribeToken,
  normalizeEmail: () => normalizeEmail,
  verifyUnsubscribeToken: () => verifyUnsubscribeToken
});
module.exports = __toCommonJS(newsletter_unsubscribe_exports);
var import_server_only = require("server-only");
var import_crypto = require("crypto");
function signingKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured \u2014 cannot sign unsubscribe tokens.");
  }
  return (0, import_crypto.createHmac)("sha256", secret).update("newsletter-unsubscribe-v1").digest("hex");
}
function generateUnsubscribeToken(email) {
  return (0, import_crypto.createHmac)("sha256", signingKey()).update(email).digest("base64url");
}
function verifyUnsubscribeToken(email, token) {
  const expected = generateUnsubscribeToken(email);
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(token);
  if (expectedBuf.length !== actualBuf.length) return false;
  return (0, import_crypto.timingSafeEqual)(expectedBuf, actualBuf);
}
function normalizeEmail(email) {
  return email.trim().toLowerCase();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  generateUnsubscribeToken,
  normalizeEmail,
  verifyUnsubscribeToken
});

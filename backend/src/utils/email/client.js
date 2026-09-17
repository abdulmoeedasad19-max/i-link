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
var client_exports = {};
__export(client_exports, {
  EMAIL_FROM: () => EMAIL_FROM,
  getEmailClient: () => getEmailClient
});
module.exports = __toCommonJS(client_exports);
var import_server_only = require("server-only");
var import_resend = require("resend");
var import_site_config = require("@/lib/site-config");
let cached = null;
function getEmailClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!cached) {
    cached = new import_resend.Resend(apiKey);
  }
  return cached;
}
const EMAIL_FROM = process.env.EMAIL_FROM_ADDRESS || `${import_site_config.siteConfig.name} <no-reply@ilinksystems.com>`;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EMAIL_FROM,
  getEmailClient
});

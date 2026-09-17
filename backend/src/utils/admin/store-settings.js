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
var store_settings_exports = {};
__export(store_settings_exports, {
  STORE_SETTINGS_ID: () => STORE_SETTINGS_ID,
  getSiteConfig: () => getSiteConfig,
  getStoreSettings: () => getStoreSettings
});
module.exports = __toCommonJS(store_settings_exports);
var import_server_only = require("server-only");
var import_db = require("@/lib/db");
var import_site_config = require("@/lib/site-config");
const STORE_SETTINGS_ID = "singleton";
async function getStoreSettings() {
  const existing = await import_db.db.storeSettings.findUnique({ where: { id: STORE_SETTINGS_ID } });
  if (existing) return existing;
  return import_db.db.storeSettings.upsert({
    where: { id: STORE_SETTINGS_ID },
    update: {},
    create: { id: STORE_SETTINGS_ID }
  });
}
async function getSiteConfig() {
  const settings = await getStoreSettings();
  return {
    name: settings.storeName,
    shortName: import_site_config.siteConfig.shortName,
    url: import_site_config.siteConfig.url,
    phone: settings.phone,
    phoneHref: `tel:+92${settings.phone.replace(/\D/g, "").replace(/^0/, "")}`,
    email: settings.email,
    hours: settings.hours
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  STORE_SETTINGS_ID,
  getSiteConfig,
  getStoreSettings
});

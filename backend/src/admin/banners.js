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
var banners_exports = {};
__export(banners_exports, {
  getAdminBannerById: () => getAdminBannerById,
  getAdminBanners: () => getAdminBanners
});
module.exports = __toCommonJS(banners_exports);
var import_server_only = require("server-only");
var import_db = require("@/lib/db");
async function getAdminBanners() {
  return import_db.db.banner.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      image: true,
      imageAlt: true,
      category: true,
      title: true,
      sortOrder: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });
}
async function getAdminBannerById(id) {
  return import_db.db.banner.findUnique({
    where: { id },
    select: {
      id: true,
      image: true,
      imageAlt: true,
      category: true,
      title: true,
      description: true,
      primaryCtaLabel: true,
      primaryCtaHref: true,
      secondaryCtaLabel: true,
      secondaryCtaHref: true,
      sortOrder: true,
      isActive: true
    }
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getAdminBannerById,
  getAdminBanners
});

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
var newsletter_subscribers_exports = {};
__export(newsletter_subscribers_exports, {
  ADMIN_NEWSLETTER_SUBSCRIBERS_PAGE_SIZE: () => ADMIN_NEWSLETTER_SUBSCRIBERS_PAGE_SIZE,
  getAdminNewsletterSubscribers: () => getAdminNewsletterSubscribers
});
module.exports = __toCommonJS(newsletter_subscribers_exports);
var import_server_only = require("server-only");
var import_db = require("@/lib/db");
const ADMIN_NEWSLETTER_SUBSCRIBERS_PAGE_SIZE = 20;
async function getAdminNewsletterSubscribers(filters) {
  const page = Math.max(1, Math.trunc(filters.page ?? 1));
  const where = {};
  const search = filters.search?.trim();
  if (search) {
    where.email = { contains: search, mode: "insensitive" };
  }
  const [subscribers, totalCount] = await Promise.all([
    import_db.db.newsletterSubscriber.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_NEWSLETTER_SUBSCRIBERS_PAGE_SIZE,
      take: ADMIN_NEWSLETTER_SUBSCRIBERS_PAGE_SIZE
    }),
    import_db.db.newsletterSubscriber.count({ where })
  ]);
  return {
    subscribers,
    totalCount,
    page,
    pageSize: ADMIN_NEWSLETTER_SUBSCRIBERS_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(totalCount / ADMIN_NEWSLETTER_SUBSCRIBERS_PAGE_SIZE))
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ADMIN_NEWSLETTER_SUBSCRIBERS_PAGE_SIZE,
  getAdminNewsletterSubscribers
});

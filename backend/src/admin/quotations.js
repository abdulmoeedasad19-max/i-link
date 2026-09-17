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
var quotations_exports = {};
__export(quotations_exports, {
  ADMIN_QUOTATIONS_PAGE_SIZE: () => ADMIN_QUOTATIONS_PAGE_SIZE,
  getAdminQuotationById: () => getAdminQuotationById,
  getAdminQuotations: () => getAdminQuotations,
  getRecentAdminQuotations: () => getRecentAdminQuotations
});
module.exports = __toCommonJS(quotations_exports);
var import_server_only = require("server-only");
var import_db = require("@/lib/db");
const ADMIN_QUOTATIONS_PAGE_SIZE = 20;
function toListItem(q) {
  return {
    id: q.id,
    fullName: q.fullName,
    companyName: q.companyName,
    email: q.email,
    createdAt: q.createdAt,
    requirement: q.requirement,
    quantity: q.quantity,
    status: q.status
  };
}
async function getAdminQuotations(filters) {
  const page = Math.max(1, Math.trunc(filters.page ?? 1));
  const where = {};
  if (filters.status && filters.status !== "ALL") where.status = filters.status;
  const search = filters.search?.trim();
  if (search) {
    where.OR = [
      { id: { contains: search, mode: "insensitive" } },
      { fullName: { contains: search, mode: "insensitive" } },
      { companyName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
      { requirement: { contains: search, mode: "insensitive" } },
      { message: { contains: search, mode: "insensitive" } }
    ];
  }
  const [rows, totalCount] = await Promise.all([
    import_db.db.quotation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_QUOTATIONS_PAGE_SIZE,
      take: ADMIN_QUOTATIONS_PAGE_SIZE
    }),
    import_db.db.quotation.count({ where })
  ]);
  return {
    quotations: rows.map(toListItem),
    totalCount,
    page,
    pageSize: ADMIN_QUOTATIONS_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(totalCount / ADMIN_QUOTATIONS_PAGE_SIZE))
  };
}
async function getRecentAdminQuotations(limit) {
  const rows = await import_db.db.quotation.findMany({ orderBy: { createdAt: "desc" }, take: limit });
  return rows.map(toListItem);
}
async function getAdminQuotationById(id) {
  const q = await import_db.db.quotation.findUnique({
    where: { id },
    include: { user: { select: { email: true } } }
  });
  if (!q) return null;
  return {
    id: q.id,
    createdAt: q.createdAt,
    status: q.status,
    fullName: q.fullName,
    companyName: q.companyName,
    email: q.email,
    phone: q.phone,
    requirement: q.requirement,
    quantity: q.quantity,
    preferredContact: q.preferredContact,
    additionalRequirements: q.additionalRequirements,
    message: q.message,
    linkedAccountEmail: q.user?.email ?? null
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ADMIN_QUOTATIONS_PAGE_SIZE,
  getAdminQuotationById,
  getAdminQuotations,
  getRecentAdminQuotations
});

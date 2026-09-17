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
var contact_messages_exports = {};
__export(contact_messages_exports, {
  ADMIN_CONTACT_MESSAGES_PAGE_SIZE: () => ADMIN_CONTACT_MESSAGES_PAGE_SIZE,
  getAdminContactMessageById: () => getAdminContactMessageById,
  getAdminContactMessages: () => getAdminContactMessages
});
module.exports = __toCommonJS(contact_messages_exports);
var import_server_only = require("server-only");
var import_db = require("@/lib/db");
const ADMIN_CONTACT_MESSAGES_PAGE_SIZE = 20;
function toListItem(m) {
  return {
    id: m.id,
    name: m.name,
    email: m.email,
    subject: m.subject,
    status: m.status,
    createdAt: m.createdAt
  };
}
async function getAdminContactMessages(filters) {
  const page = Math.max(1, Math.trunc(filters.page ?? 1));
  const where = {};
  if (filters.status && filters.status !== "ALL") where.status = filters.status;
  const search = filters.search?.trim();
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { subject: { contains: search, mode: "insensitive" } }
    ];
  }
  const [rows, totalCount] = await Promise.all([
    import_db.db.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_CONTACT_MESSAGES_PAGE_SIZE,
      take: ADMIN_CONTACT_MESSAGES_PAGE_SIZE
    }),
    import_db.db.contactMessage.count({ where })
  ]);
  return {
    messages: rows.map(toListItem),
    totalCount,
    page,
    pageSize: ADMIN_CONTACT_MESSAGES_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(totalCount / ADMIN_CONTACT_MESSAGES_PAGE_SIZE))
  };
}
async function getAdminContactMessageById(id) {
  const m = await import_db.db.contactMessage.findUnique({ where: { id } });
  if (!m) return null;
  return {
    id: m.id,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
    status: m.status,
    name: m.name,
    email: m.email,
    phone: m.phone,
    subject: m.subject,
    message: m.message
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ADMIN_CONTACT_MESSAGES_PAGE_SIZE,
  getAdminContactMessageById,
  getAdminContactMessages
});

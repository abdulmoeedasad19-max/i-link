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
var activity_log_exports = {};
__export(activity_log_exports, {
  ADMIN_ACTIVITY_LOG_PAGE_SIZE: () => ADMIN_ACTIVITY_LOG_PAGE_SIZE,
  getAdminActivityLogEntityTypes: () => getAdminActivityLogEntityTypes,
  getAdminActivityLogs: () => getAdminActivityLogs,
  logActivity: () => logActivity
});
module.exports = __toCommonJS(activity_log_exports);
var import_db = require("../db");
async function logActivity(client, input) {
  await client.activityLog.create({
    data: {
      adminId: input.adminId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      description: input.description,
      metadata: input.metadata
    }
  });
}
const ADMIN_ACTIVITY_LOG_PAGE_SIZE = 20;
const ADMIN_ACTIVITY_LOG_INCLUDE = {
  admin: { select: { name: true, email: true } }
};
function toListItem(row) {
  return {
    id: row.id,
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId,
    description: row.description,
    metadata: row.metadata,
    createdAt: row.createdAt,
    adminName: row.admin.name,
    adminEmail: row.admin.email
  };
}
async function getAdminActivityLogs(filters) {
  const page = Math.max(1, Math.trunc(filters.page ?? 1));
  const where = {};
  if (filters.action && filters.action !== "ALL") where.action = filters.action;
  const entityType = filters.entityType?.trim();
  if (entityType && entityType !== "ALL") where.entityType = entityType;
  const search = filters.search?.trim();
  if (search) {
    where.OR = [
      { description: { contains: search, mode: "insensitive" } },
      { entityId: { contains: search, mode: "insensitive" } },
      { admin: { name: { contains: search, mode: "insensitive" } } },
      { admin: { email: { contains: search, mode: "insensitive" } } }
    ];
  }
  const [rows, totalCount] = await Promise.all([
    import_db.db.activityLog.findMany({
      where,
      include: ADMIN_ACTIVITY_LOG_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_ACTIVITY_LOG_PAGE_SIZE,
      take: ADMIN_ACTIVITY_LOG_PAGE_SIZE
    }),
    import_db.db.activityLog.count({ where })
  ]);
  return {
    logs: rows.map(toListItem),
    totalCount,
    page,
    pageSize: ADMIN_ACTIVITY_LOG_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(totalCount / ADMIN_ACTIVITY_LOG_PAGE_SIZE))
  };
}
async function getAdminActivityLogEntityTypes() {
  const rows = await import_db.db.activityLog.findMany({
    distinct: ["entityType"],
    select: { entityType: true },
    orderBy: { entityType: "asc" }
  });
  return rows.map((r) => r.entityType);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ADMIN_ACTIVITY_LOG_PAGE_SIZE,
  getAdminActivityLogEntityTypes,
  getAdminActivityLogs,
  logActivity
});

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
var returns_exports = {};
__export(returns_exports, {
  ADMIN_RETURNS_PAGE_SIZE: () => ADMIN_RETURNS_PAGE_SIZE,
  getAdminReturnRequestById: () => getAdminReturnRequestById,
  getAdminReturnRequests: () => getAdminReturnRequests
});
module.exports = __toCommonJS(returns_exports);
var import_server_only = require("server-only");
var import_db = require("@/lib/db");
const ADMIN_RETURNS_PAGE_SIZE = 20;
const ADMIN_RETURN_LIST_INCLUDE = {
  order: { select: { id: true, total: true } },
  user: { select: { name: true, email: true } }
};
function toListItem(r) {
  return {
    id: r.id,
    createdAt: r.createdAt,
    status: r.status,
    reason: r.reason,
    orderId: r.order.id,
    orderTotal: r.order.total.toNumber(),
    customerName: r.user.name,
    customerEmail: r.user.email
  };
}
async function getAdminReturnRequests(filters) {
  const page = Math.max(1, Math.trunc(filters.page ?? 1));
  const where = {};
  if (filters.status && filters.status !== "ALL") where.status = filters.status;
  const search = filters.search?.trim();
  if (search) {
    where.OR = [
      { id: { contains: search, mode: "insensitive" } },
      { orderId: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } }
    ];
  }
  const [rows, totalCount] = await Promise.all([
    import_db.db.returnRequest.findMany({
      where,
      include: ADMIN_RETURN_LIST_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_RETURNS_PAGE_SIZE,
      take: ADMIN_RETURNS_PAGE_SIZE
    }),
    import_db.db.returnRequest.count({ where })
  ]);
  return {
    returnRequests: rows.map(toListItem),
    totalCount,
    page,
    pageSize: ADMIN_RETURNS_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(totalCount / ADMIN_RETURNS_PAGE_SIZE))
  };
}
async function getAdminReturnRequestById(id) {
  const r = await import_db.db.returnRequest.findUnique({
    where: { id },
    include: {
      order: { select: { id: true, createdAt: true, total: true, status: true, deliveredAt: true } },
      user: { select: { id: true, name: true, email: true, phone: true } }
    }
  });
  if (!r) return null;
  return {
    id: r.id,
    createdAt: r.createdAt,
    status: r.status,
    reason: r.reason,
    rejectionReason: r.rejectionReason,
    order: {
      id: r.order.id,
      createdAt: r.order.createdAt,
      total: r.order.total.toNumber(),
      status: r.order.status,
      deliveredAt: r.order.deliveredAt
    },
    customer: {
      id: r.user.id,
      name: r.user.name,
      email: r.user.email,
      phone: r.user.phone
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ADMIN_RETURNS_PAGE_SIZE,
  getAdminReturnRequestById,
  getAdminReturnRequests
});

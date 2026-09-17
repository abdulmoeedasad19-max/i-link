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
var customers_exports = {};
__export(customers_exports, {
  ADMIN_CUSTOMERS_PAGE_SIZE: () => ADMIN_CUSTOMERS_PAGE_SIZE,
  getAdminCustomerById: () => getAdminCustomerById,
  getAdminCustomerCount: () => getAdminCustomerCount,
  getAdminCustomers: () => getAdminCustomers
});
module.exports = __toCommonJS(customers_exports);
var import_server_only = require("server-only");
var import_db = require("@/lib/db");
const ADMIN_CUSTOMERS_PAGE_SIZE = 20;
const CUSTOMER_ORDER_HISTORY_LIMIT = 20;
const CUSTOMER_QUOTATION_HISTORY_LIMIT = 20;
const ADMIN_CUSTOMER_LIST_INCLUDE = {
  _count: { select: { orders: true, quotations: true, addresses: true } }
};
function toListItem(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    createdAt: u.createdAt,
    orderCount: u._count.orders,
    quotationCount: u._count.quotations,
    addressCount: u._count.addresses
  };
}
async function getAdminCustomerCount() {
  return import_db.db.user.count();
}
async function getAdminCustomers(filters) {
  const page = Math.max(1, Math.trunc(filters.page ?? 1));
  const where = {};
  if (filters.role && filters.role !== "ALL") where.role = filters.role;
  const search = filters.search?.trim();
  if (search) {
    where.OR = [
      { id: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } }
    ];
  }
  const [rows, totalCount] = await Promise.all([
    import_db.db.user.findMany({
      where,
      include: ADMIN_CUSTOMER_LIST_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_CUSTOMERS_PAGE_SIZE,
      take: ADMIN_CUSTOMERS_PAGE_SIZE
    }),
    import_db.db.user.count({ where })
  ]);
  return {
    customers: rows.map(toListItem),
    totalCount,
    page,
    pageSize: ADMIN_CUSTOMERS_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(totalCount / ADMIN_CUSTOMERS_PAGE_SIZE))
  };
}
async function getAdminCustomerById(id) {
  const user = await import_db.db.user.findUnique({
    where: { id },
    // Deliberately not selecting passwordHash, accounts, or sessions —
    // nothing security-sensitive ever leaves this function.
    include: {
      addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] },
      orders: { orderBy: { createdAt: "desc" }, take: CUSTOMER_ORDER_HISTORY_LIMIT },
      quotations: { orderBy: { createdAt: "desc" }, take: CUSTOMER_QUOTATION_HISTORY_LIMIT },
      _count: { select: { orders: true, quotations: true, addresses: true } }
    }
  });
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
    addresses: user.addresses.map((a) => ({
      id: a.id,
      label: a.label,
      line1: a.line1,
      line2: a.line2,
      city: a.city,
      province: a.province,
      postalCode: a.postalCode,
      phone: a.phone,
      isDefault: a.isDefault
    })),
    orders: user.orders.map((o) => ({
      id: o.id,
      createdAt: o.createdAt,
      total: o.total.toNumber(),
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      status: o.status
    })),
    quotations: user.quotations.map((q) => ({
      id: q.id,
      createdAt: q.createdAt,
      requirement: q.requirement,
      quantity: q.quantity,
      status: q.status
    })),
    orderCount: user._count.orders,
    quotationCount: user._count.quotations,
    addressCount: user._count.addresses
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ADMIN_CUSTOMERS_PAGE_SIZE,
  getAdminCustomerById,
  getAdminCustomerCount,
  getAdminCustomers
});

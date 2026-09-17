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
var orders_exports = {};
__export(orders_exports, {
  ADMIN_ORDERS_PAGE_SIZE: () => ADMIN_ORDERS_PAGE_SIZE,
  getAdminOrderById: () => getAdminOrderById,
  getAdminOrderCount: () => getAdminOrderCount,
  getAdminOrders: () => getAdminOrders,
  getAdminRevenueSummary: () => getAdminRevenueSummary,
  getRecentAdminOrders: () => getRecentAdminOrders,
  getTopSellingProducts: () => getTopSellingProducts
});
module.exports = __toCommonJS(orders_exports);
var import_server_only = require("server-only");
var import_db = require("@/lib/db");
const ADMIN_ORDERS_PAGE_SIZE = 20;
const ADMIN_ORDER_LIST_INCLUDE = {
  user: { select: { name: true, email: true } },
  items: { select: { quantity: true } }
};
function toListItem(o) {
  return {
    id: o.id,
    customerName: o.user.name,
    customerEmail: o.user.email,
    createdAt: o.createdAt,
    // Same "sum of line-item quantities" definition already used by
    // src/app/(storefront)/account/orders/page.tsx — not a count of
    // distinct line items.
    itemCount: o.items.reduce((sum, item) => sum + item.quantity, 0),
    total: o.total.toNumber(),
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    status: o.status
  };
}
async function getAdminOrders(filters) {
  const page = Math.max(1, Math.trunc(filters.page ?? 1));
  const where = {};
  if (filters.status && filters.status !== "ALL") where.status = filters.status;
  if (filters.paymentStatus && filters.paymentStatus !== "ALL") where.paymentStatus = filters.paymentStatus;
  if (filters.paymentMethod && filters.paymentMethod !== "ALL") where.paymentMethod = filters.paymentMethod;
  const search = filters.search?.trim();
  if (search) {
    where.OR = [
      { id: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } }
    ];
  }
  const [rows, totalCount] = await Promise.all([
    import_db.db.order.findMany({
      where,
      include: ADMIN_ORDER_LIST_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_ORDERS_PAGE_SIZE,
      take: ADMIN_ORDERS_PAGE_SIZE
    }),
    import_db.db.order.count({ where })
  ]);
  return {
    orders: rows.map(toListItem),
    totalCount,
    page,
    pageSize: ADMIN_ORDERS_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(totalCount / ADMIN_ORDERS_PAGE_SIZE))
  };
}
async function getRecentAdminOrders(limit) {
  const rows = await import_db.db.order.findMany({
    include: ADMIN_ORDER_LIST_INCLUDE,
    orderBy: { createdAt: "desc" },
    take: limit
  });
  return rows.map(toListItem);
}
async function getAdminOrderCount() {
  return import_db.db.order.count();
}
async function getAdminRevenueSummary() {
  const result = await import_db.db.order.aggregate({
    where: { status: { not: "CANCELLED" } },
    _sum: { total: true }
  });
  return result._sum.total?.toNumber() ?? 0;
}
async function getTopSellingProducts(limit) {
  const grouped = await import_db.db.orderItem.groupBy({
    by: ["productSlug"],
    where: { order: { status: { not: "CANCELLED" } } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit
  });
  if (grouped.length === 0) return [];
  const slugs = grouped.map((g) => g.productSlug);
  const names = await import_db.db.orderItem.findMany({
    where: { productSlug: { in: slugs } },
    distinct: ["productSlug"],
    select: { productSlug: true, nameSnapshot: true }
  });
  const nameBySlug = new Map(names.map((n) => [n.productSlug, n.nameSnapshot]));
  return grouped.map((g) => ({
    productSlug: g.productSlug,
    nameSnapshot: nameBySlug.get(g.productSlug) ?? g.productSlug,
    quantitySold: g._sum.quantity ?? 0
  }));
}
async function getAdminOrderById(id) {
  const order = await import_db.db.order.findUnique({
    where: { id },
    include: {
      // passwordHash and every other credential/internal field are
      // deliberately excluded — only what order management needs.
      user: { select: { id: true, name: true, email: true, phone: true } },
      shippingAddress: true,
      items: true
    }
  });
  if (!order) return null;
  const shipping = order.shippingLabel ? {
    label: order.shippingLabel,
    line1: order.shippingLine1 ?? "",
    line2: order.shippingLine2,
    city: order.shippingCity ?? "",
    province: order.shippingProvince ?? "",
    postalCode: order.shippingPostalCode ?? "",
    phone: order.shippingPhone ?? ""
  } : order.shippingAddress ? {
    label: order.shippingAddress.label,
    line1: order.shippingAddress.line1,
    line2: order.shippingAddress.line2,
    city: order.shippingAddress.city,
    province: order.shippingAddress.province,
    postalCode: order.shippingAddress.postalCode,
    phone: order.shippingAddress.phone
  } : null;
  return {
    id: order.id,
    createdAt: order.createdAt,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    transactionId: order.transactionId,
    paidAt: order.paidAt,
    refundReason: order.refundReason,
    refundedAt: order.refundedAt,
    subtotal: order.subtotal.toNumber(),
    total: order.total.toNumber(),
    discountCode: order.discountCode,
    discountAmount: order.discountAmount ? order.discountAmount.toNumber() : null,
    customer: order.user,
    shipping,
    items: order.items.map((item) => ({
      id: item.id,
      productSlug: item.productSlug,
      nameSnapshot: item.nameSnapshot,
      priceSnapshot: item.priceSnapshot.toNumber(),
      quantity: item.quantity,
      // Decimal arithmetic for the line total (multiply before converting
      // to number) — never plain-float price * quantity.
      lineTotal: item.priceSnapshot.times(item.quantity).toNumber()
    }))
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ADMIN_ORDERS_PAGE_SIZE,
  getAdminOrderById,
  getAdminOrderCount,
  getAdminOrders,
  getAdminRevenueSummary,
  getRecentAdminOrders,
  getTopSellingProducts
});

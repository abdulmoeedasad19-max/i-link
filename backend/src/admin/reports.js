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
var reports_exports = {};
__export(reports_exports, {
  getAdminReportSummary: () => getAdminReportSummary,
  getTopSellingProductsInRange: () => getTopSellingProductsInRange
});
module.exports = __toCommonJS(reports_exports);
var import_server_only = require("server-only");
var import_db = require("@/lib/db");
var import_client = require("@/generated/prisma/client");
async function getAdminReportSummary(range) {
  const where = {
    status: { not: "CANCELLED" },
    createdAt: { gte: range.start, lte: range.end }
  };
  const [aggregate, orderCount] = await Promise.all([
    import_db.db.order.aggregate({ where, _sum: { total: true } }),
    import_db.db.order.count({ where })
  ]);
  const revenueDecimal = aggregate._sum.total ?? new import_client.Prisma.Decimal(0);
  const averageOrderValue = orderCount > 0 ? revenueDecimal.dividedBy(orderCount).toNumber() : 0;
  return {
    revenue: revenueDecimal.toNumber(),
    orderCount,
    averageOrderValue
  };
}
async function getTopSellingProductsInRange(range, limit) {
  const grouped = await import_db.db.orderItem.groupBy({
    by: ["productSlug"],
    where: {
      order: {
        status: { not: "CANCELLED" },
        createdAt: { gte: range.start, lte: range.end }
      }
    },
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getAdminReportSummary,
  getTopSellingProductsInRange
});

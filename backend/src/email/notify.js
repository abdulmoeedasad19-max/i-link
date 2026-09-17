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
var notify_exports = {};
__export(notify_exports, {
  notifyOrderConfirmation: () => notifyOrderConfirmation,
  notifyOrderStatusChange: () => notifyOrderStatusChange,
  notifyPasswordReset: () => notifyPasswordReset,
  notifyPaymentConfirmation: () => notifyPaymentConfirmation,
  notifyRefund: () => notifyRefund,
  notifyReturnApproved: () => notifyReturnApproved,
  notifyReturnRejected: () => notifyReturnRejected,
  notifyReturnSubmitted: () => notifyReturnSubmitted,
  notifyWelcome: () => notifyWelcome
});
module.exports = __toCommonJS(notify_exports);
var import_server_only = require("server-only");
var import_db = require("@/lib/db");
var import_send = require("./send");
var import_templates = require("./templates");
function customerDisplayName(name, email) {
  return name && name.trim().length > 0 ? name : email;
}
async function safeSend(build, context) {
  try {
    await build();
  } catch (err) {
    console.error(`[email] notify.${context} failed:`, err instanceof Error ? err.message : err);
  }
}
function notifyWelcome(data) {
  void safeSend(async () => {
    const content = (0, import_templates.welcomeEmail)({ name: data.name });
    await (0, import_send.sendEmail)({ to: data.email, ...content });
  }, "notifyWelcome");
}
function notifyPasswordReset(data) {
  void safeSend(async () => {
    const content = (0, import_templates.passwordResetEmail)({ name: data.name, token: data.token });
    await (0, import_send.sendEmail)({ to: data.email, ...content });
  }, "notifyPasswordReset");
}
function notifyOrderConfirmation(orderId) {
  void safeSend(async () => {
    const order = await import_db.db.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: { select: { name: true, email: true } } }
    });
    if (!order) return;
    const content = (0, import_templates.orderConfirmationEmail)({
      orderId: order.id,
      customerName: customerDisplayName(order.user.name, order.user.email),
      createdAt: order.createdAt,
      items: order.items.map((i) => ({
        name: i.nameSnapshot,
        quantity: i.quantity,
        lineTotal: i.priceSnapshot.toNumber() * i.quantity
      })),
      subtotal: order.subtotal.toNumber(),
      discountCode: order.discountCode,
      discountAmount: order.discountAmount?.toNumber() ?? null,
      shippingAmount: order.shippingAmount?.toNumber() ?? null,
      total: order.total.toNumber(),
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      shippingLabel: order.shippingLabel,
      shippingLines: order.shippingLabel ? [order.shippingLine1, order.shippingLine2, order.shippingCity, order.shippingProvince].filter(Boolean).join(", ") : null
    });
    await (0, import_send.sendEmail)({ to: order.user.email, ...content });
  }, "notifyOrderConfirmation");
}
function notifyOrderStatusChange(orderId, status) {
  void safeSend(async () => {
    const order = await import_db.db.order.findUnique({
      where: { id: orderId },
      select: { id: true, user: { select: { name: true, email: true } } }
    });
    if (!order) return;
    const content = (0, import_templates.orderStatusChangeEmail)({
      orderId: order.id,
      customerName: customerDisplayName(order.user.name, order.user.email),
      status
    });
    if (!content) return;
    await (0, import_send.sendEmail)({ to: order.user.email, ...content });
  }, "notifyOrderStatusChange");
}
function notifyPaymentConfirmation(orderId) {
  void safeSend(async () => {
    const order = await import_db.db.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        total: true,
        paymentMethod: true,
        transactionId: true,
        paidAt: true,
        user: { select: { name: true, email: true } }
      }
    });
    if (!order || !order.paidAt) return;
    const content = (0, import_templates.paymentConfirmationEmail)({
      orderId: order.id,
      customerName: customerDisplayName(order.user.name, order.user.email),
      amount: order.total.toNumber(),
      paymentMethod: order.paymentMethod,
      transactionId: order.transactionId,
      paidAt: order.paidAt
    });
    await (0, import_send.sendEmail)({ to: order.user.email, ...content });
  }, "notifyPaymentConfirmation");
}
function notifyRefund(orderId) {
  void safeSend(async () => {
    const order = await import_db.db.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        total: true,
        paymentMethod: true,
        refundedAt: true,
        user: { select: { name: true, email: true } }
      }
    });
    if (!order || !order.refundedAt) return;
    const content = (0, import_templates.refundEmail)({
      orderId: order.id,
      customerName: customerDisplayName(order.user.name, order.user.email),
      amount: order.total.toNumber(),
      paymentMethod: order.paymentMethod,
      refundedAt: order.refundedAt
    });
    await (0, import_send.sendEmail)({ to: order.user.email, ...content });
  }, "notifyRefund");
}
function notifyReturnSubmitted(returnRequestId) {
  void safeSend(async () => {
    const returnRequest = await import_db.db.returnRequest.findUnique({
      where: { id: returnRequestId },
      select: {
        id: true,
        orderId: true,
        reason: true,
        createdAt: true,
        user: { select: { name: true, email: true } }
      }
    });
    if (!returnRequest) return;
    const content = (0, import_templates.returnSubmittedEmail)({
      orderId: returnRequest.orderId,
      returnRequestId: returnRequest.id,
      customerName: customerDisplayName(returnRequest.user.name, returnRequest.user.email),
      reason: returnRequest.reason,
      submittedAt: returnRequest.createdAt
    });
    await (0, import_send.sendEmail)({ to: returnRequest.user.email, ...content });
  }, "notifyReturnSubmitted");
}
function notifyReturnApproved(returnRequestId) {
  void safeSend(async () => {
    const returnRequest = await import_db.db.returnRequest.findUnique({
      where: { id: returnRequestId },
      select: { id: true, orderId: true, user: { select: { name: true, email: true } } }
    });
    if (!returnRequest) return;
    const content = (0, import_templates.returnApprovedEmail)({
      orderId: returnRequest.orderId,
      returnRequestId: returnRequest.id,
      customerName: customerDisplayName(returnRequest.user.name, returnRequest.user.email)
    });
    await (0, import_send.sendEmail)({ to: returnRequest.user.email, ...content });
  }, "notifyReturnApproved");
}
function notifyReturnRejected(returnRequestId) {
  void safeSend(async () => {
    const returnRequest = await import_db.db.returnRequest.findUnique({
      where: { id: returnRequestId },
      select: {
        id: true,
        orderId: true,
        rejectionReason: true,
        user: { select: { name: true, email: true } }
      }
    });
    if (!returnRequest) return;
    const content = (0, import_templates.returnRejectedEmail)({
      orderId: returnRequest.orderId,
      returnRequestId: returnRequest.id,
      customerName: customerDisplayName(returnRequest.user.name, returnRequest.user.email),
      rejectionReason: returnRequest.rejectionReason
    });
    await (0, import_send.sendEmail)({ to: returnRequest.user.email, ...content });
  }, "notifyReturnRejected");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  notifyOrderConfirmation,
  notifyOrderStatusChange,
  notifyPasswordReset,
  notifyPaymentConfirmation,
  notifyRefund,
  notifyReturnApproved,
  notifyReturnRejected,
  notifyReturnSubmitted,
  notifyWelcome
});

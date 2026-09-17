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
var templates_exports = {};
__export(templates_exports, {
  orderConfirmationEmail: () => orderConfirmationEmail,
  orderStatusChangeEmail: () => orderStatusChangeEmail,
  passwordResetEmail: () => passwordResetEmail,
  paymentConfirmationEmail: () => paymentConfirmationEmail,
  refundEmail: () => refundEmail,
  returnApprovedEmail: () => returnApprovedEmail,
  returnRejectedEmail: () => returnRejectedEmail,
  returnSubmittedEmail: () => returnSubmittedEmail,
  shortId: () => shortId,
  welcomeEmail: () => welcomeEmail
});
module.exports = __toCommonJS(templates_exports);
var import_server_only = require("server-only");
var import_utils = require("@/lib/utils");
var import_payment = require("@/lib/payment");
var import_order_status = require("@/lib/order-status");
var import_return_status = require("@/lib/return-status");
var import_reset_token = require("@/lib/reset-token");
var import_layout = require("./layout");
function shortId(id) {
  return `#${id.slice(-8).toUpperCase()}`;
}
function formatDate(date) {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
function welcomeEmail(data) {
  const button = { label: "Go to My Account", url: (0, import_layout.absoluteUrl)("/account") };
  const paragraphs = [
    `Hi ${data.name}, welcome to i.Link Systems & Solutions! Your account has been created successfully.`,
    "You can now sign in any time to track orders, manage your addresses, and request returns.",
    "If you didn't create this account, please contact our support team right away."
  ];
  return {
    subject: "Welcome to i.Link Systems & Solutions",
    html: (0, import_layout.renderEmailHtml)({
      preheader: "Your i.Link account is ready.",
      bodyHtml: [(0, import_layout.emailHeading)("Welcome!"), ...paragraphs.map(import_layout.emailParagraph)].join(""),
      button
    }),
    text: (0, import_layout.renderEmailText)({ heading: "Welcome!", paragraphs, button })
  };
}
function orderConfirmationEmail(data) {
  const orderNo = shortId(data.orderId);
  const button = { label: "View Order", url: (0, import_layout.absoluteUrl)(`/account/orders/${data.orderId}`) };
  const itemLines = data.items.map((i) => `${i.quantity} \xD7 ${i.name} \u2014 ${(0, import_utils.formatPrice)(i.lineTotal)}`);
  const details = [
    { label: "Order", value: orderNo },
    { label: "Date", value: formatDate(data.createdAt) },
    { label: "Subtotal", value: (0, import_utils.formatPrice)(data.subtotal) }
  ];
  if (data.discountAmount != null && data.discountCode) {
    details.push({ label: `Discount (${data.discountCode})`, value: `-${(0, import_utils.formatPrice)(data.discountAmount)}` });
  }
  details.push({ label: "Shipping", value: data.shippingAmount ? (0, import_utils.formatPrice)(data.shippingAmount) : "Free" });
  details.push({ label: "Total", value: (0, import_utils.formatPrice)(data.total) });
  details.push({ label: "Payment Method", value: import_payment.paymentMethodLabel[data.paymentMethod] });
  details.push({ label: "Payment Status", value: import_payment.paymentStatusLabel[data.paymentStatus] });
  if (data.shippingLabel) {
    details.push({ label: "Shipping Address", value: `${data.shippingLabel} \u2014 ${data.shippingLines ?? ""}` });
  }
  const paragraphs = [
    `Hi ${data.customerName}, thanks for your order! We've received it and will begin processing it shortly.`,
    `Items: ${itemLines.join("; ")}.`
  ];
  return {
    subject: `Order Confirmed \u2014 ${orderNo}`,
    html: (0, import_layout.renderEmailHtml)({
      preheader: `Your order ${orderNo} has been received.`,
      bodyHtml: [
        (0, import_layout.emailHeading)("Order Confirmed"),
        ...paragraphs.map(import_layout.emailParagraph),
        (0, import_layout.emailDetailsTable)(details)
      ].join(""),
      button
    }),
    text: (0, import_layout.renderEmailText)({ heading: "Order Confirmed", paragraphs, details, button })
  };
}
const STATUS_COPY = {
  CONFIRMED: {
    subject: "Order Confirmed",
    heading: "Your Order Has Been Confirmed",
    body: "We've confirmed your order and it's now being prepared."
  },
  SHIPPED: {
    subject: "Order Shipped",
    heading: "Your Order Is On Its Way",
    body: "Your order has been shipped and is on its way to you."
  },
  DELIVERED: {
    subject: "Order Delivered",
    heading: "Your Order Has Been Delivered",
    body: "Your order has been marked as delivered. If you need to request a return, you have 7 days from today."
  },
  CANCELLED: {
    subject: "Order Cancelled",
    heading: "Your Order Has Been Cancelled",
    body: "Your order has been cancelled. If you have any questions, please contact our support team."
  }
};
function orderStatusChangeEmail(data) {
  const copy = STATUS_COPY[data.status];
  if (!copy) return null;
  const orderNo = shortId(data.orderId);
  const button = { label: "View Order", url: (0, import_layout.absoluteUrl)(`/account/orders/${data.orderId}`) };
  const paragraphs = [`Hi ${data.customerName}, ${copy.body}`];
  const details = [
    { label: "Order", value: orderNo },
    { label: "Status", value: import_order_status.orderStatusLabel[data.status] }
  ];
  return {
    subject: `${copy.subject} \u2014 ${orderNo}`,
    html: (0, import_layout.renderEmailHtml)({
      preheader: copy.body,
      bodyHtml: [(0, import_layout.emailHeading)(copy.heading), ...paragraphs.map(import_layout.emailParagraph), (0, import_layout.emailDetailsTable)(details)].join(""),
      button
    }),
    text: (0, import_layout.renderEmailText)({ heading: copy.heading, paragraphs, details, button })
  };
}
function paymentConfirmationEmail(data) {
  const orderNo = shortId(data.orderId);
  const button = { label: "View Order", url: (0, import_layout.absoluteUrl)(`/account/orders/${data.orderId}`) };
  const paragraphs = [`Hi ${data.customerName}, we've confirmed your payment for order ${orderNo}.`];
  const details = [
    { label: "Order", value: orderNo },
    { label: "Amount", value: (0, import_utils.formatPrice)(data.amount) },
    { label: "Payment Method", value: import_payment.paymentMethodLabel[data.paymentMethod] }
  ];
  if (data.transactionId) {
    details.push({ label: "Transaction ID", value: data.transactionId });
  }
  details.push({ label: "Status", value: "Paid" }, { label: "Date", value: formatDate(data.paidAt) });
  return {
    subject: `Payment Confirmed \u2014 ${orderNo}`,
    html: (0, import_layout.renderEmailHtml)({
      preheader: `Payment confirmed for order ${orderNo}.`,
      bodyHtml: [
        (0, import_layout.emailHeading)("Payment Confirmed"),
        ...paragraphs.map(import_layout.emailParagraph),
        (0, import_layout.emailDetailsTable)(details)
      ].join(""),
      button
    }),
    text: (0, import_layout.renderEmailText)({ heading: "Payment Confirmed", paragraphs, details, button })
  };
}
function refundEmail(data) {
  const orderNo = shortId(data.orderId);
  const button = { label: "View Order", url: (0, import_layout.absoluteUrl)(`/account/orders/${data.orderId}`) };
  const paragraphs = [`Hi ${data.customerName}, your payment for order ${orderNo} has been refunded.`];
  const details = [
    { label: "Order", value: orderNo },
    { label: "Refund Amount", value: (0, import_utils.formatPrice)(data.amount) },
    { label: "Payment Method", value: import_payment.paymentMethodLabel[data.paymentMethod] },
    { label: "Payment Status", value: "Refunded" },
    { label: "Date", value: formatDate(data.refundedAt) }
  ];
  return {
    subject: `Refund Processed \u2014 ${orderNo}`,
    html: (0, import_layout.renderEmailHtml)({
      preheader: `Your refund for order ${orderNo} has been processed.`,
      bodyHtml: [(0, import_layout.emailHeading)("Refund Processed"), ...paragraphs.map(import_layout.emailParagraph), (0, import_layout.emailDetailsTable)(details)].join(""),
      button
    }),
    text: (0, import_layout.renderEmailText)({ heading: "Refund Processed", paragraphs, details, button })
  };
}
function returnSubmittedEmail(data) {
  const orderNo = shortId(data.orderId);
  const returnNo = shortId(data.returnRequestId);
  const button = { label: "View Order", url: (0, import_layout.absoluteUrl)(`/account/orders/${data.orderId}`) };
  const paragraphs = [
    `Hi ${data.customerName}, we've received your return request for order ${orderNo}. Our team will review it and let you know the outcome.`
  ];
  const details = [
    { label: "Order", value: orderNo },
    { label: "Return Request", value: returnNo },
    { label: "Reason", value: data.reason },
    { label: "Status", value: import_return_status.returnStatusLabel.PENDING },
    { label: "Submitted", value: formatDate(data.submittedAt) }
  ];
  return {
    subject: `Return Request Received \u2014 ${orderNo}`,
    html: (0, import_layout.renderEmailHtml)({
      preheader: `We've received your return request for order ${orderNo}.`,
      bodyHtml: [
        (0, import_layout.emailHeading)("Return Request Received"),
        ...paragraphs.map(import_layout.emailParagraph),
        (0, import_layout.emailDetailsTable)(details),
        (0, import_layout.emailLinkParagraph)("See our ", (0, import_layout.absoluteUrl)("/returns"), "Returns page", " for how this process works.")
      ].join(""),
      button
    }),
    text: (0, import_layout.renderEmailText)({
      heading: "Return Request Received",
      paragraphs: [...paragraphs, `Returns policy: ${(0, import_layout.absoluteUrl)("/returns")}`],
      details,
      button
    })
  };
}
function returnApprovedEmail(data) {
  const orderNo = shortId(data.orderId);
  const returnNo = shortId(data.returnRequestId);
  const button = { label: "View Order", url: (0, import_layout.absoluteUrl)(`/account/orders/${data.orderId}`) };
  const paragraphs = [
    `Hi ${data.customerName}, your return request for order ${orderNo} has been approved.`,
    // Explicit, deliberate wording — approval is not a refund. Matches the
    // exact framing already used in ReturnRequestSection and the Refund
    // Policy page: never claim the customer has already been refunded.
    "This means your request has been accepted for processing. Any applicable refund is handled as a separate step \u2014 see our Refund Policy for how that works."
  ];
  const details = [
    { label: "Order", value: orderNo },
    { label: "Return Request", value: returnNo },
    { label: "Status", value: import_return_status.returnStatusLabel.APPROVED }
  ];
  return {
    subject: `Return Request Approved \u2014 ${orderNo}`,
    html: (0, import_layout.renderEmailHtml)({
      preheader: `Your return request for order ${orderNo} has been approved.`,
      bodyHtml: [
        (0, import_layout.emailHeading)("Return Request Approved"),
        ...paragraphs.map(import_layout.emailParagraph),
        (0, import_layout.emailDetailsTable)(details),
        (0, import_layout.emailLinkParagraph)("", (0, import_layout.absoluteUrl)("/policies/refunds"), "Refund Policy")
      ].join(""),
      button
    }),
    text: (0, import_layout.renderEmailText)({
      heading: "Return Request Approved",
      paragraphs: [...paragraphs, `Refund Policy: ${(0, import_layout.absoluteUrl)("/policies/refunds")}`],
      details,
      button
    })
  };
}
function returnRejectedEmail(data) {
  const orderNo = shortId(data.orderId);
  const returnNo = shortId(data.returnRequestId);
  const button = { label: "Contact Support", url: (0, import_layout.absoluteUrl)("/support") };
  const paragraphs = [`Hi ${data.customerName}, your return request for order ${orderNo} was not approved.`];
  const details = [
    { label: "Order", value: orderNo },
    { label: "Return Request", value: returnNo },
    { label: "Status", value: import_return_status.returnStatusLabel.REJECTED }
  ];
  if (data.rejectionReason) {
    details.push({ label: "Reason", value: data.rejectionReason });
  }
  paragraphs.push("If you have questions about this decision, our support team is happy to help.");
  return {
    subject: `Return Request Update \u2014 ${orderNo}`,
    html: (0, import_layout.renderEmailHtml)({
      preheader: `An update on your return request for order ${orderNo}.`,
      bodyHtml: [
        (0, import_layout.emailHeading)("Return Request Update"),
        ...paragraphs.map(import_layout.emailParagraph),
        (0, import_layout.emailDetailsTable)(details)
      ].join(""),
      button
    }),
    text: (0, import_layout.renderEmailText)({ heading: "Return Request Update", paragraphs, details, button })
  };
}
function passwordResetEmail(data) {
  const resetUrl = (0, import_layout.absoluteUrl)(`/reset-password?token=${encodeURIComponent(data.token)}`);
  const button = { label: "Reset Password", url: resetUrl };
  const greetingName = data.name && data.name.trim().length > 0 ? data.name : "there";
  const paragraphs = [
    `Hi ${greetingName}, we received a request to reset the password for your i.Link account.`,
    `Click the button below to choose a new password. This link will expire in ${import_reset_token.RESET_TOKEN_EXPIRY_MINUTES} minutes and can only be used once.`,
    "If you did not request this, you can safely ignore this email \u2014 your password will not be changed."
  ];
  return {
    subject: "Reset Your i.Link Password",
    html: (0, import_layout.renderEmailHtml)({
      preheader: "Reset your i.Link account password.",
      bodyHtml: [(0, import_layout.emailHeading)("Reset Your Password"), ...paragraphs.map(import_layout.emailParagraph)].join(""),
      button
    }),
    text: (0, import_layout.renderEmailText)({ heading: "Reset Your Password", paragraphs, button })
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  orderConfirmationEmail,
  orderStatusChangeEmail,
  passwordResetEmail,
  paymentConfirmationEmail,
  refundEmail,
  returnApprovedEmail,
  returnRejectedEmail,
  returnSubmittedEmail,
  shortId,
  welcomeEmail
});

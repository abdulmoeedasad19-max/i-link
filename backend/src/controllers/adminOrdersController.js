const db = require('../config/db');
const { orderStatusLabel } = require('../utils/order-status'); // Adjust imports as necessary
const { paymentStatusLabel } = require('../utils/payment');
const { ALLOWED_ORDER_TRANSITIONS } = require('../utils/admin/order-transitions');
const { ALLOWED_PAYMENT_TRANSITIONS } = require('../utils/admin/payment-transitions');
const { logActivity } = require('../utils/admin/activity-log');
// const { notifyOrderStatusChange, notifyPaymentConfirmation, notifyRefund } = require('../utils/notify');

const VALID_STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
const VALID_PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"];

class RaceLostError extends Error {}

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { currentStatus, nextStatus } = req.body;
    const adminId = req.user?.id || 'admin';

    if (!VALID_STATUSES.includes(nextStatus) || !VALID_STATUSES.includes(currentStatus)) {
      return res.status(400).json({ error: "Invalid order status." });
    }

    const order = await db.order.findUnique({ where: { id: orderId }, select: { status: true } });
    if (!order) {
      return res.status(404).json({ error: "This order no longer exists." });
    }

    const allowed = ALLOWED_ORDER_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(nextStatus)) {
      return res.status(400).json({
        error: `This order can't be moved to the new status.`,
      });
    }

    await db.$transaction(async (tx) => {
      const result = await tx.order.updateMany({
        where: { id: orderId, status: order.status },
        data: { status: nextStatus, ...(nextStatus === "DELIVERED" ? { deliveredAt: new Date() } : {}) },
      });
      if (result.count === 0) {
        throw new RaceLostError();
      }
      await logActivity(tx, {
        adminId,
        action: "STATUS_CHANGE",
        entityType: "ORDER",
        entityId: orderId,
        description: `Changed order status from ${order.status} to ${nextStatus}`,
        metadata: { field: "status", from: order.status, to: nextStatus },
      });
    });

    notifyOrderStatusChange(orderId, nextStatus);
    res.json({ success: true });
  } catch (err) {
    if (err instanceof RaceLostError) {
      return res.status(409).json({ error: "This order's status has changed since you loaded this page. Please refresh and try again." });
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { currentPaymentStatus, nextPaymentStatus } = req.body;
    const adminId = req.user?.id || 'admin';

    if (!VALID_PAYMENT_STATUSES.includes(nextPaymentStatus) || !VALID_PAYMENT_STATUSES.includes(currentPaymentStatus)) {
      return res.status(400).json({ error: "Invalid payment status." });
    }

    const order = await db.order.findUnique({ where: { id: orderId }, select: { paymentStatus: true } });
    if (!order) {
      return res.status(404).json({ error: "This order no longer exists." });
    }

    const allowed = ALLOWED_PAYMENT_TRANSITIONS[order.paymentStatus] ?? [];
    if (!allowed.includes(nextPaymentStatus)) {
      return res.status(400).json({
        error: `Payment status can't be moved to the new status.`,
      });
    }

    await db.$transaction(async (tx) => {
      const result = await tx.order.updateMany({
        where: { id: orderId, paymentStatus: order.paymentStatus },
        data: { paymentStatus: nextPaymentStatus },
      });
      if (result.count === 0) {
        throw new RaceLostError();
      }
      await logActivity(tx, {
        adminId,
        action: "STATUS_CHANGE",
        entityType: "ORDER",
        entityId: orderId,
        description: `Changed payment status from ${order.paymentStatus} to ${nextPaymentStatus}`,
        metadata: { field: "paymentStatus", from: order.paymentStatus, to: nextPaymentStatus },
      });
    });

    res.json({ success: true });
  } catch (err) {
    if (err instanceof RaceLostError) {
      return res.status(409).json({ error: "This order's payment status has changed since you loaded this page. Please refresh and try again." });
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.confirmEasypaisaPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const adminId = req.user?.id || 'admin';

    const order = await db.order.findUnique({
      where: { id: orderId },
      select: { paymentMethod: true, paymentStatus: true, transactionId: true },
    });
    if (!order) {
      return res.status(404).json({ error: "This order no longer exists." });
    }
    if (order.paymentMethod !== "EASYPAISA") {
      return res.status(400).json({ error: "This order does not use Easypaisa payment." });
    }
    if (!order.transactionId) {
      return res.status(400).json({ error: "This order has no transaction ID to verify yet." });
    }
    if (order.paymentStatus === "PAID") {
      return res.status(400).json({ error: "Payment has already been confirmed." });
    }

    await db.$transaction(async (tx) => {
      const result = await tx.order.updateMany({
        where: {
          id: orderId,
          paymentMethod: "EASYPAISA",
          paymentStatus: { not: "PAID" },
          transactionId: { not: null },
        },
        data: { paymentStatus: "PAID", paidAt: new Date() },
      });
      if (result.count === 0) {
        throw new RaceLostError();
      }
      await logActivity(tx, {
        adminId,
        action: "STATUS_CHANGE",
        entityType: "ORDER",
        entityId: orderId,
        description: `Confirmed Easypaisa payment for order ${orderId}`,
        metadata: { field: "paymentStatus", from: order.paymentStatus, to: "PAID", transactionId: order.transactionId },
      });
    });

    notifyPaymentConfirmation(orderId);
    res.json({ success: true });
  } catch (err) {
    if (err instanceof RaceLostError) {
      return res.status(409).json({ error: "This order's payment status has changed since you loaded this page. Please refresh and try again." });
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.refundOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const adminId = req.user?.id || 'admin';

    if (!reason || reason.trim().length < 3 || reason.length > 500) {
      return res.status(400).json({ error: "Please enter a valid refund reason." });
    }
    const refundReason = reason.trim();

    const order = await db.order.findUnique({ where: { id: orderId }, select: { paymentStatus: true } });
    if (!order) {
      return res.status(404).json({ error: "This order no longer exists." });
    }
    if (order.paymentStatus === "REFUNDED") {
      return res.status(400).json({ error: "Payment has already been refunded." });
    }
    if (order.paymentStatus !== "PAID") {
      return res.status(400).json({ error: "Only a PAID order can be refunded." });
    }

    await db.$transaction(async (tx) => {
      const result = await tx.order.updateMany({
        where: { id: orderId, paymentStatus: "PAID" },
        data: { paymentStatus: "REFUNDED", refundReason, refundedAt: new Date() },
      });
      if (result.count === 0) {
        throw new RaceLostError();
      }
      await logActivity(tx, {
        adminId,
        action: "STATUS_CHANGE",
        entityType: "ORDER",
        entityId: orderId,
        description: `Refunded payment for order ${orderId}`,
        metadata: { field: "paymentStatus", from: "PAID", to: "REFUNDED", reason: refundReason },
      });
    });

    notifyRefund(orderId);
    res.json({ success: true });
  } catch (err) {
    if (err instanceof RaceLostError) {
      return res.status(409).json({ error: "This order's payment status has changed since you loaded this page. Please refresh and try again." });
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

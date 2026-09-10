const prisma = require('../config/db');

exports.cancelOrder = async (req, res) => {
  const userId = req.user.id;
  const { orderId } = req.body;

  try {
    const existing = await prisma.order.findFirst({
      where: { id: orderId, userId },
      select: { status: true },
    });
    if (!existing) {
      return res.status(404).json({ error: "This order could not be found." });
    }
    if (existing.status !== "PENDING") {
      return res.status(400).json({ error: "This order can no longer be cancelled." });
    }

    const result = await prisma.order.updateMany({
      where: { id: orderId, userId, status: "PENDING" },
      data: { status: "CANCELLED" },
    });

    if (result.count === 0) {
      return res.status(400).json({ error: "This order can no longer be cancelled." });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Unable to cancel this order. Please try again." });
  }
};

exports.submitPaymentTransactionId = async (req, res) => {
  const userId = req.user.id;
  const { orderId, transactionId } = req.body;

  try {
    const existing = await prisma.order.findFirst({
      where: { id: orderId, userId },
      select: { paymentMethod: true, paymentStatus: true },
    });
    if (!existing) {
      return res.status(404).json({ error: "Order not found." });
    }
    if (existing.paymentMethod !== "EASYPAISA") {
      return res.status(400).json({ error: "This order does not use Easypaisa payment." });
    }
    if (existing.paymentStatus === "PAID") {
      return res.status(400).json({ error: "Payment has already been confirmed." });
    }

    const result = await prisma.order.updateMany({
      where: { id: orderId, userId, paymentMethod: "EASYPAISA", paymentStatus: { not: "PAID" } },
      data: { transactionId },
    });

    if (result.count === 0) {
      return res.status(400).json({ error: "Payment has already been confirmed." });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Unable to submit transaction ID. Please try again." });
  }
};

exports.submitReturnRequest = async (req, res) => {
  const userId = req.user.id;
  const { orderId, reason } = req.body;
  const RETURN_WINDOW_DAYS = 7;

  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      select: { status: true, deliveredAt: true },
    });
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }
    if (order.status !== "DELIVERED" || !order.deliveredAt) {
      return res.status(400).json({ error: "This order is not eligible for a return." });
    }
    const windowEnd = new Date(order.deliveredAt.getTime() + RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    if (new Date() > windowEnd) {
      return res.status(400).json({ error: "This order is no longer eligible for a return — the 7-day window has passed." });
    }

    await prisma.$transaction(async (tx) => {
      const activeExisting = await tx.returnRequest.findFirst({
        where: { orderId, status: { in: ["PENDING", "APPROVED"] } },
        select: { id: true },
      });
      if (activeExisting) {
        throw new Error("Duplicate");
      }
      await tx.returnRequest.create({ data: { orderId, userId, reason } });
    });

    res.json({ success: true });
  } catch (error) {
    if (error.message === "Duplicate") {
      return res.status(400).json({ error: "You already have an active return request for this order." });
    }
    res.status(500).json({ error: "Unable to submit your request. Please try again." });
  }
};

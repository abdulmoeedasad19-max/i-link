const db = require('../config/db');
const { quotationStatusLabel } = require('../utils/quotation-status'); // Adjust imports
const { ALLOWED_QUOTATION_TRANSITIONS } = require('../utils/admin/quotation-transitions');
const { logActivity } = require('../utils/admin/activity-log');

const VALID_STATUSES = ["PENDING", "REVIEWED", "RESPONDED", "CLOSED"];

class RaceLostError extends Error {}

exports.updateQuotationStatus = async (req, res) => {
  try {
    const { quotationId } = req.params;
    const { currentStatus, nextStatus } = req.body;
    const adminId = req.user?.id || 'admin';

    if (!VALID_STATUSES.includes(nextStatus) || !VALID_STATUSES.includes(currentStatus)) {
      return res.status(400).json({ error: "Invalid quotation status." });
    }

    const quotation = await db.quotation.findUnique({ where: { id: quotationId }, select: { status: true } });
    if (!quotation) {
      return res.status(404).json({ error: "This quotation no longer exists." });
    }

    const allowed = ALLOWED_QUOTATION_TRANSITIONS[quotation.status] ?? [];
    if (!allowed.includes(nextStatus)) {
      return res.status(400).json({
        error: `This quotation can't be moved to the new status.`,
      });
    }

    await db.$transaction(async (tx) => {
      const result = await tx.quotation.updateMany({
        where: { id: quotationId, status: quotation.status },
        data: { status: nextStatus },
      });
      if (result.count === 0) {
        throw new RaceLostError();
      }
      await logActivity(tx, {
        adminId,
        action: "STATUS_CHANGE",
        entityType: "QUOTATION",
        entityId: quotationId,
        description: `Changed quotation status from ${quotation.status} to ${nextStatus}`,
        metadata: { from: quotation.status, to: nextStatus },
      });
    });

    res.json({ success: true });
  } catch (err) {
    if (err instanceof RaceLostError) {
      return res.status(409).json({ error: "This quotation's status has changed since you loaded this page. Please refresh and try again." });
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

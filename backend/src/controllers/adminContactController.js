const db = require('../config/db');

const VALID_STATUSES = ["NEW", "READ", "RESOLVED"];
const ALLOWED_CONTACT_MESSAGE_TRANSITIONS = {
  NEW: ["READ", "RESOLVED"],
  READ: ["RESOLVED"],
  RESOLVED: []
};

exports.updateContactMessageStatus = async (req, res) => {
  const { contactMessageId, currentStatus, nextStatus } = req.body;
  const adminId = req.user?.id || 'admin';

  if (!VALID_STATUSES.includes(nextStatus) || !VALID_STATUSES.includes(currentStatus)) {
    return res.status(400).json({ error: "Invalid status." });
  }

  const contactMessage = await db.contactMessage.findUnique({
    where: { id: contactMessageId },
    select: { status: true },
  });
  if (!contactMessage) {
    return res.status(404).json({ error: "This message no longer exists." });
  }

  const allowed = ALLOWED_CONTACT_MESSAGE_TRANSITIONS[contactMessage.status] ?? [];
  if (!allowed.includes(nextStatus)) {
    return res.status(400).json({
      error: `This message can't be moved to that status.`,
    });
  }

  try {
    await db.$transaction(async (tx) => {
      const result = await tx.contactMessage.updateMany({
        where: { id: contactMessageId, status: contactMessage.status },
        data: { status: nextStatus },
      });
      if (result.count === 0) {
        throw new Error('RaceLostError');
      }
      await tx.activityLog.create({
        data: {
          adminId,
          action: "UPDATE",
          entityType: "CONTACT_MESSAGE",
          entityId: contactMessageId,
          description: "Updated contact message status",
          metadata: { changedFields: ["status"] },
        }
      });
    });
    return res.json({ success: true });
  } catch (err) {
    if (err.message === 'RaceLostError') {
      return res.status(409).json({ error: "This message's status has changed since you loaded this page. Please refresh and try again." });
    }
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

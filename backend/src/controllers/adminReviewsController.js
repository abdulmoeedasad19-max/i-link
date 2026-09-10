const db = require("../config/db");

const VALID_STATUSES = ["PENDING", "APPROVED", "REJECTED"];

// Basic mocks for imported constants/functions
const reviewStatusLabel = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected"
};

const ALLOWED_REVIEW_TRANSITIONS = {
  PENDING: ["APPROVED", "REJECTED"],
  APPROVED: ["REJECTED"],
  REJECTED: ["APPROVED"]
};

class RaceLostError extends Error {}

exports.updateReviewStatus = async (req, res) => {
  try {
    const { reviewId, currentReviewStatus, nextReviewStatus } = req.body;
    
    // In Express, req.user is typically populated by auth middleware
    const adminId = req.user ? req.user.id : "admin";

    if (!VALID_STATUSES.includes(nextReviewStatus) || !VALID_STATUSES.includes(currentReviewStatus)) {
      return res.status(400).json({ error: "Invalid review status." });
    }

    const review = await db.review.findUnique({ 
      where: { id: reviewId }, 
      select: { status: true } 
    });

    if (!review) {
      return res.status(404).json({ error: "This review no longer exists." });
    }

    const allowed = ALLOWED_REVIEW_TRANSITIONS[review.status] ?? [];
    if (!allowed.includes(nextReviewStatus)) {
      return res.status(400).json({
        error: `This review can't be moved from ${reviewStatusLabel[review.status]} to ${reviewStatusLabel[nextReviewStatus]}.`,
      });
    }

    try {
      await db.$transaction(async (tx) => {
        const result = await tx.review.updateMany({
          where: { id: reviewId, status: review.status },
          data: { status: nextReviewStatus },
        });

        if (result.count === 0) {
          throw new RaceLostError();
        }
        
        let description = `Changed review status from ${reviewStatusLabel[review.status]} to ${reviewStatusLabel[nextReviewStatus]}`;
        if (nextReviewStatus === "APPROVED") description = "Approved product review";
        if (nextReviewStatus === "REJECTED") description = "Rejected product review";

        // Inline logActivity equivalent
        await tx.activityLog.create({
          data: {
            adminId,
            action: "STATUS_CHANGE",
            entityType: "REVIEW",
            entityId: reviewId,
            description,
            metadata: { from: review.status, to: nextReviewStatus },
          }
        });
      });
    } catch (err) {
      if (err instanceof RaceLostError) {
        return res.status(409).json({ 
          error: "This review's status has changed since you loaded this page. Please refresh and try again." 
        });
      }
      throw err;
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("[admin/reviews] updateReviewStatus failed:", err);
    return res.status(500).json({ error: "Unable to update review status." });
  }
};

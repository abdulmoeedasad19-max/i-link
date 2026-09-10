const { z } = require("zod");
const db = require("../config/db");

const VALID_STATUSES = ["PENDING", "APPROVED", "REJECTED"];

// Basic mocks for imported constants/functions
const returnStatusLabel = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected"
};

const ALLOWED_RETURN_TRANSITIONS = {
  PENDING: ["APPROVED", "REJECTED"],
  APPROVED: [],
  REJECTED: []
};

class RaceLostError extends Error {}

const rejectionReasonSchema = z.string().trim().max(500, "Rejection reason is too long.");

exports.updateReturnRequestStatus = async (req, res) => {
  try {
    const { returnRequestId, currentStatus, nextStatus, rejectionReason } = req.body;
    
    // In Express, req.user is typically populated by auth middleware
    const adminId = req.user ? req.user.id : "admin";

    if (!VALID_STATUSES.includes(nextStatus) || !VALID_STATUSES.includes(currentStatus)) {
      return res.status(400).json({ error: "Invalid return request status." });
    }

    let parsedRejectionReason = "";
    if (nextStatus === "REJECTED") {
      const parsed = rejectionReasonSchema.safeParse(rejectionReason ?? "");
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Please enter a valid rejection reason." });
      }
      parsedRejectionReason = parsed.data;
    }

    const returnRequest = await db.returnRequest.findUnique({
      where: { id: returnRequestId },
      select: { status: true },
    });
    
    if (!returnRequest) {
      return res.status(404).json({ error: "This return request no longer exists." });
    }

    const allowed = ALLOWED_RETURN_TRANSITIONS[returnRequest.status] ?? [];
    if (!allowed.includes(nextStatus)) {
      return res.status(400).json({
        error: `This return request can't be moved from ${returnStatusLabel[returnRequest.status]} to ${returnStatusLabel[nextStatus]}.`,
      });
    }

    try {
      await db.$transaction(async (tx) => {
        const result = await tx.returnRequest.updateMany({
          where: { id: returnRequestId, status: returnRequest.status },
          data: {
            status: nextStatus,
            rejectionReason: nextStatus === "REJECTED" ? parsedRejectionReason || null : null,
          },
        });
        
        if (result.count === 0) {
          throw new RaceLostError();
        }
        
        // Inline logActivity equivalent
        await tx.activityLog.create({
          data: {
            adminId,
            action: "STATUS_CHANGE",
            entityType: "RETURN_REQUEST",
            entityId: returnRequestId,
            description: nextStatus === "APPROVED" ? "Approved return request" : "Rejected return request",
            metadata: { from: returnRequest.status, to: nextStatus },
          }
        });
      });
    } catch (err) {
      if (err instanceof RaceLostError) {
        return res.status(409).json({
          error: "This return request's status has changed since you loaded this page. Please refresh and try again.",
        });
      }
      throw err;
    }

    // Omitted Next.js revalidatePath calls and email notifications to keep focus on DB/REST response
    // if (nextStatus === "APPROVED") notifyReturnApproved(returnRequestId);
    // else if (nextStatus === "REJECTED") notifyReturnRejected(returnRequestId);

    return res.json({ success: true });
  } catch (err) {
    console.error("[admin/returns] updateReturnRequestStatus failed:", err);
    return res.status(500).json({ error: "Unable to update this return request. Please try again." });
  }
};

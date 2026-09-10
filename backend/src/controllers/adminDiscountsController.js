const db = require('../config/db');

function normalizeCouponCode(code) {
  return code ? code.trim().toUpperCase() : "";
}

exports.createCoupon = async (req, res) => {
  const adminId = req.user?.id || 'admin';
  const data = req.body;
  const normalizedCode = normalizeCouponCode(data.code);

  if (!normalizedCode) {
    return res.status(400).json({ error: "Code is required." });
  }
  if (data.discountType === "PERCENTAGE" && data.discountValue > 100) {
    return res.status(400).json({ error: "A percentage discount cannot exceed 100." });
  }

  const existing = await db.coupon.findUnique({ where: { code: normalizedCode }, select: { id: true } });
  if (existing) {
    return res.status(400).json({ error: "A coupon with this code already exists." });
  }

  const toWriteData = {
    code: normalizedCode,
    discountType: data.discountType,
    discountValue: Number(data.discountValue).toFixed(2),
    minimumOrderAmount: data.minimumOrderAmount != null ? Number(data.minimumOrderAmount).toFixed(2) : null,
    maximumDiscountAmount: data.maximumDiscountAmount != null ? Number(data.maximumDiscountAmount).toFixed(2) : null,
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: data.endDate ? new Date(data.endDate) : null,
    usageLimit: data.usageLimit ? Number(data.usageLimit) : null,
    isActive: Boolean(data.isActive),
  };

  try {
    await db.$transaction(async (tx) => {
      const coupon = await tx.coupon.create({ data: toWriteData, select: { id: true } });
      await tx.activityLog.create({
        data: {
          adminId,
          action: "CREATE",
          entityType: "COUPON",
          entityId: coupon.id,
          description: `Created coupon ${toWriteData.code}`,
        }
      });
    });
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to save this coupon. Please try again." });
  }
};

exports.updateCoupon = async (req, res) => {
  const adminId = req.user?.id || 'admin';
  const id = req.body.id || req.params.id;
  const data = req.body;

  if (!id) {
    return res.status(400).json({ error: "Missing coupon id." });
  }

  const existing = await db.coupon.findUnique({
    where: { id },
  });
  if (!existing) {
    return res.status(404).json({ error: "This coupon no longer exists." });
  }

  const normalizedCode = normalizeCouponCode(data.code);
  if (normalizedCode !== existing.code) {
    const codeTaken = await db.coupon.findUnique({ where: { code: normalizedCode }, select: { id: true } });
    if (codeTaken) return res.status(400).json({ error: "A coupon with this code already exists." });
  }

  const toWriteData = {
    code: normalizedCode,
    discountType: data.discountType,
    discountValue: Number(data.discountValue).toFixed(2),
    minimumOrderAmount: data.minimumOrderAmount != null ? Number(data.minimumOrderAmount).toFixed(2) : null,
    maximumDiscountAmount: data.maximumDiscountAmount != null ? Number(data.maximumDiscountAmount).toFixed(2) : null,
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: data.endDate ? new Date(data.endDate) : null,
    usageLimit: data.usageLimit ? Number(data.usageLimit) : null,
    isActive: Boolean(data.isActive),
  };

  const changedFields = ["code", "discountType", "discountValue", "minimumOrderAmount", "maximumDiscountAmount", "startDate", "endDate", "usageLimit", "isActive"].filter(field => existing[field] !== toWriteData[field]);

  try {
    await db.$transaction(async (tx) => {
      await tx.coupon.update({ where: { id }, data: toWriteData });
      await tx.activityLog.create({
        data: {
          adminId,
          action: "UPDATE",
          entityType: "COUPON",
          entityId: id,
          description: `Updated coupon ${toWriteData.code}`,
          metadata: { changedFields },
        }
      });
    });
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to save this coupon. Please try again." });
  }
};

exports.toggleCouponActive = async (req, res) => {
  const adminId = req.user?.id || 'admin';
  const { id, expectedIsActive } = req.body;

  const coupon = await db.coupon.findUnique({ where: { id }, select: { isActive: true, code: true } });
  if (!coupon) {
    return res.status(404).json({ error: "This coupon no longer exists." });
  }

  try {
    await db.$transaction(async (tx) => {
      const result = await tx.coupon.updateMany({
        where: { id, isActive: expectedIsActive },
        data: { isActive: !expectedIsActive },
      });
      if (result.count === 0) {
        throw new Error('RaceLostError');
      }
      await tx.activityLog.create({
        data: {
          adminId,
          action: "STATUS_CHANGE",
          entityType: "COUPON",
          entityId: id,
          description: `${expectedIsActive ? "Deactivated" : "Activated"} coupon ${coupon.code}`,
          metadata: { field: "isActive", from: expectedIsActive, to: !expectedIsActive },
        }
      });
    });
    return res.json({ success: true });
  } catch (err) {
    if (err.message === 'RaceLostError') {
      return res.status(409).json({ error: "This coupon's status has changed since you loaded this page. Please refresh and try again." });
    }
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteCoupon = async (req, res) => {
  const adminId = req.user?.id || 'admin';
  const id = req.body.id || req.params.id;

  const coupon = await db.coupon.findUnique({ where: { id }, select: { usageCount: true, code: true } });
  if (!coupon) {
    return res.status(404).json({ error: "This coupon no longer exists." });
  }

  if (coupon.usageCount > 0) {
    return res.status(400).json({ error: "This coupon has recorded usage and can't be deleted. Deactivate it instead." });
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.coupon.delete({ where: { id } });
      await tx.activityLog.create({
        data: {
          adminId,
          action: "DELETE",
          entityType: "COUPON",
          entityId: id,
          description: `Deleted coupon ${coupon.code}`,
        }
      });
    });
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to delete this coupon. Please try again." });
  }
};

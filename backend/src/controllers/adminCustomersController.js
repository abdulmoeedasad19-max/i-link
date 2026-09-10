const db = require('../config/db');
const bcrypt = require('bcryptjs');

const VALID_ROLES = ["CUSTOMER", "ADMIN"];

exports.updateCustomerRole = async (req, res) => {
  const { userId, expectedCurrentRole, nextRole } = req.body;
  const adminId = req.user?.id || 'admin';

  if (!VALID_ROLES.includes(nextRole) || !VALID_ROLES.includes(expectedCurrentRole)) {
    return res.status(400).json({ error: "Invalid role." });
  }

  if (userId === adminId) {
    return res.status(400).json({ error: "You cannot change your own role. Ask another administrator to do this." });
  }

  const target = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!target) {
    return res.status(404).json({ error: "This customer no longer exists." });
  }

  if (target.role !== expectedCurrentRole) {
    return res.status(409).json({
      error: "This customer's role has changed since you loaded this page. Please refresh and try again.",
    });
  }

  if (expectedCurrentRole === nextRole) {
    return res.json({ success: true });
  }

  if (expectedCurrentRole === "ADMIN" && nextRole === "CUSTOMER") {
    const adminCount = await db.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return res.status(400).json({ error: "Cannot remove the last administrator account." });
    }
  }

  try {
    await db.$transaction(async (tx) => {
      const result = await tx.user.updateMany({
        where: { id: userId, role: expectedCurrentRole },
        data: { role: nextRole },
      });
      if (result.count === 0) {
        throw new Error('RaceLostError');
      }
      await tx.activityLog.create({
        data: {
          adminId,
          action: "ROLE_CHANGE",
          entityType: "USER",
          entityId: userId,
          description: `Changed customer role from ${expectedCurrentRole} to ${nextRole}`,
          metadata: { from: expectedCurrentRole, to: nextRole },
        }
      });
    });
    return res.json({ success: true });
  } catch (err) {
    if (err.message === 'RaceLostError') {
      return res.status(409).json({
        error: "This customer's role has changed since you loaded this page. Please refresh and try again.",
      });
    }
    console.error(err);
    return res.status(500).json({ error: "Unable to update this customer's role. Please try again." });
  }
};

exports.resetCustomerPassword = async (req, res) => {
  const { userId, newPassword, confirmPassword } = req.body;
  const adminId = req.user?.id || 'admin';

  if (userId === adminId) {
    return res.status(400).json({ error: "You cannot reset your own password using this action." });
  }

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters." });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }

  const target = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!target) {
    return res.status(404).json({ error: "This customer no longer exists." });
  }
  if (target.role !== "CUSTOMER") {
    return res.status(400).json({ error: "Only customer accounts can be reset using this action." });
  }

  let newPasswordHash;
  try {
    newPasswordHash = await bcrypt.hash(newPassword, 10);
  } catch {
    return res.status(500).json({ error: "Unable to reset the customer's password. Please try again." });
  }

  try {
    await db.$transaction(async (tx) => {
      const result = await tx.user.updateMany({
        where: { id: userId, role: "CUSTOMER" },
        data: { passwordHash: newPasswordHash },
      });
      if (result.count === 0) {
        throw new Error('RaceLostError');
      }
      await tx.activityLog.create({
        data: {
          adminId,
          action: "UPDATE",
          entityType: "USER",
          entityId: userId,
          description: "Reset password for customer",
        }
      });
    });
    return res.json({ success: true });
  } catch (err) {
    if (err.message === 'RaceLostError') {
      return res.status(409).json({ error: "Only customer accounts can be reset using this action." });
    }
    console.error(err);
    return res.status(500).json({ error: "Unable to reset the customer's password. Please try again." });
  }
};

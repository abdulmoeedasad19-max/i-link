const prisma = require('../config/db');
const bcrypt = require('bcryptjs');

exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, phone } = req.body;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { name, phone },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Unable to update your profile. Please try again." });
  }
};

exports.changePassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });
    if (!user || !user.passwordHash) {
      return res.status(400).json({ error: "Unable to change your password. Please try again." });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: "Current password is incorrect." });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Unable to change your password. Please try again." });
  }
};

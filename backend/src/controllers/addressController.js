const prisma = require('../config/db');

exports.createAddress = async (req, res) => {
  const userId = req.user.id;
  const { label, line1, line2, city, province, postalCode, phone, isDefault } = req.body;
  const requestedDefault = isDefault === true;

  try {
    const existingCount = await prisma.address.count({ where: { userId } });
    const makeDefault = requestedDefault || existingCount === 0;

    if (makeDefault && existingCount > 0) {
      await prisma.$transaction([
        prisma.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        }),
        prisma.address.create({
          data: { label, line1, line2, city, province, postalCode, phone, userId, isDefault: true },
        }),
      ]);
    } else {
      await prisma.address.create({
        data: { label, line1, line2, city, province, postalCode, phone, userId, isDefault: makeDefault },
      });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Unable to add this address. Please try again." });
  }
};

exports.updateAddress = async (req, res) => {
  const userId = req.user.id;
  const { addressId, label, line1, line2, city, province, postalCode, phone, isDefault } = req.body;
  const requestedDefault = isDefault === true;

  try {
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId },
      select: { id: true },
    });
    if (!existing) {
      return res.status(404).json({ error: "Address not found." });
    }

    if (requestedDefault) {
      await prisma.$transaction([
        prisma.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        }),
        prisma.address.update({
          where: { id: addressId },
          data: { label, line1, line2, city, province, postalCode, phone, isDefault: true },
        }),
      ]);
    } else {
      await prisma.address.update({
        where: { id: addressId },
        data: { label, line1, line2, city, province, postalCode, phone },
      });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Unable to update this address. Please try again." });
  }
};

exports.deleteAddress = async (req, res) => {
  const userId = req.user.id;
  const { addressId } = req.body;

  try {
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId },
      select: { id: true, isDefault: true },
    });
    if (!existing) {
      return res.status(404).json({ error: "Address not found." });
    }

    await prisma.address.delete({ where: { id: addressId } });

    if (existing.isDefault) {
      const next = await prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });
      if (next) {
        await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
      }
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Unable to delete this address. Please try again." });
  }
};

exports.setDefaultAddress = async (req, res) => {
  const userId = req.user.id;
  const { addressId } = req.body;

  try {
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId },
      select: { id: true },
    });
    if (!existing) {
      return res.status(404).json({ error: "Address not found." });
    }

    await prisma.$transaction([
      prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      }),
      prisma.address.update({ where: { id: addressId }, data: { isDefault: true } }),
    ]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Unable to update your default address. Please try again." });
  }
};

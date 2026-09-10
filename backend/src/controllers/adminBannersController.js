const db = require('../config/db');

exports.createBanner = async (req, res) => {
  try {
    const data = req.body;
    const banner = await db.banner.create({ data });
    res.json(banner);
  } catch (err) {
    res.status(400).json({ error: "Unable to save this banner. Please try again." });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existing = await db.banner.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "This banner no longer exists." });
    }

    const banner = await db.banner.update({ where: { id }, data });
    res.json(banner);
  } catch (err) {
    res.status(400).json({ error: "Unable to save this banner. Please try again." });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await db.banner.findUnique({ where: { id } });
    if (!banner) {
      return res.status(404).json({ error: "This banner no longer exists." });
    }

    await db.banner.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Unable to delete this banner." });
  }
};

exports.toggleBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { expectedIsActive } = req.body;

    const banner = await db.banner.findUnique({ where: { id } });
    if (!banner) {
      return res.status(404).json({ error: "This banner no longer exists." });
    }

    const result = await db.banner.updateMany({
      where: { id, isActive: expectedIsActive },
      data: { isActive: !expectedIsActive },
    });

    if (result.count === 0) {
      return res.status(409).json({ error: "Race lost. This banner's status has changed since you loaded this page." });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.moveBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { direction } = req.body; // "up" or "down"

    const banners = await db.banner.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, sortOrder: true },
    });

    const index = banners.findIndex((b) => b.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "This banner no longer exists." });
    }

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= banners.length) {
      return res.json({ success: true }); // already at edge
    }

    const current = banners[index];
    const swapWith = banners[swapIndex];

    await db.$transaction(async (tx) => {
      await tx.banner.update({ where: { id: current.id }, data: { sortOrder: swapWith.sortOrder } });
      await tx.banner.update({ where: { id: swapWith.id }, data: { sortOrder: current.sortOrder } });
    });

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

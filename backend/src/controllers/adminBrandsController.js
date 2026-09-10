const db = require('../config/db');

exports.createBrand = async (req, res) => {
  try {
    const data = req.body;

    const slugTaken = await db.brand.findUnique({ where: { slug: data.slug }, select: { id: true } });
    if (slugTaken) {
      return res.status(400).json({ error: "A brand with this slug already exists." });
    }

    const brand = await db.brand.create({
      data: {
        name: data.name,
        slug: data.slug,
        logoUrl: data.logoUrl || null,
        description: data.description || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
      },
    });

    res.json(brand);
  } catch (err) {
    res.status(400).json({ error: "Unable to save this brand. Please try again." });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existing = await db.brand.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "This brand no longer exists." });
    }

    if (data.slug !== existing.slug) {
      const slugTaken = await db.brand.findUnique({ where: { slug: data.slug }, select: { id: true } });
      if (slugTaken) {
        return res.status(400).json({ error: "A brand with this slug already exists." });
      }
    }

    const brand = await db.brand.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        logoUrl: data.logoUrl || null,
        description: data.description || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
      },
    });

    res.json(brand);
  } catch (err) {
    res.status(400).json({ error: "Unable to update this brand. Please try again." });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await db.brand.findUnique({
      where: { id },
      select: { name: true, _count: { select: { products: true } } },
    });

    if (!brand) {
      return res.status(404).json({ error: "This brand no longer exists." });
    }

    if (brand._count.products > 0) {
      return res.status(400).json({
        error: `This brand is currently used by ${brand._count.products} product(s). Reassign those products before deleting the brand.`,
      });
    }

    await db.brand.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Unable to delete this brand." });
  }
};

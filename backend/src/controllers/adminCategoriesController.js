const db = require('../config/db');

exports.createCategory = async (req, res) => {
  try {
    const data = req.body;

    const slugTaken = await db.category.findUnique({ where: { slug: data.slug }, select: { id: true } });
    if (slugTaken) {
      return res.status(400).json({ error: "A category with this slug already exists." });
    }

    const maxSort = await db.category.aggregate({ _max: { sortOrder: true } });
    const nextSortOrder = (maxSort._max.sortOrder ?? -1) + 1;

    const category = await db.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        image: data.image || null,
        icon: data.icon || null,
        tier: data.tier,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        sortOrder: nextSortOrder,
      },
    });

    res.json(category);
  } catch (err) {
    res.status(400).json({ error: "Unable to save this category. Please try again." });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existing = await db.category.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "This category no longer exists." });
    }

    if (data.slug !== existing.slug) {
      const slugTaken = await db.category.findUnique({ where: { slug: data.slug }, select: { id: true } });
      if (slugTaken) {
        return res.status(400).json({ error: "A category with this slug already exists." });
      }
    }

    const category = await db.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        image: data.image || null,
        icon: data.icon || null,
        tier: data.tier,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
      },
    });

    res.json(category);
  } catch (err) {
    res.status(400).json({ error: "Unable to update this category. Please try again." });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await db.category.findUnique({
      where: { id },
      select: { name: true, _count: { select: { products: true } } },
    });

    if (!category) {
      return res.status(404).json({ error: "This category no longer exists." });
    }

    if (category._count.products > 0) {
      return res.status(400).json({
        error: `This category is currently used by ${category._count.products} product(s). Reassign those products to another category before deleting it.`,
      });
    }

    await db.category.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Unable to delete this category." });
  }
};

const prisma = require('../config/db');

exports.addWishlistItem = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: "Product not found" });

    await prisma.wishlistItem.upsert({
      where: { userId_productId: { userId, productId } },
      update: {},
      create: { userId, productId },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Unable to add wishlist item" });
  }
};

exports.removeWishlistItem = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body; // or req.params

  try {
    await prisma.wishlistItem.deleteMany({ where: { userId, productId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Unable to remove wishlist item" });
  }
};

exports.clearWishlistItems = async (req, res) => {
  const userId = req.user.id;

  try {
    await prisma.wishlistItem.deleteMany({ where: { userId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Unable to clear wishlist items" });
  }
};

exports.syncWishlistOnLogin = async (req, res) => {
  const userId = req.user.id;
  const { guestProductIds } = req.body;

  try {
    const products = await prisma.product.findMany({
      where: { id: { in: guestProductIds } },
      select: { id: true },
    });
    const validIds = products.map((p) => p.id);

    const existing = await prisma.wishlistItem.findMany({
      where: { userId },
      select: { productId: true },
    });
    const existingIds = new Set(existing.map((item) => item.productId));
    const toCreate = validIds.filter((id) => !existingIds.has(id));

    if (toCreate.length > 0) {
      await prisma.wishlistItem.createMany({
        data: toCreate.map((productId) => ({ userId, productId })),
        skipDuplicates: true,
      });
    }

    const mergedIds = Array.from(new Set([...existingIds, ...validIds]));
    res.json({ success: true, wishlist: mergedIds });
  } catch (error) {
    res.status(500).json({ error: "Unable to synchronize wishlist." });
  }
};

exports.getWishlistDisplayProducts = async (req, res) => {
  const { productIds } = req.body;
  if (!productIds || productIds.length === 0) return res.json({ products: [] });

  try {
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    
    // Map to match frontend structure if needed
    const displayProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category, // assuming these fields match
      categorySlug: p.categorySlug,
      brand: p.brand,
      price: p.price,
      image: p.image,
      description: p.description,
      stock: p.stock,
      featured: p.featured,
    }));
    
    res.json({ products: displayProducts });
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch display products" });
  }
};

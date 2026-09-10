const db = require('../config/db');

exports.updateProductStock = async (req, res) => {
  const adminId = req.user?.id || 'admin';
  const { productId, expectedStock, stock } = req.body;

  if (!productId || !Number.isInteger(Number(expectedStock)) || Number(expectedStock) < 0) {
    return res.status(400).json({ error: "Invalid request." });
  }
  
  if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
    return res.status(400).json({ error: "Stock must be a non-negative whole number." });
  }

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { name: true },
  });
  if (!product) {
    return res.status(404).json({ error: "Product not found." });
  }

  try {
    await db.$transaction(async (tx) => {
      const result = await tx.product.updateMany({
        where: { id: productId, stock: Number(expectedStock) },
        data: { stock: Number(stock) },
      });
      if (result.count === 0) {
        throw new Error('RaceLostError');
      }
      await tx.activityLog.create({
        data: {
          adminId,
          action: "UPDATE",
          entityType: "PRODUCT",
          entityId: productId,
          description: `Adjusted inventory for ${product.name}`,
          metadata: { previousStock: Number(expectedStock), newStock: Number(stock) },
        }
      });
    });
    return res.json({ success: true });
  } catch (err) {
    if (err.message === 'RaceLostError') {
      return res.status(409).json({
        error: "This product's stock has changed since you loaded this page. Please refresh and try again.",
      });
    }
    console.error(err);
    return res.status(500).json({ error: "Unable to update stock. Please try again." });
  }
};

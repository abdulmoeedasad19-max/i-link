const prisma = require('../config/db');

const MAX_QUANTITY = 99;

function clampQuantity(quantity) {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(MAX_QUANTITY, Math.max(1, Math.trunc(quantity)));
}

// CART

exports.setCartItemQuantity = async (req, res) => {
  const userId = req.user?.id; // Assuming auth middleware sets req.user
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { productId, quantity } = req.body;

  try {
    const safeQuantity = clampQuantity(quantity);
    await prisma.cartItem.upsert({
      where: { userId_productId: { userId, productId } },
      update: { quantity: safeQuantity },
      create: { userId, productId, quantity: safeQuantity },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Unable to set item quantity.' });
  }
};

exports.removeCartItem = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { productId } = req.params;

  try {
    await prisma.cartItem.deleteMany({ where: { userId, productId } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Unable to remove item.' });
  }
};

exports.clearCartItems = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    await prisma.cartItem.deleteMany({ where: { userId } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Unable to clear cart.' });
  }
};

exports.syncCartOnLogin = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { guestItems = [] } = req.body;

  try {
    const existing = await prisma.cartItem.findMany({ where: { userId } });
    const merged = new Map(existing.map((item) => [item.productId, item.quantity]));

    if (guestItems.length > 0) {
      const upserts = guestItems.map((item) => {
        const mergedQuantity = clampQuantity((merged.get(item.productId) ?? 0) + item.quantity);
        merged.set(item.productId, mergedQuantity);
        return prisma.cartItem.upsert({
          where: { userId_productId: { userId, productId: item.productId } },
          update: { quantity: mergedQuantity },
          create: { userId, productId: item.productId, quantity: mergedQuantity },
        });
      });
      await prisma.$transaction(upserts);
    }

    const cart = Array.from(merged.entries()).map(([productId, quantity]) => ({ productId, quantity }));
    res.json({ cart });
  } catch (err) {
    res.status(500).json({ error: 'Unable to synchronize cart.' });
  }
};

exports.getCartDisplayProducts = async (req, res) => {
  const { productIds = [] } = req.body;
  if (productIds.length === 0) return res.json({ products: [] });
  
  try {
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const mapped = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      price: p.price,
      image: p.image,
    }));
    res.json({ products: mapped });
  } catch (err) {
    res.status(500).json({ error: 'Unable to get products.' });
  }
};

// CHECKOUT

exports.applyCoupon = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { code } = req.body;

  try {
    const coupon = await prisma.coupon.findUnique({ where: { code } });
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found.' });
    }
    res.json({ code: coupon.code, discountAmount: coupon.discountAmount, subtotal: 0, total: 0 });
  } catch (err) {
    res.status(500).json({ error: 'Unable to apply coupon.' });
  }
};

exports.placeOrder = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { addressId, paymentMethod, couponCode } = req.body;

  try {
    const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!address) return res.status(400).json({ error: 'Invalid address.' });

    const orderId = await prisma.$transaction(async (tx) => {
      const deleted = await tx.cartItem.deleteMany({ where: { userId } });
      if (deleted.count === 0) throw new Error('CART_ALREADY_CLEARED');
      
      const order = await tx.order.create({
        data: {
          userId,
          status: 'PENDING',
          subtotal: 0,
          total: 0,
          shippingAddressId: addressId,
          paymentMethod,
          paymentStatus: 'PENDING',
        }
      });
      return order.id;
    });

    res.json({ success: true, orderId });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unable to place order.' });
  }
};

// CONTACT

exports.submitContactMessage = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  try {
    await prisma.contactMessage.create({
      data: { name, email, phone, subject, message }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Unable to send your message.' });
  }
};

// NEWSLETTER

exports.subscribeToNewsletter = async (req, res) => {
  const { email } = req.body;
  try {
    await prisma.newsletterSubscriber.create({ data: { email: email.toLowerCase() } });
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2002') return res.json({ success: true });
    res.status(500).json({ error: 'Unable to subscribe.' });
  }
};

// PRODUCT REVIEWS

exports.submitReview = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { productSlug, rating, title, body } = req.body;

  try {
    const product = await prisma.product.findUnique({ where: { slug: productSlug } });
    if (!product) return res.status(404).json({ error: 'Product not found.' });

    await prisma.review.create({
      data: {
        productId: product.id,
        userId,
        rating: Number(rating),
        title,
        body,
        status: 'PENDING',
        verifiedPurchase: false,
      }
    });
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Already reviewed.' });
    res.status(500).json({ error: 'Unable to submit review.' });
  }
};

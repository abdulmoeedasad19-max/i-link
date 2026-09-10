const express = require('express');
const router = express.Router();
const storefrontController = require('../controllers/storefrontController');

// Helper mock auth middleware for endpoints that require user session
// Assuming a real auth middleware would go here
const mockAuth = (req, res, next) => {
  // Try to parse out auth if present, otherwise just continue.
  // The controllers handle unauthorized access checks
  next();
};

// Cart
router.post('/cart/item', mockAuth, storefrontController.setCartItemQuantity);
router.delete('/cart/item/:productId', mockAuth, storefrontController.removeCartItem);
router.delete('/cart', mockAuth, storefrontController.clearCartItems);
router.post('/cart/sync', mockAuth, storefrontController.syncCartOnLogin);
router.post('/cart/display', storefrontController.getCartDisplayProducts);

// Checkout
router.post('/checkout/coupon', mockAuth, storefrontController.applyCoupon);
router.post('/checkout/order', mockAuth, storefrontController.placeOrder);

// Contact
router.post('/contact', storefrontController.submitContactMessage);

// Newsletter
router.post('/newsletter', storefrontController.subscribeToNewsletter);

// Products
router.post('/product/review', mockAuth, storefrontController.submitReview);

module.exports = router;

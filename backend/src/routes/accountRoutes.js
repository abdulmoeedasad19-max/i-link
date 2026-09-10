const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../middlewares/auth');

const addressController = require('../controllers/addressController');
const profileController = require('../controllers/profileController');
const accountOrderController = require('../controllers/accountOrderController');
const wishlistController = require('../controllers/wishlistController');

// Profile Routes
router.put('/profile', authMiddleware, profileController.updateProfile);
router.put('/profile/password', authMiddleware, profileController.changePassword);

// Address Routes
router.post('/addresses', authMiddleware, addressController.createAddress);
router.put('/addresses', authMiddleware, addressController.updateAddress);
router.delete('/addresses', authMiddleware, addressController.deleteAddress);
router.put('/addresses/default', authMiddleware, addressController.setDefaultAddress);

// Order Routes
router.post('/orders/cancel', authMiddleware, accountOrderController.cancelOrder);
router.post('/orders/transaction', authMiddleware, accountOrderController.submitPaymentTransactionId);
router.post('/orders/return', authMiddleware, accountOrderController.submitReturnRequest);

// Wishlist Routes
// Note: getWishlistDisplayProducts does not strictly need auth, but it's an account-related function 
// if it's used by guest users, we can remove authMiddleware. Based on the frontend `actions.ts`, 
// `getWishlistDisplayProducts` has no auth() gate.
router.post('/wishlist/add', authMiddleware, wishlistController.addWishlistItem);
router.delete('/wishlist/remove', authMiddleware, wishlistController.removeWishlistItem); // usually use /wishlist/:id, but body is fine based on our controller
router.delete('/wishlist/clear', authMiddleware, wishlistController.clearWishlistItems);
router.post('/wishlist/sync', authMiddleware, wishlistController.syncWishlistOnLogin);
router.post('/wishlist/display', wishlistController.getWishlistDisplayProducts);

module.exports = router;

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

// Apply admin auth middlewares to all admin routes
router.use(authMiddleware, adminMiddleware);

const controllersDir = path.join(__dirname, '../controllers');

// Dynamically load all controllers that start with "admin"
fs.readdirSync(controllersDir).forEach((file) => {
  if (file.startsWith('admin') && file.endsWith('.js')) {
    const controller = require(path.join(controllersDir, file));
    const domain = file.replace('admin', '').replace('Controller.js', '').toLowerCase();
    
    // Automatically map controller exports to POST endpoints
    // For a real REST API we might map create->POST, get->GET, update->PUT, delete->DELETE,
    // but Next.js Server Actions are essentially RPCs mapped well to POST requests.
    for (const actionName in controller) {
      if (typeof controller[actionName] === 'function') {
        // e.g. /api/admin/products/createProduct
        router.post(`/${domain}/${actionName}`, controller[actionName]);
      }
    }
  }
});

module.exports = router;


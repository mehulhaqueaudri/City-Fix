const express = require('express');
const router = express.Router();
const { getInventory, addMaterial, updateStock, updateThreshold, checkoutMaterial, getCheckoutHistory } = require('../controllers/inventoryController');

router.get('/', getInventory);
router.post('/', addMaterial);
router.put('/:id', updateStock);

// 🌟 FEATURE: Standalone checkout routes
router.post('/checkout', checkoutMaterial);
router.get('/checkouts', getCheckoutHistory);

// 🌟 FEATURE 14: Add the route so the frontend can hit the controller
router.put('/:id/threshold', updateThreshold);

module.exports = router;
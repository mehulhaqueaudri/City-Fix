const express = require('express');
const router = express.Router();
const { getDashboardStats, getAvgResolutionTime, getOpenIssuesPerWard, getWorkerPerformance, getMonthlyExpenses } = require('../controllers/adminController');

// GET /api/admin/stats
router.get('/stats', getDashboardStats);

// GET /api/admin/avg-resolution-time
router.get('/avg-resolution-time', getAvgResolutionTime);

// GET /api/admin/open-issues-per-ward
router.get('/open-issues-per-ward', getOpenIssuesPerWard);

// GET /api/admin/worker-performance
router.get('/worker-performance', getWorkerPerformance);

// GET /api/admin/monthly-expenses
router.get('/monthly-expenses', getMonthlyExpenses);

module.exports = router;
const express = require('express');
const router = express.Router();
const { getAuditLogs, getNotifications, markAsRead, broadcastInventoryUpdate, createInventoryRequest, getInventoryRequests, updateRequestStatus } = require('../controllers/systemController');

// 🧠 NEW: Fetch Audit Logs
router.get('/audit-logs', getAuditLogs);

router.get('/notifications/:recipient', getNotifications);
router.put('/notifications/:id/read', markAsRead);
router.post('/notifications/broadcast', broadcastInventoryUpdate);

router.post('/inventory-requests', createInventoryRequest);
router.get('/inventory-requests', getInventoryRequests);
router.put('/inventory-requests/:id', updateRequestStatus);

module.exports = router;
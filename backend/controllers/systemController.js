const Notification = require('../models/Notification');
const InventoryRequest = require('../models/InventoryRequest');
const Inventory = require('../models/Inventory');
const AuditLog = require('../models/AuditLog'); // 🧠 NEW

// =======================
// SYSTEM AUDIT LOGS
// =======================
const getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find().sort({ createdAt: -1 });
        res.status(200).json(logs);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// =======================
// NOTIFICATION ENGINE
// =======================
const getNotifications = async (req, res) => {
    try {
        const { recipient } = req.params;
        const notifications = await Notification.find({
            $or: [{ recipient: recipient }, { recipient: 'ALL_WORKERS' }]
        }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
        res.status(200).json(notification);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const broadcastInventoryUpdate = async (req, res) => {
    try {
        const { message } = req.body;
        await Notification.create({ recipient: 'ALL_WORKERS', message });
        res.status(200).json({ success: true });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// =======================
// INVENTORY REQUESTS
// =======================
const createInventoryRequest = async (req, res) => {
    try {
        const { workerName, itemName, quantity, costPerUnit } = req.body;
        const request = await InventoryRequest.create({ workerName, itemName, quantity, costPerUnit });
        res.status(201).json(request);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const getInventoryRequests = async (req, res) => {
    try {
        const requests = await InventoryRequest.find().sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const request = await InventoryRequest.findById(id);
        if (!request) return res.status(404).json({ message: 'Not found' });
        
        request.status = status;
        await request.save();

        if (status === 'Approved') {
            let item = await Inventory.findOne({ itemName: request.itemName });
            if (item) {
                if (item.quantity < request.quantity) {
                    return res.status(400).json({ message: `Not enough stock for ${request.itemName}. Available: ${item.quantity}` });
                }
                item.quantity -= request.quantity;
                await item.save();
            } else {
                return res.status(404).json({ message: `Item "${request.itemName}" not found in inventory.` });
            }
        }

        await Notification.create({
            recipient: request.workerName,
            message: `📦 Inventory Request for ${request.quantity}x ${request.itemName} was ${status.toUpperCase()} by the Mayor.`
        });

        res.status(200).json(request);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getAuditLogs, getNotifications, markAsRead, broadcastInventoryUpdate, createInventoryRequest, getInventoryRequests, updateRequestStatus };
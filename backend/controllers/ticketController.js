const Ticket = require('../models/Ticket');
const Inventory = require('../models/Inventory');
const Worker = require('../models/Worker'); 
const Notification = require('../models/Notification'); 
const AuditLog = require('../models/AuditLog'); // 🧠 NEW

const getBestWorker = async (wardNumber, rejectedByList = []) => {
    const availableWorkers = await Worker.find({ wardNumber: wardNumber, status: 'Available' });
    const eligibleWorkers = availableWorkers.filter(w => !rejectedByList.includes(w.name));
    if (eligibleWorkers.length === 0) return null;

    let bestWorker = null;
    let minLoad = Infinity;
    for (const worker of eligibleWorkers) {
        const load = await Ticket.countDocuments({ assignedWorkerName: worker.name, status: { $in: ['Assigned', 'In Progress'] } });
        if (load < minLoad) { minLoad = load; bestWorker = worker; }
    }
    return bestWorker;
};

const createTicket = async (req, res) => {
    try {
        const { title, description, wardNumber, location, category, severity, userId } = req.body;
        const imageUrl = req.file ? req.file.path : '';

        if (!title || !description || !userId) return res.status(400).json({ message: 'Missing fields' });

        if (wardNumber && category) {
            const existingTicket = await Ticket.findOne({ category, wardNumber, status: { $in: ['Pending', 'Assigned', 'In Progress'] } });
            if (existingTicket) {
                if (!existingTicket.upvotedBy.includes(userId)) existingTicket.upvotedBy.push(userId);
                const voteCount = existingTicket.upvotedBy.length;
                if (voteCount >= 3 && existingTicket.severity === 'Low') existingTicket.severity = 'Medium';
                if (voteCount >= 5 && existingTicket.severity === 'Medium') existingTicket.severity = 'High';
                await existingTicket.save();
                return res.status(200).json({ message: '⚠️ Duplicate detected! Merged & boosted.', ticket: existingTicket });
            }
        }

        const bestWorker = await getBestWorker(wardNumber);
        let assignedWorkerName = bestWorker ? bestWorker.name : 'Unassigned';
        let initialStatus = bestWorker ? 'Assigned' : 'Pending';

        const ticket = await Ticket.create({
            user: userId, title, description, wardNumber, location, category, severity, imageUrl,
            assignedWorkerName, status: initialStatus                   
        });

        if (bestWorker) await Notification.create({ recipient: bestWorker.name, message: `🎯 System Auto-Assign: You received a new task: "${ticket.title}".` });

        // 🧠 AUDIT LOG: Ticket Created
        await AuditLog.create({ ticketId: ticket._id, ticketTitle: ticket.title, changedBy: 'Citizen System', oldStatus: 'None', newStatus: initialStatus });

        let successMessage = bestWorker ? `✅ Auto-assigned to ${bestWorker.name}.` : '✅ Waiting for a worker.';
        res.status(201).json({ message: successMessage, ticket });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const getUserTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ user: req.params.userId }).sort({ createdAt: -1 });
        res.status(200).json(tickets);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find().sort({ createdAt: -1 });
        res.status(200).json(tickets);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, changedBy } = req.body; // 🧠 NEW: Receives who made the change
        
        const ticket = await Ticket.findById(id);
        const oldStatus = ticket.status;
        ticket.status = status;
        await ticket.save();
        
        if (ticket) {
            await Notification.create({ recipient: ticket.user, message: `🚨 Status Update: Your report "${ticket.title}" is now marked as ${status}.` });
            
            // 🧠 AUDIT LOG: Worker Status Update
            await AuditLog.create({ ticketId: ticket._id, ticketTitle: ticket.title, changedBy: changedBy || 'Unknown Worker', oldStatus: oldStatus, newStatus: status });
        }

        res.status(200).json(ticket);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const upvoteTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        const ticket = await Ticket.findById(id);
        
        if (ticket.upvotedBy.includes(userId)) ticket.upvotedBy = ticket.upvotedBy.filter(vId => vId !== userId);
        else ticket.upvotedBy.push(userId);

        const voteCount = ticket.upvotedBy.length;
        if (voteCount >= 3 && ticket.severity === 'Low') ticket.severity = 'Medium';
        if (voteCount >= 5 && ticket.severity === 'Medium') ticket.severity = 'High';

        await ticket.save(); 
        res.status(200).json(ticket);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const logMaterialsUsed = async (req, res) => {
    try {
        const { id } = req.params;
        const { inventoryId, quantityUsed } = req.body;

        const ticket = await Ticket.findById(id);
        const item = await Inventory.findById(inventoryId);
        
        if (item.quantity < quantityUsed) return res.status(400).json({ message: 'Not enough stock!' });

        item.quantity -= quantityUsed;
        await item.save();

        const costForThisMaterial = quantityUsed * item.costPerUnit;
        ticket.materialsUsed.push({ itemName: item.itemName, quantity: quantityUsed, cost: costForThisMaterial });
        ticket.totalCost += costForThisMaterial;
        await ticket.save();

        res.status(200).json({ ticket, item });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { senderName, text } = req.body;

        const ticket = await Ticket.findById(id);
        ticket.comments.push({ senderName, text });
        await ticket.save();

        if (senderName.includes('Worker') || senderName.includes('Dispatcher')) {
            await Notification.create({ recipient: ticket.user, message: `💬 A worker replied to your report: "${ticket.title}"` });
        } else if (ticket.assignedWorkerName !== 'Unassigned') {
            await Notification.create({ recipient: ticket.assignedWorkerName, message: `💬 Citizen commented on your task: "${ticket.title}"` });
        }

        res.status(200).json(ticket);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const rateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating } = req.body;
        const ticket = await Ticket.findById(id);
        ticket.resolutionRating = rating;
        await ticket.save();
        res.status(200).json(ticket);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const rejectTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { workerName } = req.body;

        const ticket = await Ticket.findById(id);
        if (ticket.isMayorAssigned) return res.status(400).json({ message: 'Cannot reject Mayor assignment.' });

        const oldStatus = ticket.status; // Grab old status
        if (!ticket.rejectedBy.includes(workerName)) ticket.rejectedBy.push(workerName);

        const nextBestWorker = await getBestWorker(ticket.wardNumber, ticket.rejectedBy);
        if (nextBestWorker) {
            ticket.assignedWorkerName = nextBestWorker.name;
            ticket.status = 'Assigned';
            await Notification.create({ recipient: nextBestWorker.name, message: `🎯 Task Re-routed to you: "${ticket.title}".` });
        } else {
            ticket.assignedWorkerName = 'Unassigned';
            ticket.status = 'Pending';
        }

        await ticket.save();

        // 🧠 AUDIT LOG: Worker Rejection
        await AuditLog.create({ ticketId: ticket._id, ticketTitle: ticket.title, changedBy: `${workerName} (Rejected)`, oldStatus: oldStatus, newStatus: ticket.status });

        res.status(200).json(ticket);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const adminAssignTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { workerName } = req.body;
        const ticket = await Ticket.findById(id);

        const oldStatus = ticket.status; // Grab old status
        ticket.assignedWorkerName = workerName;
        ticket.status = 'Assigned';
        ticket.isMayorAssigned = true; 
        await ticket.save();

        await Notification.create({ recipient: workerName, message: `👑 Mayor Override: You have been forcefully assigned to "${ticket.title}".` });

        // 🧠 AUDIT LOG: Mayor Override
        await AuditLog.create({ ticketId: ticket._id, ticketTitle: ticket.title, changedBy: 'Admin/Mayor', oldStatus: oldStatus, newStatus: 'Assigned' });

        res.status(200).json(ticket);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { createTicket, getUserTickets, getAllTickets, updateTicketStatus, upvoteTicket, logMaterialsUsed, addComment, rateTicket, rejectTask, adminAssignTicket };
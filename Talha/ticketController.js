const Ticket = require('../models/Ticket');
const Inventory = require('../models/Inventory');
const Worker = require('../models/Worker'); 
const Notification = require('../models/Notification'); 
const AuditLog = require('../models/AuditLog'); 

########################################
// 1. FIND BEST WORKER IN SAME WARD WITH LOWEST ACTIVE WORKLOAD
########################################

const getBestWorker = async (wardNumber, rejectedByList = []) => {
    const availableWorkers = await Worker.find({ wardNumber: wardNumber, status: 'Available' });
    const eligibleWorkers = availableWorkers.filter(w => !rejectedByList.includes(w.name));
    if (eligibleWorkers.length === 0) return null;

    let bestWorker = null;
    let minLoad = Infinity;
    for (const worker of eligibleWorkers) {
        const load = await Ticket.countDocuments({ 
            assignedWorkerName: worker.name, 
            status: { $in: ['Assigned', 'In Progress'] } 
        });

        if (load < minLoad) { 
            minLoad = load; 
            bestWorker = worker; 
        }
    }

    return bestWorker;
};

########################################
// 2. CREATE ISSUE AND AUTO-ASSIGN TO BEST WORKER
########################################

const createTicket = async (req, res) => {
    try {
        const { title, description, wardNumber, location, category, severity, userId } = req.body;
        const imageUrl = req.file ? req.file.path : '';

        if (!title || !description || !userId) return res.status(400).json({ message: 'Missing fields' });

        if (wardNumber && category && location) {
            const normalizedLocation = location.trim();
            const escapedLocation = normalizedLocation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            const existingTicket = await Ticket.findOne({
                wardNumber: wardNumber.toString().trim(),
                category: category.trim(),
                location: { $regex: `^${escapedLocation}$`, $options: 'i' },
                status: { $ne: 'Resolved' }
            });

            if (existingTicket) {
                console.log("⚠️ Potential duplicate issue flagged in Ward", wardNumber);

                const updatedTicket = await Ticket.findOneAndUpdate(
                    { _id: existingTicket._id, upvotedBy: { $ne: userId } },
                    { $addToSet: { upvotedBy: userId }, $inc: { priorityScore: 10 } },
                    { new: true }
                );

                if (updatedTicket) {
                    return res.status(200).json({
                        duplicate: true,
                        upvoteAdded: true,
                        message: 'Duplicate ticket upvote added',
                        ticket: updatedTicket
                    });
                }

                return res.status(200).json({
                    duplicate: true,
                    upvoteAdded: false,
                    message: 'Duplicate ticket already exists. You already upvoted this ticket.',
                    ticket: existingTicket
                });
            }
        }

        let initialScore = 20;
        if (severity === 'Medium') initialScore = 30;
        if (severity === 'High') initialScore = 40;

        const ticket = new Ticket({ 
            user: userId, 
            title, 
            description, 
            wardNumber, 
            location, 
            category, 
            severity, 
            imageUrl,
            priorityScore: initialScore
        });
        
        const assignedWorker = await getBestWorker(wardNumber);

        if (assignedWorker) {
            ticket.assignedWorkerName = assignedWorker.name;
            ticket.status = 'Assigned';
        }
        
        await ticket.save();

        if (assignedWorker) {
            await Notification.create({ 
                recipient: assignedWorker.name, 
                message: `🚨 New task assigned: "${ticket.title}" in Ward ${wardNumber}.` 
            });
        }

        res.status(201).json(ticket);
    } catch (error) { 
        res.status(500).json({ message: error.message }); 
    }
};

########################################
// 3. WORKER CHANGES STATUS OF ASSIGNED TASK
########################################

const updateTicketStatus = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        const oldStatus = ticket.status;
        ticket.status = req.body.status;
        await ticket.save();

        await Notification.create({ 
            recipient: ticket.user, 
            message: `🔔 Your report "${ticket.title}" is now ${ticket.status}.` 
        });

        await AuditLog.create({ 
            ticketId: ticket._id, 
            ticketTitle: ticket.title, 
            changedBy: req.body.changedBy || 'System', 
            oldStatus: oldStatus, 
            newStatus: ticket.status 
        });

        res.status(200).json(ticket);
    } catch (error) { 
        res.status(500).json({ message: error.message }); 
    }
};

########################################
// 4. WORKER REJECTS / REMOVES AUTO-ASSIGNED TASK
// SYSTEM REASSIGNS TO ANOTHER WORKER IN SAME WARD
########################################

const rejectTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { workerName } = req.body;
        const ticket = await Ticket.findById(id);

        const oldStatus = ticket.status;

        if (!ticket.rejectedBy.includes(workerName)) {
            ticket.rejectedBy.push(workerName);
        }

        const newWorker = await getBestWorker(ticket.wardNumber, ticket.rejectedBy);

        if (newWorker) {
            ticket.assignedWorkerName = newWorker.name;
            ticket.status = 'Assigned';

            await Notification.create({ 
                recipient: newWorker.name, 
                message: `🚨 Reassigned task: "${ticket.title}" in Ward ${ticket.wardNumber}.` 
            });
        } else {
            ticket.assignedWorkerName = 'Unassigned';
            ticket.status = 'Pending';
        }

        await ticket.save();

        await AuditLog.create({ 
            ticketId: ticket._id, 
            ticketTitle: ticket.title, 
            changedBy: `${workerName} (Rejected)`, 
            oldStatus: oldStatus, 
            newStatus: ticket.status 
        });

        res.status(200).json(ticket);
    } catch (error) { 
        res.status(500).json({ message: error.message }); 
    }
};

########################################
// 5. ADMIN FORCE-ASSIGNS WORKER AND LOCKS TASK
########################################

const adminAssignTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { workerName } = req.body;
        const ticket = await Ticket.findById(id);

        const oldStatus = ticket.status; 
        ticket.assignedWorkerName = workerName;
        ticket.status = 'Assigned';
        ticket.isMayorAssigned = true; 
        await ticket.save();

        await Notification.create({ 
            recipient: workerName, 
            message: `👑 Mayor Override: You have been forcefully assigned to "${ticket.title}".` 
        });

        await AuditLog.create({ 
            ticketId: ticket._id, 
            ticketTitle: ticket.title, 
            changedBy: 'Admin/Mayor', 
            oldStatus: oldStatus, 
            newStatus: 'Assigned' 
        });

        res.status(200).json(ticket);
    } catch (error) { 
        res.status(500).json({ message: error.message }); 
    }
};

########################################
// EXPORTS USED BY ROUTES
########################################

module.exports = { 
    createTicket, 
    getUserTickets, 
    getAllTickets, 
    updateTicketStatus, 
    upvoteTicket, 
    logMaterialsUsed, 
    addComment, 
    rateTicket, 
    rejectTask, 
    adminAssignTicket 
};

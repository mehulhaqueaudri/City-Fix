const Worker = require('../models/Worker');
const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification');

########################################
// GET ALL WORKERS FOR ADMIN FORCE-ASSIGN DROPDOWN
########################################

const getAllWorkers = async (req, res) => {
    try {
        const workers = await Worker.find();
        res.status(200).json(workers);
    } catch (error) { 
        res.status(500).json({ message: error.message }); 
    }
};

########################################
// WORKER SHIFT TOGGLE
// WHEN WORKER CLOCKS IN, PENDING UNASSIGNED TICKETS IN SAME WARD ARE ASSIGNED
########################################

const toggleWorkerStatus = async (req, res) => {
    try {
        const worker = await Worker.findById(req.params.id);
        if (!worker) return res.status(404).json({ message: 'Worker not found' });

        worker.status = worker.status === 'Available' ? 'Offline' : 'Available';
        const updatedWorker = await worker.save();

        if (updatedWorker.status === 'Available') {
            const pendingTickets = await Ticket.find({ 
                wardNumber: updatedWorker.wardNumber, 
                status: 'Pending', 
                assignedWorkerName: 'Unassigned' 
            });

            for (const ticket of pendingTickets) {
                if (!ticket.rejectedBy.includes(updatedWorker.name)) {
                    ticket.assignedWorkerName = updatedWorker.name;
                    ticket.status = 'Assigned';
                    await ticket.save();

                    await Notification.create({ 
                        recipient: updatedWorker.name, 
                        message: `🎯 Assigned waiting task: "${ticket.title}" upon clock-in.` 
                    });
                }
            }
        }

        res.status(200).json(updatedWorker);
    } catch (error) { 
        res.status(500).json({ message: error.message }); 
    }
};

########################################
// EXPORTS USED BY ROUTES
########################################

module.exports = { 
    getWorkerStatus, 
    getAllWorkers, 
    toggleWorkerStatus 
};

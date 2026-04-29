const Worker = require('../models/Worker');
const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification'); // 🧠 NEW

const getWorkerStatus = async (req, res) => {
    try {
        let worker = await Worker.findOne();
        if (!worker) worker = await Worker.create({ name: 'Dispatcher 1', status: 'Offline' });
        res.status(200).json(worker);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAllWorkers = async (req, res) => {
    try {
        const workers = await Worker.find();
        res.status(200).json(workers);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const toggleWorkerStatus = async (req, res) => {
    try {
        const worker = await Worker.findById(req.params.id);
        if (!worker) return res.status(404).json({ message: 'Worker not found' });

        worker.status = worker.status === 'Available' ? 'Offline' : 'Available';
        const updatedWorker = await worker.save();

        if (updatedWorker.status === 'Available') {
            const pendingTickets = await Ticket.find({ wardNumber: updatedWorker.wardNumber, status: 'Pending', assignedWorkerName: 'Unassigned' });

            for (const ticket of pendingTickets) {
                if (!ticket.rejectedBy.includes(updatedWorker.name)) {
                    ticket.assignedWorkerName = updatedWorker.name;
                    ticket.status = 'Assigned';
                    await ticket.save();

                    // 🧠 NOTIFY WORKER OF CLOCK-IN ASSIGNMENTS
                    await Notification.create({ recipient: updatedWorker.name, message: `🎯 Assigned waiting task: "${ticket.title}" upon clock-in.` });
                }
            }
        }

        res.status(200).json(updatedWorker);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getWorkerStatus, getAllWorkers, toggleWorkerStatus };
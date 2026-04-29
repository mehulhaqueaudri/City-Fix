const Ticket = require('../models/Ticket');
const Worker = require('../models/Worker');

const getDashboardStats = async (req, res) => {
    try {
        const tickets = await Ticket.find();
        const workers = await Worker.find();

        const totalTickets = tickets.length;
        
        // .trim() removes accidental spaces, .toLowerCase() fixes capitalization issues
        const resolvedTickets = tickets.filter(t => t.status?.trim().toLowerCase() === 'resolved').length;
        const pendingTickets = tickets.filter(t => t.status?.trim().toLowerCase() === 'pending').length;
        const inProgressTickets = tickets.filter(t => t.status?.trim().toLowerCase() === 'in progress').length;

        // Find how many slipped through the cracks (Rejected, Open, etc.)
        const otherTickets = totalTickets - (resolvedTickets + pendingTickets + inProgressTickets);

        // Sum up the total cost from all tickets
        const totalBudgetSpent = tickets.reduce((sum, ticket) => sum + (ticket.totalCost || 0), 0);

        res.status(200).json({
            totalTickets,
            resolvedTickets,
            pendingTickets,
            inProgressTickets,
            otherTickets, 
            totalBudgetSpent,
            activeWorkers: workers.filter(w => w.status === 'Available').length,
            totalWorkers: workers.length
        });
    } catch (error) {
        console.error("Admin Analytics Error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats };
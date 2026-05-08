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

const getAvgResolutionTime = async (req, res) => {
    try {
        const resolvedTickets = await Ticket.find({ status: 'Resolved', resolvedAt: { $exists: true } });
        const categoryTimes = {};

        resolvedTickets.forEach(ticket => {
            const timeDiff = (new Date(ticket.resolvedAt) - new Date(ticket.createdAt)) / (1000 * 60 * 60); // hours
            if (!categoryTimes[ticket.category]) {
                categoryTimes[ticket.category] = [];
            }
            categoryTimes[ticket.category].push(timeDiff);
        });

        const avgTimes = {};
        for (const category in categoryTimes) {
            const times = categoryTimes[category];
            avgTimes[category] = times.reduce((sum, t) => sum + t, 0) / times.length;
        }

        res.status(200).json(avgTimes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getOpenIssuesPerWard = async (req, res) => {
    try {
        const openTickets = await Ticket.find({ status: { $ne: 'Resolved' } });
        const wardCounts = {};

        openTickets.forEach(ticket => {
            const ward = ticket.wardNumber;
            wardCounts[ward] = (wardCounts[ward] || 0) + 1;
        });

        res.status(200).json(wardCounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getWorkerPerformance = async (req, res) => {
    try {
        const workers = await Worker.find();
        const performance = [];

        for (const worker of workers) {
            const resolvedTickets = await Ticket.find({ assignedWorkerName: worker.name, status: 'Resolved' });
            const ratings = resolvedTickets.map(t => t.resolutionRating).filter(r => r);
            const avgRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
            const completedJobs = resolvedTickets.length;
            const score = 0.7 * avgRating + 0.3 * completedJobs;
            performance.push({
                workerName: worker.name,
                score: score.toFixed(2),
                avgRating: avgRating.toFixed(2),
                completedJobs
            });
        }

        performance.sort((a, b) => b.score - a.score);

        res.status(200).json(performance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMonthlyExpenses = async (req, res) => {
    try {
        const resolvedTickets = await Ticket.find({ status: 'Resolved', resolvedAt: { $exists: true } });
        const monthlyExpenses = {};

        resolvedTickets.forEach(ticket => {
            const month = ticket.resolvedAt.toISOString().slice(0, 7); // YYYY-MM
            monthlyExpenses[month] = (monthlyExpenses[month] || 0) + (ticket.totalCost || 0);
        });

        const expensesArray = Object.keys(monthlyExpenses).map(month => ({
            month,
            totalExpense: monthlyExpenses[month]
        })).sort((a, b) => a.month.localeCompare(b.month));

        res.status(200).json(expensesArray);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats, getAvgResolutionTime, getOpenIssuesPerWard, getWorkerPerformance, getMonthlyExpenses };
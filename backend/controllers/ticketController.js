const Ticket = require('../models/Ticket');

const createTicket = async (req, res) => {
  try {
    const { title, description, wardNumber, location, category, severity, userld } = req.body;
    const imageUrl = req.file ? req.file.path : "";

    if (!title || !description || !userld) {
      return res.status(400).json({ message: 'Missing fields' });
    }

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
        const updatedTicket = await Ticket.findOneAndUpdate(
          { _id: existingTicket._id, upvotedBy: { $ne: userld } },
          { $addToSet: { upvotedBy: userld }, $inc: { priorityScore: 10 } },
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
      user: userld,
      title,
      description,
      wardNumber,
      location,
      category,
      severity,
      imageUrl,
      priorityScore: initialScore
    });

    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ priorityScore: -1, createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const upvoteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { userld } = req.body;
    const ticket = await Ticket.findById(id);

    if (!ticket.upvotedBy.includes(userld)) {
      ticket.upvotedBy.push(userld);
      ticket.priorityScore += 10;
    }
    
    await ticket.save();
    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTicket,
  getAllTickets,
  upvoteTicket
};
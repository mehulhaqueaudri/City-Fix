const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import the routes
const ticketRoutes = require('./routes/ticketRoutes'); 

const app = express();
app.use(cors());
app.use(express.json());

// Connect to local MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/cityfix')
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Use the routes (This tells the app to use ticketRoutes for anything starting with /api/tickets)
app.use('/api/tickets', ticketRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
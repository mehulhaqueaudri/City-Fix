const ticketRoutes = require('./routes/ticketRoutes'); 
const workerRoutes = require('./routes/workerRoutes');

########################################
// MOUNT TICKET ROUTES
// USED FOR CREATE ISSUE, STATUS UPDATE, REJECT TASK, ADMIN FORCE ASSIGN
########################################

app.use('/api/tickets', ticketRoutes);

########################################
// MOUNT WORKER ROUTES
// USED FOR WORKER LIST AND CLOCK IN / CLOCK OUT
########################################

app.use('/api/workers', workerRoutes);

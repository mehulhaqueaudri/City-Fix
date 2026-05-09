########################################
// SLA LIMIT CONSTANT
########################################

const SLA_LIMIT_MS = 14 * 24 * 60 * 60 * 1000;

########################################
// FETCH ALL TICKETS FOR WORKER DASHBOARD
########################################

const fetchAllTickets = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/tickets');
    setTickets(response.data);
  } catch (error) { 
    console.error(error); 
  }
};

########################################
// WORKER CHANGES STATUS OF OWN ASSIGNED TASK
########################################

const handleStatusChange = async (ticketId, newStatus) => {
  try {
    await axios.put(`http://localhost:5000/api/tickets/${ticketId}/status`, { 
      status: newStatus,
      changedBy: worker.name 
    });

    setMessage(`✅ Ticket status updated to ${newStatus}`);
    fetchAllTickets(); 
  } catch (error) { 
    setMessage('❌ Failed to update ticket status'); 
  }
};

########################################
// WORKER REJECTS / REMOVES TASK
########################################

const handleRejectTask = async (ticketId) => {
  try {
    await axios.put(`http://localhost:5000/api/tickets/${ticketId}/reject`, { 
      workerName: worker.name 
    });

    setMessage('✅ Task rejected and routed to another worker.');
    fetchAllTickets();
  } catch (error) { 
    setMessage('❌ Failed to reject task'); 
  }
};

########################################
// WORKER CLOCK IN / CLOCK OUT
########################################

const handleShiftToggle = async () => {
  if (!worker) return;

  try {
    const response = await axios.put(`http://localhost:5000/api/workers/${worker._id}/toggle`);

    const updatedWorker = { ...worker, status: response.data.status };
    setWorker(updatedWorker); 
    localStorage.setItem('user', JSON.stringify(updatedWorker));

    setMessage(`Shift Updated: You are now ${response.data.status === 'Available' ? 'Clocked In ✅' : 'Clocked Out 🛑'}`);
    fetchAllTickets(); 
  } catch (error) { 
    setMessage("❌ Failed to update shift status"); 
  }
};

########################################
// FILTER WORKER'S OWN TASKS
########################################

const allMyTasks = tickets.filter(t => t.assignedWorkerName === worker?.name);

const myTasks = allMyTasks
  .filter(t => t.status !== 'Resolved')
  .sort((a, b) => getScore(b) - getScore(a));

const otherTasks = tickets
  .filter(t => t.assignedWorkerName !== worker?.name && t.status !== 'Resolved')
  .sort((a, b) => getScore(b) - getScore(a));

########################################
// SLA BREACH CALCULATION INSIDE TICKET CARD
########################################

const renderTicket = (ticket, isMyTask) => {
  const isBreached = ticket.status !== 'Resolved' && 
    ((new Date().getTime() - new Date(ticket.createdAt).getTime()) > SLA_LIMIT_MS);

  return (
    <div 
      key={ticket._id} 
      style={{ 
        background: 'white', 
        padding: '25px', 
        borderRadius: '12px', 
        borderLeft: `6px solid ${isBreached ? '#e74c3c' : (isMyTask ? '#3498db' : '#bdc3c7')}`, 
        marginBottom: '20px', 
        position: 'relative' 
      }}
    >

########################################
// SLA BREACH BADGE VISIBLE TO ASSIGNED WORKER
########################################

      {isBreached && (
        <div style={{ 
          position: 'absolute', 
          top: '-12px', 
          right: '20px', 
          background: '#e74c3c', 
          color: 'white', 
          padding: '4px 12px', 
          borderRadius: '12px', 
          fontSize: '0.8rem', 
          fontWeight: 'bold' 
        }}>
          🚨 SLA BREACH
        </div>
      )}

########################################
// STATUS DROPDOWN FOR ASSIGNED WORKER
########################################

      {isMyTask && (
        <select 
          value={ticket.status} 
          onChange={(e) => handleStatusChange(ticket._id, e.target.value)} 
          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #3498db', outline: 'none' }}
        >
          <option value="Assigned">Assigned</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
      )}

########################################
// REJECT BUTTON ONLY FOR NON-MAYOR-ASSIGNED TASKS
########################################

      {isMyTask && !ticket.isMayorAssigned && ticket.status !== 'Resolved' && (
         <button 
           onClick={() => handleRejectTask(ticket._id)} 
           style={{ 
             background: '#e74c3c', 
             color: 'white', 
             border: 'none', 
             padding: '6px 12px', 
             borderRadius: '6px', 
             cursor: 'pointer', 
             fontWeight: 'bold', 
             fontSize: '0.85rem' 
           }}
         >
           Reject / Remove
         </button>
      )}

########################################
// MAYOR LOCK MESSAGE WHEN FORCE-ASSIGNED
########################################

      {isMyTask && ticket.isMayorAssigned && (
         <span style={{ color: '#c0392b', fontSize: '0.8rem', fontWeight: 'bold' }}>
           🔒 Locked by Mayor
         </span>
      )}
    </div>
  );
};

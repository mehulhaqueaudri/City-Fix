########################################
// STATE USED FOR TICKETS, WORKERS, ACTIVE REPORTS, SLA, FORCE ASSIGN
########################################

const [currentTab, setCurrentTab] = useState('Overview'); 
const [tickets, setTickets] = useState([]);
const [allWorkers, setAllWorkers] = useState([]); 
const [auditLogs, setAuditLogs] = useState([]); 

const SLA_LIMIT_MS = 14 * 24 * 60 * 60 * 1000; 

########################################
// FETCH ALL TICKETS
// USED FOR ADMIN ACTIVE REPORTS AND SLA BREACHES
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
// FETCH ALL WORKERS
// USED FOR FORCE-ASSIGN DROPDOWN
########################################

const fetchAllWorkers = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/workers');
    setAllWorkers(response.data);
  } catch (error) { 
    console.error(error); 
  }
};

########################################
// FORCE ASSIGN FUNCTION
########################################

const handleMayorAssign = async (ticketId, workerName) => {
  if(!workerName) return;

  try {
    await axios.put(`http://localhost:5000/api/tickets/${ticketId}/admin-assign`, { workerName });

    alert(`Ticket assigned to ${workerName} and locked.`);
    fetchAllTickets();
    fetchAuditLogs();
  } catch (error) { 
    alert("❌ Failed to assign ticket."); 
  }
};

########################################
// SLA BREACH CALCULATION FOR ADMIN DASHBOARD
########################################

const now = new Date();

const resolvedTickets = tickets.filter(t => t.status === 'Resolved');
const openTickets = tickets.filter(t => t.status !== 'Resolved');

const breachedTickets = openTickets.filter(t => 
  (now.getTime() - new Date(t.createdAt).getTime()) > SLA_LIMIT_MS
);

########################################
// SLA BREACH CARD IN ADMIN OVERVIEW
########################################

<div style={{ 
  background: breachedTickets.length > 0 ? '#fdedec' : 'white', 
  padding: '25px', 
  borderRadius: '12px', 
  borderBottom: '5px solid #e74c3c' 
}}>
  <h5 style={{ 
    color: breachedTickets.length > 0 ? '#c0392b' : '#7f8c8d', 
    margin: '0 0 10px 0', 
    fontWeight: 'bold' 
  }}>
    🚨 SLA Breaches (&gt;14 Days)
  </h5>

  <h1 style={{ margin: 0, color: '#e74c3c', fontSize: '2.5rem' }}>
    {breachedTickets.length}
  </h1>
</div>

########################################
// ADMIN ACTIVE REPORTS TAB
// SHOWS STATUS, ASSIGNED WORKER, SLA BREACH, MAYOR LOCK, FORCE ASSIGN
########################################

{currentTab === 'ActiveReports' && (
  <div style={{ 
    background: 'white', 
    padding: '25px', 
    borderRadius: '12px', 
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)' 
  }}>
    <h3 style={{ 
      color: '#e67e22', 
      borderBottom: '2px solid #fdebd0', 
      paddingBottom: '10px', 
      marginBottom: '20px' 
    }}>
      🚨 Manual Dispatch Command
    </h3>

    {openTickets.map(ticket => {
      const wardWorkers = allWorkers.filter(w => w.wardNumber === ticket.wardNumber);
      const isBreached = (now.getTime() - new Date(ticket.createdAt).getTime()) > SLA_LIMIT_MS;

      return (
        <div 
          key={ticket._id} 
          style={{ 
            border: isBreached ? '2px solid #e74c3c' : '1px solid #eee', 
            borderRadius: '8px', 
            padding: '15px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            backgroundColor: isBreached ? '#fdedec' : '#f9f9f9', 
            marginBottom: '15px' 
          }}
        >
          <div>
            <h5 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontSize: '1.1rem' }}>
              {ticket.title} 

              <span style={{ 
                fontSize: '0.8rem', 
                background: '#ecf0f1', 
                padding: '3px 8px', 
                borderRadius: '12px', 
                marginLeft: '10px' 
              }}>
                Ward {ticket.wardNumber}
              </span>

              {isBreached && (
                <span style={{ 
                  fontSize: '0.8rem', 
                  background: '#e74c3c', 
                  color: 'white', 
                  padding: '3px 8px', 
                  borderRadius: '12px', 
                  marginLeft: '10px', 
                  fontWeight: 'bold' 
                }}>
                  🚨 SLA Breach (&gt;14 Days)
                </span>
              )}
            </h5>

            <p style={{ margin: 0, fontSize: '0.85rem', color: '#7f8c8d' }}>
              Status: 
              <strong style={{ color: ticket.status === 'In Progress' ? '#f39c12' : '#e74c3c' }}>
                {ticket.status}
              </strong> 
              {' '}| Assigned To: 
              <strong style={{ color: ticket.assignedWorkerName !== 'Unassigned' ? '#2980b9' : '#e74c3c' }}>
                {ticket.assignedWorkerName || 'Unassigned'}
              </strong>

              {ticket.isMayorAssigned && (
                <span style={{ marginLeft: '10px', color: '#c0392b' }}>
                  🔒 Mayor Locked
                </span>
              )}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <select 
              id={`assign-${ticket._id}`} 
              style={{ 
                padding: '8px', 
                borderRadius: '6px', 
                border: '1px solid #bdc3c7', 
                width: '200px' 
              }}
            >
              <option value="">Select a worker...</option>
              {wardWorkers.map(w => (
                <option key={w._id} value={w.name}>
                  {w.name} ({w.status})
                </option>
              ))}
            </select>

            <button 
              onClick={() => { 
                const sw = document.getElementById(`assign-${ticket._id}`).value; 
                handleMayorAssign(ticket._id, sw); 
              }} 
              style={{ 
                background: '#e67e22', 
                color: 'white', 
                border: 'none', 
                padding: '8px 15px', 
                borderRadius: '6px', 
                fontWeight: 'bold', 
                cursor: 'pointer' 
              }}
            >
              Force Assign
            </button>
          </div>
        </div>
      );
    })}
  </div>
)}

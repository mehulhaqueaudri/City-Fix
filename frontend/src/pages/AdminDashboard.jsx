import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [currentTab, setCurrentTab] = useState('Overview'); 
  const [tickets, setTickets] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [allWorkers, setAllWorkers] = useState([]); 
  
  const [inventoryRequests, setInventoryRequests] = useState([]);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [auditLogs, setAuditLogs] = useState([]); 

  const [newItemName, setNewItemName] = useState('');
  const [newCostPerUnit, setNewCostPerUnit] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [inventoryMessage, setInventoryMessage] = useState('');

  const navigate = useNavigate();
  const SLA_LIMIT_MS = 14 * 24 * 60 * 60 * 1000; 

  useEffect(() => {
    fetchAllTickets();
    fetchInventory();
    fetchAllWorkers(); 
    fetchInventoryRequests();
    fetchAuditLogs(); 
    const interval = setInterval(() => {
      fetchInventoryRequests();
      fetchAuditLogs();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllTickets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tickets');
      setTickets(response.data);
    } catch (error) { console.error(error); }
  };

  const fetchInventory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/inventory');
      setInventory(response.data);
    } catch (error) { console.error(error); }
  };

  const fetchAllWorkers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/workers');
      setAllWorkers(response.data);
    } catch (error) { console.error(error); }
  };

  const fetchInventoryRequests = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/system/inventory-requests');
      setInventoryRequests(response.data);
    } catch (error) { console.error(error); }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/system/audit-logs');
      setAuditLogs(response.data);
    } catch (error) { console.error(error); }
  };

  const handleApproveRequest = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/system/inventory-requests/${id}`, { status });
      fetchInventoryRequests();
      if (status === 'Approved') fetchInventory(); 
    } catch (error) { alert("❌ Failed to update request."); }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if(!broadcastMessage) return;
    try {
      await axios.post('http://localhost:5000/api/system/notifications/broadcast', { message: `📢 MAYOR BROADCAST: ${broadcastMessage}` });
      alert("✅ Broadcast sent to all workers!");
      setBroadcastMessage('');
    } catch (error) { alert("❌ Failed to send broadcast."); }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/inventory', {
        itemName: newItemName, costPerUnit: Number(newCostPerUnit), quantity: Number(newQuantity)
      });
      setInventoryMessage('✅ Material registered successfully!');
      setNewItemName(''); setNewCostPerUnit(''); setNewQuantity('');
      fetchInventory(); 
    } catch (error) { setInventoryMessage('❌ Failed to register material.'); }
    setTimeout(() => setInventoryMessage(''), 3000);
  };

  const handleMayorAssign = async (ticketId, workerName) => {
    if(!workerName) return;
    try {
      await axios.put(`http://localhost:5000/api/tickets/${ticketId}/admin-assign`, { workerName });
      alert(`Ticket assigned to ${workerName} and locked.`);
      fetchAllTickets();
      fetchAuditLogs();
    } catch (error) { alert("❌ Failed to assign ticket."); }
  };

  // ==========================================
  // 🧠 THE ADVANCED ANALYTICS ENGINE
  // ==========================================
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const resolvedTickets = tickets.filter(t => t.status === 'Resolved');
  const openTickets = tickets.filter(t => t.status !== 'Resolved');
  const breachedTickets = openTickets.filter(t => (now.getTime() - new Date(t.createdAt).getTime()) > SLA_LIMIT_MS);

  // FEATURE 14: Low Stock Alerts
  const LOW_STOCK_THRESHOLD = 20; 
  const lowStockItems = inventory.filter(item => item.quantity < LOW_STOCK_THRESHOLD);

  // FEATURE 24: Monthly Budget Expenditure
  const monthlyExpenditure = resolvedTickets
    .filter(t => {
      const d = new Date(t.updatedAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, ticket) => sum + (ticket.totalCost || 0), 0);

  // FEATURE 22: Ward/District Heatmap (Only Open Issues)
  const openWardStats = {};
  openTickets.forEach(ticket => {
    openWardStats[ticket.wardNumber] = (openWardStats[ticket.wardNumber] || 0) + 1;
  });
  const hottestWards = Object.entries(openWardStats).sort((a, b) => b[1] - a[1]);

  // FEATURE 21: Average Resolution Time Grouped By Category
  const categoryStats = {};
  resolvedTickets.forEach(ticket => {
    if (!categoryStats[ticket.category]) categoryStats[ticket.category] = { totalTimeMs: 0, count: 0 };
    const timeToResolve = new Date(ticket.updatedAt).getTime() - new Date(ticket.createdAt).getTime();
    categoryStats[ticket.category].totalTimeMs += timeToResolve;
    categoryStats[ticket.category].count += 1;
  });
  const resolutionTimeData = Object.entries(categoryStats).map(([category, stats]) => ({
    category,
    avgHours: (stats.totalTimeMs / stats.count / (1000 * 60 * 60)).toFixed(1)
  })).sort((a, b) => b.avgHours - a.avgHours);

  // FEATURE 23: Normalized Worker Performance (Bayesian Average)
  let globalTotalRating = 0;
  let globalRatingCount = 0;
  const workerStats = {};

  resolvedTickets.forEach(ticket => {
    const worker = ticket.assignedWorkerName || 'Unassigned';
    if (!workerStats[worker]) workerStats[worker] = { count: 0, totalRating: 0, ratingCount: 0 };
    workerStats[worker].count += 1;
    if (ticket.resolutionRating) {
      workerStats[worker].totalRating += ticket.resolutionRating;
      workerStats[worker].ratingCount += 1;
      globalTotalRating += ticket.resolutionRating;
      globalRatingCount += 1;
    }
  });

  // Bayesian Constants
  const C = globalRatingCount > 0 ? (globalTotalRating / globalRatingCount) : 0; // Mean rating across whole platform
  const m = 3; // Minimum confidence threshold (needs at least 3 ratings to be considered standard)

  const rankedWorkers = Object.entries(workerStats).map(([name, stats]) => {
    const v = stats.ratingCount; // Number of ratings for this worker
    const R = v > 0 ? (stats.totalRating / v) : 0; // Raw average
    // Normalized Formula: (v * R + m * C) / (v + m)
    const normalizedScore = v === 0 ? 0 : ((v * R) + (m * C)) / (v + m);
    
    return { 
      name, 
      jobsDone: stats.count, 
      rawAvg: R.toFixed(2), 
      score: normalizedScore.toFixed(2) 
    };
  }).sort((a, b) => b.score - a.score);


  return (
    <div style={{ padding: '20px', fontFamily: 'Segoe UI', backgroundColor: '#ecf0f1', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2c3e50', padding: '20px 30px', borderRadius: '12px', color: 'white', marginBottom: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
          <div>
            <h2 style={{ margin: 0, fontWeight: 'bold' }}>👑 Mayor's Executive Portal</h2>
            <p style={{ margin: '5px 0 0 0', color: '#bdc3c7', fontSize: '0.9rem' }}>CityFix Central Analytics & Dispatch</p>
          </div>
          <Link to="/" style={{ background: '#e74c3c', color: 'white', textDecoration: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', transition: '0.3s' }}>Exit</Link>
        </div>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
          <button onClick={() => setCurrentTab('Overview')} style={{ flex: 1, padding: '15px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', backgroundColor: currentTab === 'Overview' ? '#3498db' : 'white', color: currentTab === 'Overview' ? 'white' : '#2c3e50', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', fontSize: '1.1rem' }}>📊 Advanced Analytics</button>
          <button onClick={() => setCurrentTab('ActiveReports')} style={{ flex: 1, padding: '15px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', backgroundColor: currentTab === 'ActiveReports' ? '#e67e22' : 'white', color: currentTab === 'ActiveReports' ? 'white' : '#2c3e50', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', fontSize: '1.1rem' }}>🚨 Active Reports</button>
          <button onClick={() => setCurrentTab('AuditLogs')} style={{ flex: 1, padding: '15px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', backgroundColor: currentTab === 'AuditLogs' ? '#8e44ad' : 'white', color: currentTab === 'AuditLogs' ? 'white' : '#2c3e50', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', fontSize: '1.1rem' }}>📜 System Audit Log</button>
        </div>

        {currentTab === 'Overview' && (
          <>
            {/* FEATURE 14: Low Stock Alerts */}
            {lowStockItems.length > 0 && (
               <div style={{ background: '#fdedec', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e74c3c', display: 'flex', alignItems: 'center', gap: '15px' }}>
                 <span style={{ fontSize: '2rem' }}>⚠️</span>
                 <div>
                   <h4 style={{ margin: '0 0 5px 0', color: '#c0392b' }}>Critical Low Stock Alert</h4>
                   <p style={{ margin: 0, color: '#e74c3c', fontSize: '0.9rem', fontWeight: 'bold' }}>
                     The following items are below minimum threshold: {lowStockItems.map(i => `${i.itemName} (${i.quantity} left)`).join(', ')}
                   </p>
                 </div>
               </div>
            )}

            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '5px solid #f39c12', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <h4 style={{ margin: 0, color: '#d35400' }}>📢 City Broadcast:</h4>
              <form onSubmit={handleBroadcast} style={{ display: 'flex', flex: 1, gap: '10px' }}>
                <input type="text" placeholder="Send an alert to all City Workers..." value={broadcastMessage} onChange={e => setBroadcastMessage(e.target.value)} required style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #f5b041' }} />
                <button type="submit" style={{ background: '#e67e22', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Send</button>
              </form>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={{ background: 'white', padding: '25px', borderRadius: '12px', borderBottom: '5px solid #3498db' }}><h5 style={{ color: '#7f8c8d', margin: '0 0 10px 0' }}>🚧 Open Issues</h5><h1 style={{ margin: 0, color: '#2980b9', fontSize: '2.5rem' }}>{openTickets.length}</h1></div>
              <div style={{ background: breachedTickets.length > 0 ? '#fdedec' : 'white', padding: '25px', borderRadius: '12px', borderBottom: '5px solid #e74c3c' }}><h5 style={{ color: breachedTickets.length > 0 ? '#c0392b' : '#7f8c8d', margin: '0 0 10px 0', fontWeight: 'bold' }}>🚨 SLA Breaches (&gt;14 Days)</h5><h1 style={{ margin: 0, color: '#e74c3c', fontSize: '2.5rem' }}>{breachedTickets.length}</h1></div>
              
              {/* FEATURE 24: Correct Monthly Expenditure */}
              <div style={{ background: '#fef9e7', padding: '25px', borderRadius: '12px', borderBottom: '5px solid #f1c40f' }}>
                <h5 style={{ color: '#d4ac0d', margin: '0 0 10px 0' }}>📅 This Month's Expense</h5>
                <h1 style={{ margin: 0, color: '#f39c12', fontSize: '2.5rem' }}>৳{monthlyExpenditure}</h1>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
              
              {/* FEATURE 23: Normalized Worker Leaderboard */}
              <div style={{ background: 'white', padding: '25px', borderRadius: '12px' }}>
                <h3 style={{ color: '#2c3e50', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>🏆 Bayesian Worker Leaderboard</h3>
                <p style={{ fontSize: '0.8rem', color: '#95a5a6', marginBottom: '15px' }}>*Normalized via (vR + mC) / (v + m) to balance volume vs raw ratings.</p>
                {rankedWorkers.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                    <thead><tr style={{ color: '#7f8c8d', borderBottom: '1px solid #eee' }}><th style={{ paddingBottom: '8px' }}>Rank</th><th>Worker</th><th>Jobs</th><th>True Score</th></tr></thead>
                    <tbody>
                      {rankedWorkers.map((worker, index) => (
                        <tr key={worker.name} style={{ borderBottom: '1px solid #f9f9f9' }}>
                          <td style={{ padding: '10px 0', fontWeight: 'bold', color: index === 0 ? '#d35400' : '#34495e' }}>#{index + 1}</td>
                          <td style={{ padding: '10px 0', fontWeight: 'bold' }}>{worker.name}</td>
                          <td style={{ padding: '10px 0', color: '#2980b9' }}>{worker.jobsDone}</td>
                          <td style={{ padding: '10px 0' }}>
                            <span style={{ background: '#fff3cd', color: '#f39c12', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' }}>⭐ {worker.score > 0 ? worker.score : 'N/A'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p style={{ color: '#7f8c8d' }}>No data to rank.</p>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {/* FEATURE 22: Open Issues Heatmap */}
                <div style={{ background: 'white', padding: '25px', borderRadius: '12px' }}>
                  <h3 style={{ color: '#2c3e50', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>🗺️ Open Issue Heatmap Data</h3>
                  {hottestWards.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {hottestWards.map(([ward, count], index) => (
                        <li key={ward} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f9f9f9' }}>
                          <span style={{ fontSize: '1rem', color: '#34495e', fontWeight: 'bold' }}>📍 Ward {ward}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '100px', height: '8px', background: '#ecf0f1', borderRadius: '4px', overflow: 'hidden' }}><div style={{ height: '100%', background: index === 0 ? '#e74c3c' : '#f39c12', width: `${Math.min((count / openTickets.length) * 100, 100)}%` }}></div></div>
                            <span style={{ color: '#7f8c8d', fontSize: '0.85rem', width: '60px', textAlign: 'right' }}>{count} Open</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : <p style={{ color: '#7f8c8d' }}>No open issues.</p>}
                </div>

                {/* FEATURE 21: Avg Resolution by Category */}
                <div style={{ background: 'white', padding: '25px', borderRadius: '12px' }}>
                  <h3 style={{ color: '#2c3e50', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>⏱️ Avg Resolution by Type</h3>
                  {resolutionTimeData.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                      <thead><tr style={{ color: '#7f8c8d', borderBottom: '1px solid #eee' }}><th style={{ paddingBottom: '8px' }}>Category</th><th>Avg Time</th></tr></thead>
                      <tbody>
                        {resolutionTimeData.map(data => (
                          <tr key={data.category} style={{ borderBottom: '1px solid #f9f9f9' }}>
                            <td style={{ padding: '10px 0', fontWeight: 'bold', color: '#34495e' }}>{data.category}</td>
                            <td style={{ padding: '10px 0', color: '#8e44ad', fontWeight: 'bold' }}>{data.avgHours} Hours</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <p style={{ color: '#7f8c8d' }}>No resolved issues.</p>}
                </div>
              </div>
            </div>

            <div style={{ background: 'white', padding: '25px', borderRadius: '12px', marginTop: '30px', borderLeft: '6px solid #8e44ad' }}>
              <h3 style={{ color: '#2c3e50', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>🛠️ Material & Inventory Manager</h3>
              
              {inventoryRequests.filter(req => req.status === 'Pending').length > 0 && (
                <div style={{ background: '#fdf2e9', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #f5cba7' }}>
                  <h5 style={{ margin: '0 0 10px 0', color: '#d35400' }}>⚠️ Pending Worker Requests</h5>
                  {inventoryRequests.filter(req => req.status === 'Pending').map(req => (
                    <div key={req._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '10px', borderRadius: '6px', marginBottom: '8px', flexWrap: 'wrap', gap: '10px' }}>
                      <span><strong>{req.workerName}</strong> requests <strong>{req.quantity}x {req.itemName}</strong> <span style={{ color: '#c0392b', fontWeight: 'bold', marginLeft: '5px' }}>(@ ৳{req.costPerUnit || 0}/unit)</span></span>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleApproveRequest(req._id, 'Approved')} style={{ background: '#27ae60', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Approve</button>
                        <button onClick={() => handleApproveRequest(req._id, 'Rejected')} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '300px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
                  <form onSubmit={handleAddMaterial} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input type="text" placeholder="Material Name (e.g., Asphalt Bag)" value={newItemName} onChange={e => setNewItemName(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7' }} />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input type="number" placeholder="Cost Per Unit (৳)" value={newCostPerUnit} onChange={e => setNewCostPerUnit(e.target.value)} required min="0" style={{ flex: 1, padding: '10px', borderRadius: '6px' }} />
                      <input type="number" placeholder="Qty" value={newQuantity} onChange={e => setNewQuantity(e.target.value)} required min="1" style={{ width: '100px', padding: '10px', borderRadius: '6px' }} />
                    </div>
                    <button type="submit" style={{ background: '#8e44ad', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Add Material</button>
                  </form>
                </div>
                <div style={{ flex: '2', minWidth: '300px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead><tr style={{ backgroundColor: '#ecf0f1', color: '#7f8c8d' }}><th>Item</th><th>Cost/Unit</th><th>Stock Left</th></tr></thead>
                    <tbody>
                      {inventory.map(item => (
                        <tr key={item._id} style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '10px' }}>{item.itemName}</td><td style={{ padding: '10px', color: '#c0392b' }}>৳{item.costPerUnit}</td><td style={{ padding: '10px', fontWeight: 'bold' }}>{item.quantity}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {currentTab === 'ActiveReports' && (
          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h3 style={{ color: '#e67e22', borderBottom: '2px solid #fdebd0', paddingBottom: '10px', marginBottom: '20px' }}>🚨 Manual Dispatch Command</h3>
            {openTickets.map(ticket => {
              const wardWorkers = allWorkers.filter(w => w.wardNumber === ticket.wardNumber);
              const isBreached = (now.getTime() - new Date(ticket.createdAt).getTime()) > SLA_LIMIT_MS;
              return (
                <div key={ticket._id} style={{ border: isBreached ? '2px solid #e74c3c' : '1px solid #eee', borderRadius: '8px', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isBreached ? '#fdedec' : '#f9f9f9', marginBottom: '15px' }}>
                  <div>
                    <h5 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontSize: '1.1rem' }}>{ticket.title} <span style={{ fontSize: '0.8rem', background: '#ecf0f1', padding: '3px 8px', borderRadius: '12px', marginLeft: '10px' }}>Ward {ticket.wardNumber}</span>{isBreached && <span style={{ fontSize: '0.8rem', background: '#e74c3c', color: 'white', padding: '3px 8px', borderRadius: '12px', marginLeft: '10px', fontWeight: 'bold' }}>🚨 SLA Breach (&gt;14 Days)</span>}</h5>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#7f8c8d' }}>Status: <strong style={{ color: ticket.status === 'In Progress' ? '#f39c12' : '#e74c3c' }}>{ticket.status}</strong> | Assigned To: <strong style={{ color: ticket.assignedWorkerName !== 'Unassigned' ? '#2980b9' : '#e74c3c' }}>{ticket.assignedWorkerName || 'Unassigned'}</strong>{ticket.isMayorAssigned && <span style={{ marginLeft: '10px', color: '#c0392b' }}>🔒 Mayor Locked</span>}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <select id={`assign-${ticket._id}`} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #bdc3c7', width: '200px' }}>
                      <option value="">Select a worker...</option>
                      {wardWorkers.map(w => <option key={w._id} value={w.name}>{w.name} ({w.status})</option>)}
                    </select>
                    <button onClick={() => { const sw = document.getElementById(`assign-${ticket._id}`).value; handleMayorAssign(ticket._id, sw); }} style={{ background: '#e67e22', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Force Assign</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {currentTab === 'AuditLogs' && (
          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderTop: '6px solid #8e44ad' }}>
            <h3 style={{ color: '#2c3e50', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>📜 Permanent Database Audit Log</h3>
            <p style={{ color: '#7f8c8d', marginBottom: '20px', fontSize: '0.9rem' }}>This secure shadow table permanently records all state transitions. <strong>It cannot be edited or deleted by staff.</strong></p>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f4f6f7', color: '#2c3e50', borderBottom: '2px solid #bdc3c7' }}>
                    <th style={{ padding: '12px' }}>Timestamp</th>
                    <th style={{ padding: '12px' }}>Ticket Subject</th>
                    <th style={{ padding: '12px' }}>Action By</th>
                    <th style={{ padding: '12px' }}>State Transition</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => (
                    <tr key={log._id} style={{ borderBottom: '1px solid #eee', transition: '0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f9f9f9'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}>
                      <td style={{ padding: '12px', color: '#7f8c8d', fontSize: '0.85rem' }}>{new Date(log.createdAt).toLocaleString()}</td>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#34495e' }}>{log.ticketTitle}</td>
                      <td style={{ padding: '12px', color: '#d35400', fontWeight: 'bold' }}>{log.changedBy}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ backgroundColor: '#ecf0f1', padding: '4px 8px', borderRadius: '4px', color: '#7f8c8d', display: 'inline-block', minWidth: '80px', textAlign: 'center' }}>{log.oldStatus}</span> 
                        <span style={{ margin: '0 10px', color: '#bdc3c7' }}>➡️</span> 
                        <span style={{ backgroundColor: '#eaf2f8', padding: '4px 8px', borderRadius: '4px', color: '#2980b9', fontWeight: 'bold', display: 'inline-block', minWidth: '80px', textAlign: 'center' }}>{log.newStatus}</span>
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#7f8c8d' }}>No secure audit logs recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
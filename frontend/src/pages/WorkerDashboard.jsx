import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const WorkerDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [message, setMessage] = useState('');
  const [worker, setWorker] = useState(null);
  
  const [inventoryList, setInventoryList] = useState([]);
  const [materialForms, setMaterialForms] = useState({});
  const [commentText, setCommentText] = useState({}); 

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [reqItemName, setReqItemName] = useState('');
  const [reqQuantity, setReqQuantity] = useState('');
  const [reqCostPerUnit, setReqCostPerUnit] = useState(''); 
  
  const navigate = useNavigate();
  const SLA_LIMIT_MS = 14 * 24 * 60 * 60 * 1000;

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser || storedUser.role !== 'worker') {
      navigate('/login'); 
    } else {
      setWorker(storedUser);
    }
  }, [navigate]);

  useEffect(() => {
    if (worker) {
      fetchAllTickets();
      fetchInventoryList(); 
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [worker]);

  const fetchAllTickets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tickets');
      setTickets(response.data);
    } catch (error) { console.error(error); }
  };

  const fetchInventoryList = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/inventory');
      setInventoryList(response.data);
    } catch (error) { console.error(error); }
  };

  const fetchNotifications = async () => {
    if (!worker) return;
    try {
      const response = await axios.get(`http://localhost:5000/api/system/notifications/${worker.name}`);
      setNotifications(response.data);
    } catch (error) { console.error(error); }
  };

  const markNotificationRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/system/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) { console.error(error); }
  };

  const handleInventoryRequest = async (e) => {
    e.preventDefault();
    if (!reqItemName || !reqQuantity || !reqCostPerUnit) return;
    try {
      await axios.post('http://localhost:5000/api/system/inventory-requests', {
        workerName: worker.name, itemName: reqItemName, quantity: Number(reqQuantity), costPerUnit: Number(reqCostPerUnit)
      });
      setMessage('📦 Inventory Request sent to Mayor!');
      setReqItemName(''); setReqQuantity(''); setReqCostPerUnit('');
    } catch (error) { setMessage('❌ Failed to request inventory'); }
  };

  const handleShiftToggle = async () => {
    if (!worker) return;
    try {
      const response = await axios.put(`http://localhost:5000/api/workers/${worker._id}/toggle`);
      const updatedWorker = { ...worker, status: response.data.status };
      setWorker(updatedWorker); 
      localStorage.setItem('user', JSON.stringify(updatedWorker));
      setMessage(`Shift Updated: You are now ${response.data.status === 'Available' ? 'Clocked In ✅' : 'Clocked Out 🛑'}`);
      fetchAllTickets(); 
    } catch (error) { setMessage("❌ Failed to update shift status"); }
  };

  // 🧠 UPDATED: Now passes the worker.name to the Audit Log!
  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/tickets/${ticketId}/status`, { 
        status: newStatus,
        changedBy: worker.name // Tells the shadow table exactly who clicked this!
      });
      setMessage(`✅ Ticket status updated to ${newStatus}`);
      fetchAllTickets(); 
    } catch (error) { setMessage('❌ Failed to update ticket status'); }
  };

  const handleRejectTask = async (ticketId) => {
    if(!window.confirm("Are you sure you want to remove this task?")) return;
    try {
      await axios.put(`http://localhost:5000/api/tickets/${ticketId}/reject`, { workerName: worker.name });
      setMessage(`Task returned to dispatch queue.`);
      fetchAllTickets();
    } catch (error) { setMessage('❌ Failed to reject task'); }
  };

  const handleMaterialChange = (ticketId, field, value) => {
    setMaterialForms(prev => ({ ...prev, [ticketId]: { ...prev[ticketId], [field]: value } }));
  };

  const handleLogMaterial = async (ticketId) => {
    const form = materialForms[ticketId];
    if (!form || !form.inventoryId || !form.quantity) return setMessage("⚠️ Fill material fields.");
    try {
      await axios.put(`http://localhost:5000/api/tickets/${ticketId}/materials`, { inventoryId: form.inventoryId, quantityUsed: Number(form.quantity) });
      setMessage(`✅ Material logged!`);
      fetchAllTickets(); fetchInventoryList();
      setMaterialForms(prev => ({ ...prev, [ticketId]: { inventoryId: '', quantity: '' } }));
    } catch (err) { setMessage(`❌ ${err.response?.data?.message || 'Error'}`); }
  };

  const handleCommentSubmit = async (ticketId) => {
    if (!commentText[ticketId]) return;
    try {
      await axios.post(`http://localhost:5000/api/tickets/${ticketId}/comments`, { senderName: `City Worker (${worker.name})`, text: commentText[ticketId] });
      setCommentText({ ...commentText, [ticketId]: '' });
      fetchAllTickets();
    } catch (error) { console.error(error); }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const myTasks = tickets.filter(t => t.assignedWorkerName === worker?.name);
  const otherTasks = tickets.filter(t => t.assignedWorkerName !== worker?.name);
  const myRatedTasks = myTasks.filter(t => t.resolutionRating);
  const workerAvgRating = myRatedTasks.length > 0 ? (myRatedTasks.reduce((sum, t) => sum + t.resolutionRating, 0) / myRatedTasks.length).toFixed(1) : 'No Ratings Yet';
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const renderTicket = (ticket, isMyTask) => {
    const isBreached = ticket.status !== 'Resolved' && ((new Date().getTime() - new Date(ticket.createdAt).getTime()) > SLA_LIMIT_MS);
    return (
      <div key={ticket._id} style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: isMyTask ? '0 0 15px rgba(52, 152, 219, 0.4)' : '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', borderLeft: `6px solid ${isBreached ? '#e74c3c' : (isMyTask ? '#3498db' : (ticket.status === 'Resolved' ? '#2ecc71' : (ticket.status === 'In Progress' ? '#f1c40f' : '#e74c3c')))}`, marginBottom: '20px', position: 'relative' }}>
        {isBreached && <div style={{ position: 'absolute', top: '-12px', right: '20px', background: '#e74c3c', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>🚨 SLA BREACH</div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
          <div>
            <h4 style={{ margin: 0, color: '#2c3e50', fontSize: '1.2rem' }}>{ticket.title} {isMyTask && <span style={{ marginLeft: '10px', backgroundColor: '#eaf2f8', color: '#2980b9', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>🎯 Assigned</span>}</h4>
            <div style={{ fontSize: '0.85rem', marginTop: '5px', color: '#7f8c8d' }}>📍 Ward {ticket.wardNumber}</div>
          </div>
        </div>
        <p style={{ color: '#7f8c8d', fontSize: '0.9rem', marginBottom: '15px' }}>{ticket.description}</p>
        
        <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #eee', paddingTop: '15px', marginBottom: '15px', alignItems: 'center' }}>
          <strong style={{ fontSize: '0.9rem', color: '#2c3e50' }}>Status:</strong>
          {isMyTask ? (
            ticket.status === 'Resolved' ? <span style={{ padding: '8px 12px', background: '#e8f8f5', color: '#27ae60', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 'bold', flex: 1 }}>✅ Resolved (Locked)</span> : (
              <>
                <select value={ticket.status} onChange={(e) => handleStatusChange(ticket._id, e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #bdc3c7', flex: 1 }}>
                  <option value="Pending">Pending</option><option value="In Progress">In Progress</option><option value="Resolved">Resolved</option>
                </select>
                {ticket.isMayorAssigned ? <span style={{ padding: '8px 12px', background: '#fdedec', color: '#c0392b', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>🔒 Mayor Assigned</span> : <button onClick={() => handleRejectTask(ticket._id)} style={{ padding: '8px 12px', background: '#ecf0f1', color: '#7f8c8d', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>❌ Remove Task</button>}
              </>
            )
          ) : <span style={{ padding: '8px 12px', background: '#ecf0f1', color: '#7f8c8d', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 'bold', flex: 1 }}>{ticket.status} 🔒 (View Only)</span>}
        </div>

        {isMyTask && (
          <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #e9ecef', marginBottom: '15px' }}>
            <h6 style={{ margin: '0 0 10px 0', color: '#34495e' }}>🛠️ Materials</h6>
            {ticket.status !== 'Resolved' ? (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <select value={materialForms[ticket._id]?.inventoryId || ''} onChange={(e) => handleMaterialChange(ticket._id, 'inventoryId', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #bdc3c7', flex: 1 }}>
                  <option value="">Select material...</option>
                  {inventoryList.map(item => <option key={item._id} value={item._id} disabled={item.quantity === 0}>{item.itemName} ({item.quantity} left)</option>)}
                </select>
                <input type="number" placeholder="Qty" value={materialForms[ticket._id]?.quantity || ''} onChange={(e) => handleMaterialChange(ticket._id, 'quantity', e.target.value)} style={{ width: '70px', padding: '8px', borderRadius: '6px', border: '1px solid #bdc3c7' }} min="1"/>
                <button onClick={() => handleLogMaterial(ticket._id)} style={{ background: '#3498db', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Log</button>
              </div>
            ) : <div style={{ marginTop: '10px', padding: '10px', background: '#ecf0f1', color: '#7f8c8d', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', textAlign: 'center' }}>🔒 Task Resolved. Material logging is locked.</div>}
          </div>
        )}

        <div style={{ backgroundColor: '#fffbe6', borderRadius: '8px', padding: '15px', border: '1px solid #f9e79f' }}>
          <h6 style={{ margin: '0 0 10px 0', color: '#d35400' }}>💬 Discussion</h6>
          <div style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '10px' }}>
            {ticket.comments && ticket.comments.map((c, i) => (
              <div key={i} style={{ marginBottom: '8px', fontSize: '0.85rem' }}><strong style={{ color: c.senderName.includes('Worker') ? '#e67e22' : '#2980b9' }}>{c.senderName}: </strong><span style={{ color: '#2c3e50' }}>{c.text}</span></div>
            ))}
          </div>
          {isMyTask && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" placeholder="Add comment..." value={commentText[ticket._id] || ''} onChange={e => setCommentText({ ...commentText, [ticket._id]: e.target.value })} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #f5b041', fontSize: '0.85rem' }} onKeyDown={e => e.key === 'Enter' && handleCommentSubmit(ticket._id)} />
              <button onClick={() => handleCommentSubmit(ticket._id)} style={{ background: '#e67e22', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>Send</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Segoe UI', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', position: 'relative' }}>
          <h2 style={{ color: '#2c3e50', margin: 0 }}>Worker Dispatch</h2>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotifications(!showNotifications)}>
              <span style={{ fontSize: '1.5rem' }}>🔔</span>
              {unreadCount > 0 && <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#e74c3c', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold' }}>{unreadCount}</span>}
            </div>
            <button onClick={handleLogout} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
          </div>

          {showNotifications && (
            <div style={{ position: 'absolute', top: '50px', right: '80px', width: '300px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', zIndex: 100, maxHeight: '400px', overflowY: 'auto' }}>
              <div style={{ padding: '10px 15px', borderBottom: '1px solid #eee', fontWeight: 'bold', color: '#2c3e50' }}>Notifications</div>
              {notifications.length === 0 ? <div style={{ padding: '15px', color: '#7f8c8d', fontSize: '0.9rem', textAlign: 'center' }}>No notifications yet.</div> : 
                notifications.map(notif => (
                  <div key={notif._id} onClick={() => markNotificationRead(notif._id)} style={{ padding: '12px 15px', borderBottom: '1px solid #f9f9f9', backgroundColor: notif.isRead ? 'white' : '#eaf2f8', cursor: 'pointer', fontSize: '0.85rem', color: '#34495e' }}>
                    {!notif.isRead && <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#3498db', borderRadius: '50%', marginRight: '8px' }}></span>}
                    {notif.message}
                  </div>
                ))
              }
            </div>
          )}
        </div>

        {worker && (
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
            <div>
              <h4 style={{ margin: 0, color: '#2c3e50' }}>Shift Status: <span style={{ color: worker.status === 'Available' ? '#27ae60' : '#e74c3c', marginLeft: '10px' }}>{worker.status}</span></h4>
              <p style={{ margin: '5px 0 0 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Worker: <strong>{worker.name}</strong> | Ward: <strong>{worker.wardNumber}</strong> | ⭐ Avg Rating: <strong>{workerAvgRating}</strong></p>
            </div>
            <button onClick={handleShiftToggle} style={{ background: worker.status === 'Available' ? '#e74c3c' : '#2ecc71', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              {worker.status === 'Available' ? 'Clock Out' : 'Clock In'}
            </button>
          </div>
        )}

        {message && <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: message.includes('✅') ? '#e8f8f5' : '#fef9e7', color: message.includes('✅') ? '#1abc9c' : '#f39c12', borderRadius: '6px', textAlign: 'center', fontWeight: 'bold' }}>{message}</div>}

        <div style={{ background: '#f9edfce6', padding: '20px', borderRadius: '12px', border: '1px solid #e8daef', marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h5 style={{ margin: '0 0 5px 0', color: '#8e44ad', fontSize: '1.1rem' }}>📦 Request Materials from Mayor</h5>
            <p style={{ margin: 0, color: '#9b59b6', fontSize: '0.85rem' }}>Need an item that isn't in stock? Send a request!</p>
          </div>
          <form onSubmit={handleInventoryRequest} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Item Name (e.g. Stop Sign)" value={reqItemName} onChange={e => setReqItemName(e.target.value)} required style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d7bde2', flex: 1, minWidth: '150px' }} />
            <input type="number" placeholder="Cost/Unit (৳)" value={reqCostPerUnit} onChange={e => setReqCostPerUnit(e.target.value)} required min="0" style={{ width: '110px', padding: '8px', borderRadius: '6px', border: '1px solid #d7bde2' }} />
            <input type="number" placeholder="Qty" value={reqQuantity} onChange={e => setReqQuantity(e.target.value)} required min="1" style={{ width: '80px', padding: '8px', borderRadius: '6px', border: '1px solid #d7bde2' }} />
            <button type="submit" style={{ background: '#8e44ad', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Send Request</button>
          </form>
        </div>

        {myTasks.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ color: '#2980b9', marginBottom: '20px', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>🎯 My Assigned Tasks</h3>
            {myTasks.map(ticket => renderTicket(ticket, true))}
          </div>
        )}

        <div>
           <h3 style={{ color: '#34495e', marginBottom: '20px', borderBottom: '2px solid #bdc3c7', paddingBottom: '10px' }}>📋 All Other City Reports</h3>
           {otherTasks.map(ticket => renderTicket(ticket, false))}
        </div>

      </div>
    </div>
  );
};

export default WorkerDashboard;
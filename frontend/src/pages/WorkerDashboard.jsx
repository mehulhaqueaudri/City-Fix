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

  // 🌟 FEATURE: Standalone Inventory Checkout states
  const [checkoutItemId, setCheckoutItemId] = useState('');
  const [checkoutQty, setCheckoutQty] = useState('');
  const [checkoutPurpose, setCheckoutPurpose] = useState('');
  const [checkoutHistory, setCheckoutHistory] = useState([]);
  const [showCheckoutHistory, setShowCheckoutHistory] = useState(false);
  
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
      fetchCheckoutHistory();
      const interval = setInterval(() => {
        fetchAllTickets();
        fetchNotifications();
      }, 10000); 
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

<<<<<<< Updated upstream
  // 🌟 FEATURE: Fetch checkout history
  const fetchCheckoutHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/inventory/checkouts');
      setCheckoutHistory(response.data);
    } catch (error) { console.error(error); }
  };

  // 🌟 FEATURE: Handle standalone inventory checkout
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!checkoutItemId || !checkoutQty) return setMessage("⚠️ Select a material and quantity.");
    try {
      await axios.post('http://localhost:5000/api/inventory/checkout', {
        workerName: worker.name,
        items: [{ inventoryId: checkoutItemId, quantity: Number(checkoutQty) }],
        purpose: checkoutPurpose
      });
      setMessage('✅ Material checked out successfully!');
      setCheckoutItemId(''); setCheckoutQty(''); setCheckoutPurpose('');
      fetchInventoryList();
      fetchCheckoutHistory();
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.message || 'Checkout failed'}`);
    }
  };

  const fetchNotifications = async () => {
    if(!worker) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/system/notifications/${worker.name}`);
      setNotifications(res.data);
    } catch (err) { console.error(err); }
  };

  const markNotificationAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/system/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) { console.error(err); }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/tickets/${ticketId}/status`, { 
        status: newStatus,
        changedBy: worker.name 
      });
      setMessage(`✅ Ticket status updated to ${newStatus}`);
      fetchAllTickets(); 
    } catch (error) { setMessage('❌ Failed to update ticket status'); }
  };

  const handleRejectTask = async (ticketId) => {
    try {
      await axios.put(`http://localhost:5000/api/tickets/${ticketId}/reject`, { workerName: worker.name });
      setMessage('✅ Task rejected and routed to another worker.');
      fetchAllTickets();
    } catch (error) { setMessage('❌ Failed to reject task'); }
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

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleLogMaterial = async (ticketId) => {
    const form = materialForms[ticketId];
    if (!form || !form.inventoryId || !form.quantity) return setMessage("⚠️ Fill material fields.");
    try {
      await axios.put(`http://localhost:5000/api/tickets/${ticketId}/materials`, { 
          inventoryId: form.inventoryId, 
          quantityUsed: Number(form.quantity) 
      });
      setMessage(`✅ Material logged!`);
      fetchAllTickets(); fetchInventoryList();
    } catch (err) { setMessage(`❌ Error`); }
  };

  const handleCommentSubmit = async (ticketId) => {
    if (!commentText[ticketId]) return;
    try {
      await axios.post(`http://localhost:5000/api/tickets/${ticketId}/comments`, { 
          senderName: worker.name, 
          text: commentText[ticketId] 
      });
      setCommentText({ ...commentText, [ticketId]: '' });
      fetchAllTickets();
    } catch (error) { console.error(error); }
  };

  const handleInventoryRequest = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/system/inventory-requests', {
        workerName: worker.name,
        itemName: reqItemName,
        quantity: reqQuantity,
        costPerUnit: reqCostPerUnit
      });
      setMessage('✅ Inventory Request Sent to Mayor.');
      setReqItemName(''); setReqQuantity(''); setReqCostPerUnit('');
    } catch (error) { setMessage('❌ Failed to request inventory'); }
  };

  // 🌟 NEW LOGIC: Real-time mathematical scoring
  const getScore = (t) => {
    let score = 20; 
    if (t.severity === 'Medium') score = 30;
    if (t.severity === 'High') score = 40;
    score += (t.upvotedBy?.length || 0) * 10;
    return score;
  };

  const allMyTasks = tickets.filter(t => t.assignedWorkerName === worker?.name);
  const myTasks = allMyTasks.filter(t => t.status !== 'Resolved').sort((a, b) => getScore(b) - getScore(a));
  const otherTasks = tickets.filter(t => t.assignedWorkerName !== worker?.name && t.status !== 'Resolved').sort((a, b) => getScore(b) - getScore(a));
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const renderTicket = (ticket, isMyTask) => {
    const isBreached = ticket.status !== 'Resolved' && ((new Date().getTime() - new Date(ticket.createdAt).getTime()) > SLA_LIMIT_MS);
    
    return (
      <div key={ticket._id} style={{ background: 'white', padding: '25px', borderRadius: '12px', borderLeft: `6px solid ${isBreached ? '#e74c3c' : (isMyTask ? '#3498db' : '#bdc3c7')}`, marginBottom: '20px', position: 'relative' }}>
        
        {isBreached && <div style={{ position: 'absolute', top: '-12px', right: '20px', background: '#e74c3c', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>🚨 SLA BREACH</div>}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
          <div>
            <h4 style={{ margin: 0, color: '#2c3e50', fontSize: '1.2rem' }}>
              {ticket.title} 
              {isMyTask && <span style={{ marginLeft: '10px', backgroundColor: '#eaf2f8', color: '#2980b9', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>🎯 Assigned</span>}
            </h4>
            <div style={{ fontSize: '0.85rem', marginTop: '5px', color: '#7f8c8d' }}>📍 Ward {ticket.wardNumber} | 🚨 {ticket.severity} Priority</div>
          </div>
          {/* Rank badge has been completely removed! */}
        </div>

        <p style={{ color: '#7f8c8d', fontSize: '0.9rem', marginBottom: '15px' }}>{ticket.description}</p>
        
        {ticket.imageUrl && (
          <img src={ticket.imageUrl} alt="Issue Evidence" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #bdc3c7' }} />
        )}

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ padding: '6px 12px', background: '#ecf0f1', color: '#7f8c8d', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>Status: {ticket.status}</span>
          {isMyTask && (
            <select value={ticket.status} onChange={(e) => handleStatusChange(ticket._id, e.target.value)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #3498db', outline: 'none' }}>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          )}
          {isMyTask && !ticket.isMayorAssigned && ticket.status !== 'Resolved' && (
             <button onClick={() => handleRejectTask(ticket._id)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>Reject / Remove</button>
          )}
          {isMyTask && ticket.isMayorAssigned && (
             <span style={{ color: '#c0392b', fontSize: '0.8rem', fontWeight: 'bold' }}>🔒 Locked by Mayor</span>
          )}
        </div>

        {isMyTask && ticket.status !== 'Resolved' && (
          <div style={{ background: '#f9fbfd', padding: '15px', borderRadius: '8px', border: '1px dashed #bdc3c7', marginBottom: '15px' }}>
            <h6 style={{ margin: '0 0 10px 0', color: '#34495e' }}>🛠️ Log Materials Used</h6>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select onChange={e => setMaterialForms({ ...materialForms, [ticket._id]: { ...materialForms[ticket._id], inventoryId: e.target.value } })} style={{ flex: 1, padding: '8px', borderRadius: '4px' }}>
                <option value="">Select Material...</option>
                {inventoryList.map(item => <option key={item._id} value={item._id}>{item.itemName} (Available: {item.quantity})</option>)}
              </select>
              <input type="number" placeholder="Qty" onChange={e => setMaterialForms({ ...materialForms, [ticket._id]: { ...materialForms[ticket._id], quantity: e.target.value } })} style={{ width: '80px', padding: '8px', borderRadius: '4px' }} />
              <button onClick={() => handleLogMaterial(ticket._id)} style={{ background: '#2ecc71', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px' }}>Save</button>
            </div>
            
            {ticket.materialsUsed && ticket.materialsUsed.length > 0 && (
              <div style={{ marginTop: '10px', fontSize: '0.85rem' }}>
                <strong style={{ color: '#7f8c8d' }}>Logged:</strong>
                <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px', color: '#2c3e50' }}>
                  {ticket.materialsUsed.map((m, i) => <li key={i}>{m.quantity}x {m.itemName} (Cost: ৳{m.cost})</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
          <h6 style={{ margin: '0 0 10px 0', color: '#34495e' }}>💬 Discussion Thread</h6>
          <div style={{ maxHeight: '100px', overflowY: 'auto', marginBottom: '10px' }}>
            {ticket.comments && ticket.comments.map((c, i) => (
              <div key={i} style={{ marginBottom: '8px', fontSize: '0.85rem' }}>
                <strong style={{ color: c.senderName.includes('Worker') ? '#e67e22' : '#2980b9' }}>{c.senderName}: </strong>
                <span>{c.text}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="text" placeholder="Add a comment..." value={commentText[ticket._id] || ''} onChange={e => setCommentText({ ...commentText, [ticket._id]: e.target.value })} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #bdc3c7' }} />
            <button onClick={() => handleCommentSubmit(ticket._id)} style={{ background: '#3498db', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px' }}>Post</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2c3e50', padding: '20px', borderRadius: '12px', color: 'white', marginBottom: '30px' }}>
          <div>
            <h2 style={{ margin: 0 }}>CityFix Dispatch</h2>
            <p style={{ margin: '5px 0 0 0', color: '#bdc3c7' }}>Worker: {worker?.name} | Ward: {worker?.wardNumber}</p>
          </div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotifications(!showNotifications)}>
              <span style={{ fontSize: '1.5rem' }}>🔔</span>
              {unreadCount > 0 && <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#e74c3c', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold' }}>{unreadCount}</span>}
              {showNotifications && notifications.length > 0 && (
                <div style={{ position: 'absolute', top: '40px', right: '0', background: 'white', color: 'black', width: '300px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000, maxHeight: '300px', overflowY: 'auto' }}>
                  {notifications.map(n => (
                    <div key={n._id} onClick={() => markNotificationAsRead(n._id)} style={{ padding: '12px', borderBottom: '1px solid #eee', background: n.isRead ? 'white' : '#eaf2f8', cursor: 'pointer' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#2c3e50' }}>{n.message}</p>
                      <small style={{ color: '#7f8c8d' }}>{new Date(n.createdAt).toLocaleString()}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={handleShiftToggle} style={{ background: worker?.status === 'Available' ? '#e74c3c' : '#2ecc71', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', fontWeight: 'bold' }}>
              {worker?.status === 'Available' ? 'Clock Out' : 'Clock In'}
            </button>
            <button onClick={handleLogout} style={{ background: '#7f8c8d', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px' }}>Logout</button>
          </div>
        </div>

        {message && <div style={{ padding: '12px', background: message.includes('❌') ? '#fdeded' : '#e8f8f5', color: message.includes('❌') ? '#e74c3c' : '#2ecc71', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold', textAlign: 'center' }}>{message}</div>}

        <div style={{ background: '#f4ecf7', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #d7bde2' }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#8e44ad' }}>📦 Request New Material (To Mayor)</h4>
          <form onSubmit={handleInventoryRequest} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Material Name (e.g., Cement)" value={reqItemName} onChange={e => setReqItemName(e.target.value)} required style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d7bde2', flex: 1, minWidth: '150px' }} />
            <input type="number" placeholder="Cost/Unit (৳)" value={reqCostPerUnit} onChange={e => setReqCostPerUnit(e.target.value)} required min="0" style={{ width: '110px', padding: '8px', borderRadius: '6px', border: '1px solid #d7bde2' }} />
            <input type="number" placeholder="Qty" value={reqQuantity} onChange={e => setReqQuantity(e.target.value)} required min="1" style={{ width: '80px', padding: '8px', borderRadius: '6px', border: '1px solid #d7bde2' }} />
            <button type="submit" style={{ background: '#8e44ad', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Send Request</button>
          </form>
        </div>

        {/* 🌟 FEATURE: Standalone Inventory Checkout Section */}
        <div style={{ background: '#e8f6f3', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #a3d9cd' }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#1abc9c' }}>🛒 Check-Out Material from Inventory</h4>
          <form onSubmit={handleCheckout} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px', color: '#7f8c8d' }}>Material</label>
              <select value={checkoutItemId} onChange={e => setCheckoutItemId(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #a3d9cd' }}>
                <option value="">Select Material...</option>
                {inventoryList.map(item => <option key={item._id} value={item._id}>{item.itemName} (Stock: {item.quantity}, ৳{item.costPerUnit}/unit)</option>)}
              </select>
            </div>
            <div style={{ width: '90px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px', color: '#7f8c8d' }}>Qty</label>
              <input type="number" placeholder="Qty" value={checkoutQty} onChange={e => setCheckoutQty(e.target.value)} required min="1" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #a3d9cd' }} />
            </div>
            <div style={{ flex: '1 1 150px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px', color: '#7f8c8d' }}>Purpose (Optional)</label>
              <input type="text" placeholder="e.g., Road repair Ward 5" value={checkoutPurpose} onChange={e => setCheckoutPurpose(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #a3d9cd' }} />
            </div>
            <button type="submit" style={{ background: '#1abc9c', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>✅ Checkout</button>
          </form>

          {/* Live Cost Preview */}
          {checkoutItemId && checkoutQty > 0 && (() => {
            const selectedItem = inventoryList.find(i => i._id === checkoutItemId);
            if (!selectedItem) return null;
            const liveCost = Number(checkoutQty) * selectedItem.costPerUnit;
            return (
              <div style={{ marginTop: '12px', padding: '10px 15px', background: '#d5f5e3', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#27ae60', fontWeight: 'bold' }}>💰 Estimated Total Cost:</span>
                <span style={{ color: '#27ae60', fontSize: '1.3rem', fontWeight: 'bold' }}>৳{liveCost.toLocaleString()}</span>
              </div>
            );
          })()}

          {/* Checkout History Toggle */}
          <div style={{ marginTop: '15px' }}>
            <button onClick={() => setShowCheckoutHistory(!showCheckoutHistory)} style={{ background: 'none', border: '1px solid #1abc9c', color: '#1abc9c', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>
              {showCheckoutHistory ? '▲ Hide' : '▼ Show'} My Checkout History ({checkoutHistory.filter(c => c.workerName === worker?.name).length})
            </button>
          </div>

          {showCheckoutHistory && (() => {
            const myCheckouts = checkoutHistory.filter(c => c.workerName === worker?.name);
            return myCheckouts.length > 0 ? (
              <div style={{ marginTop: '10px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#d5f5e3', color: '#2c3e50' }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Items</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Purpose</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myCheckouts.map(checkout => (
                      <tr key={checkout._id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                        <td style={{ padding: '10px', color: '#7f8c8d' }}>{new Date(checkout.createdAt).toLocaleString()}</td>
                        <td style={{ padding: '10px' }}>
                          {checkout.items.map((item, i) => (
                            <div key={i} style={{ marginBottom: '2px' }}>
                              <strong>{item.quantity}x</strong> {item.itemName} <span style={{ color: '#7f8c8d' }}>(৳{item.costPerUnit}/unit = ৳{item.totalCost})</span>
                            </div>
                          ))}
                        </td>
                        <td style={{ padding: '10px', color: '#7f8c8d', fontStyle: 'italic' }}>{checkout.purpose || '—'}</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#27ae60', fontSize: '1.05rem' }}>৳{checkout.grandTotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ marginTop: '10px', color: '#7f8c8d', fontStyle: 'italic' }}>No checkouts yet.</p>
            );
          })()}
        </div>


        {myTasks.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ color: '#2980b9', marginBottom: '20px', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>🎯 My Assigned Tasks</h3>
            {myTasks.map(ticket => renderTicket(ticket, true))}
          </div>
        )}

        {otherTasks.length > 0 && (
          <div>
            <h3 style={{ color: '#34495e', marginBottom: '20px', borderBottom: '2px solid #bdc3c7', paddingBottom: '10px' }}>📋 All Other City Reports</h3>
            {otherTasks.map(ticket => renderTicket(ticket, false))}
          </div>
        )}

        {myTasks.length === 0 && otherTasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d', background: 'white', borderRadius: '12px' }}>No active reports at the moment.</div>
        )}

      </div>
    </div>
  );
};

export default WorkerDashboard;
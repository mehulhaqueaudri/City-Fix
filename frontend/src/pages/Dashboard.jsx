import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [commentText, setCommentText] = useState({}); 
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [wardNumber, setWardNumber] = useState('');
  const [category, setCategory] = useState('Roads');
  const [severity, setSeverity] = useState('Low');
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');

  const [activeTab, setActiveTab] = useState('CityFeed');
  const [subscribedWard, setSubscribedWard] = useState('1'); 
  
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const userId = storedUser ? storedUser._id : null;
  const userName = storedUser ? storedUser.name : 'Citizen';

  useEffect(() => {
    if (!userId) navigate('/login');
    else {
      fetchAllTickets();
      fetchNotifications();
    }
    
    // Poll for new notifications every 15 seconds
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [userId, navigate]);

  const fetchAllTickets = async () => {
    try {
      const response = await axios.get(`https://cityfix-backend-2c0d.onrender.com/api/tickets`);
      setTickets(response.data);
    } catch (error) { console.error("Error fetching tickets", error); }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`https://cityfix-backend-2c0d.onrender.com/api/system/notifications/${userId}`);
      setNotifications(response.data);
    } catch (error) { console.error("Error fetching notifications", error); }
  };

  const markNotificationRead = async (id) => {
    try {
      await axios.put(`https://cityfix-backend-2c0d.onrender.com/api/system/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) { console.error("Error marking read", error); }
  };

  const handleUpvote = async (ticketId) => {
    try {
      await axios.put(`https://cityfix-backend-2c0d.onrender.com/api/tickets/${ticketId}/upvote`, { userId });
      fetchAllTickets();
    } catch (error) { console.error("Error upvoting", error); }
  };

  const handleCommentSubmit = async (ticketId) => {
    if (!commentText[ticketId]) return;
    try {
      await axios.post(`https://cityfix-backend-2c0d.onrender.com/api/tickets/${ticketId}/comments`, {
        senderName: userName,
        text: commentText[ticketId]
      });
      setCommentText({ ...commentText, [ticketId]: '' }); 
      fetchAllTickets(); 
    } catch (error) { console.error("Error posting comment", error); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('location', location);
    formData.append('wardNumber', wardNumber);
    formData.append('category', category);
    formData.append('severity', severity);
    formData.append('userId', userId);
    if (image) formData.append('image', image);

    try {
      const response = await axios.post('https://cityfix-backend-2c0d.onrender.com/api/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setMessage(response.data.message || '✅ Issue Reported Successfully!');
      fetchAllTickets();
      setTitle(''); setDescription(''); setLocation(''); setWardNumber(''); setImage(null);
      setActiveTab('MyReports'); 
    } catch (error) { setMessage('❌ Failed to report issue.'); }
  };

  const handleRateTicket = async (ticketId, rating) => {
    try {
      await axios.put(`https://cityfix-backend-2c0d.onrender.com/api/tickets/${ticketId}/rate`, { rating });
      fetchAllTickets(); 
    } catch (error) { alert(error.response?.data?.message || 'Failed to submit rating.'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const displayedTickets = tickets.filter(ticket => {
    if (activeTab === 'CityFeed') return true;
    if (activeTab === 'MyNeighborhood') return ticket.wardNumber === subscribedWard;
    if (activeTab === 'MyReports') return ticket.user === userId;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ padding: '20px', fontFamily: 'Segoe UI', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* HEADER WITH NOTIFICATION BELL */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', position: 'relative' }}>
          <h2 style={{ color: '#2c3e50', margin: 0 }}>CityFix Community</h2>
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotifications(!showNotifications)}>
              <span style={{ fontSize: '1.5rem' }}>🔔</span>
              {unreadCount > 0 && <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#e74c3c', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold' }}>{unreadCount}</span>}
            </div>
            <button onClick={handleLogout} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
          </div>

          {/* NOTIFICATION DROPDOWN */}
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

        {/* Create Ticket Form */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
          <h4 style={{ marginBottom: '15px', color: '#34495e' }}>Report a New Issue</h4>
          
          {message && (
            <div style={{ marginBottom: '15px', padding: '12px', backgroundColor: message.includes('⚠️') ? '#fcf3cf' : (message.includes('❌') ? '#fdeder' : '#e8f8f5'), color: message.includes('⚠️') ? '#d4ac0d' : (message.includes('❌') ? '#e74c3c' : '#1abc9c'), border: `1px solid ${message.includes('⚠️') ? '#f1c40f' : 'transparent'}`, borderRadius: '6px', textAlign: 'center', fontWeight: 'bold' }}>
              {message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="text" placeholder="Issue Title (e.g., Deep Pothole on Main St)" value={title} onChange={e => setTitle(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7' }} />
            <textarea placeholder="Description of the problem..." value={description} onChange={e => setDescription(e.target.value)} required rows="3" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7', resize: 'none' }}></textarea>
            
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <input type="text" placeholder="Location/Address" value={location} onChange={e => setLocation(e.target.value)} required style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7' }} />
              <input type="number" placeholder="Ward No." value={wardNumber} onChange={e => setWardNumber(e.target.value)} required style={{ width: '100px', padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7' }} />
            </div>

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <select value={category} onChange={e => setCategory(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7' }}>
                <option value="Roads">Roads & Potholes</option>
                <option value="Lighting">Street Lighting</option>
                <option value="Sanitation">Sanitation & Garbage</option>
                <option value="Water">Water Leakage</option>
              </select>
              <select value={severity} onChange={e => setSeverity(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7' }}>
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#7f8c8d' }}>Upload Photo Evidence</label>
              <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} style={{ display: 'block', marginTop: '5px' }} />
            </div>

            <button type="submit" style={{ background: '#00b09b', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>Submit Report</button>
          </form>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => setActiveTab('CityFeed')} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', backgroundColor: activeTab === 'CityFeed' ? '#3498db' : '#ecf0f1', color: activeTab === 'CityFeed' ? 'white' : '#7f8c8d', transition: '0.2s' }}>🌍 Global City Feed</button>
          <button onClick={() => setActiveTab('MyNeighborhood')} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', backgroundColor: activeTab === 'MyNeighborhood' ? '#9b59b6' : '#ecf0f1', color: activeTab === 'MyNeighborhood' ? 'white' : '#7f8c8d', transition: '0.2s' }}>📍 My Neighborhood</button>
          <button onClick={() => setActiveTab('MyReports')} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', backgroundColor: activeTab === 'MyReports' ? '#e67e22' : '#ecf0f1', color: activeTab === 'MyReports' ? 'white' : '#7f8c8d', transition: '0.2s' }}>👤 My Reports</button>
        </div>

        {activeTab === 'MyNeighborhood' && (
          <div style={{ background: '#f9edfce6', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e8daef', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontWeight: 'bold', color: '#8e44ad' }}>Subscribed Ward:</span>
            <input type="number" value={subscribedWard} onChange={(e) => setSubscribedWard(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d7bde2', width: '80px', fontWeight: 'bold', color: '#8e44ad' }} min="1"/>
            <span style={{ fontSize: '0.85rem', color: '#9b59b6' }}>You are viewing issues specifically for Ward {subscribedWard}.</span>
          </div>
        )}

        {/* Ticket Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {displayedTickets.map(ticket => {
            const hasUpvoted = ticket.upvotedBy?.includes(userId);
            return (
              <div key={ticket._id} style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: `6px solid ${ticket.status === 'Resolved' ? '#2ecc71' : (ticket.status === 'In Progress' ? '#f1c40f' : (ticket.status === 'Assigned' ? '#3498db' : '#e74c3c'))}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <h4 style={{ margin: 0, color: '#2c3e50', fontSize: '1.2rem' }}>
                    {ticket.title} {ticket.severity === 'High' && <span style={{ marginLeft: '10px', fontSize: '0.8rem', backgroundColor: '#e74c3c', color: 'white', padding: '3px 8px', borderRadius: '12px' }}>High Priority 🔥</span>}
                  </h4>
                  <span style={{ backgroundColor: ticket.status === 'Resolved' ? '#e8f8f5' : (ticket.status === 'Assigned' ? '#eaf2f8' : '#fef9e7'), color: ticket.status === 'Resolved' ? '#27ae60' : (ticket.status === 'Assigned' ? '#2980b9' : '#f39c12'), padding: '5px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>{ticket.status}</span>
                </div>
                {ticket.imageUrl && <img src={ticket.imageUrl} alt="Issue" style={{ width: '100%', maxWidth: '300px', borderRadius: '8px', marginBottom: '15px', objectFit: 'cover' }} />}
                <p style={{ color: '#7f8c8d', fontSize: '0.9rem', margin: '0 0 10px 0' }}>{ticket.description}</p>
                
                <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '15px', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '6px', border: '1px solid #eee' }}>
                  <div>📍 {ticket.location} (Ward {ticket.wardNumber}) | 🏷️ {ticket.category}</div>
                  <div style={{ marginTop: '5px' }}>👷 <strong>Dispatched To:</strong> <span style={{ color: ticket.assignedWorkerName !== 'Unassigned' ? '#2980b9' : '#e74c3c', fontWeight: 'bold' }}>{ticket.assignedWorkerName || 'Unassigned'}</span></div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid #eee', paddingTop: '15px', paddingBottom: '15px' }}>
                  {ticket.status !== 'Resolved' ? (
                    <button onClick={() => handleUpvote(ticket._id)} style={{ background: hasUpvoted ? '#00b09b' : '#ecf0f1', color: hasUpvoted ? 'white' : '#2c3e50', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                      {hasUpvoted ? '✅ Voted' : '👍 Upvote'}
                    </button>
                  ) : (
                    <span style={{ padding: '8px 12px', background: '#ecf0f1', color: '#95a5a6', borderRadius: '6px', fontWeight: 'bold', cursor: 'not-allowed', fontSize: '0.9rem' }}>🔒 Resolved (Voting Closed)</span>
                  )}
                  <span style={{ color: '#2c3e50', fontWeight: 'bold' }}>{ticket.upvotedBy?.length || 0} Votes</span>
                </div>

                {ticket.status === 'Resolved' && !ticket.resolutionRating && (
                  <div style={{ marginTop: '15px', padding: '15px', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffe69c', marginBottom: '15px' }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.95rem', fontWeight: 'bold', color: '#664d03' }}>🛠️ Repair Complete! Please rate the worker's job:</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => handleRateTicket(ticket._id, star)} style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.8rem' }}>⭐</button>
                      ))}
                    </div>
                  </div>
                )}
                {ticket.status === 'Resolved' && ticket.resolutionRating && (
                  <div style={{ marginTop: '15px', padding: '10px', background: '#d1e7dd', borderRadius: '8px', border: '1px solid #badbcc', fontWeight: 'bold', color: '#0f5132', marginBottom: '15px' }}>✅ Citizen Rating: {ticket.resolutionRating} / 5 ⭐</div>
                )}

                <div style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '15px' }}>
                  <h6 style={{ margin: '0 0 10px 0', color: '#34495e' }}>💬 Discussion Thread</h6>
                  <div style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '10px' }}>
                    {ticket.comments && ticket.comments.map((c, i) => (
                      <div key={i} style={{ marginBottom: '8px', fontSize: '0.85rem' }}>
                        <strong style={{ color: c.senderName.includes('Worker') ? '#e67e22' : '#2980b9' }}>{c.senderName}: </strong>
                        <span style={{ color: '#2c3e50' }}>{c.text}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" placeholder="Add a comment..." value={commentText[ticket._id] || ''} onChange={e => setCommentText({ ...commentText, [ticket._id]: e.target.value })} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #bdc3c7', fontSize: '0.85rem' }} onKeyDown={e => e.key === 'Enter' && handleCommentSubmit(ticket._id)} />
                    <button onClick={() => handleCommentSubmit(ticket._id)} style={{ background: '#3498db', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>Post</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
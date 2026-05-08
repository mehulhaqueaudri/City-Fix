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
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [userId, navigate]);

  const fetchAllTickets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tickets');
      setTickets(response.data);
    } catch (error) { console.error(error); }
  };

  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/system/notifications/${userId}`);
      setNotifications(res.data);
    } catch (err) { console.error(err); }
  };

  const markNotificationAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/system/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('location', location);
      formData.append('wardNumber', wardNumber);
      formData.append('category', category);
      formData.append('severity', severity);
      formData.append('userId', userId);
      
      if (image) { formData.append('image', image); }

      const response = await axios.post('http://localhost:5000/api/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage(response.data?.message ? `✅ ${response.data.message}` : '✅ Report submitted successfully!');
      setTitle(''); setDescription(''); setLocation(''); setWardNumber(''); setCategory('Roads'); setSeverity('Low'); setImage(null);
      fetchAllTickets();
    } catch (error) { setMessage('❌ Failed to submit report'); }
  };

  const handleUpvote = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/tickets/${id}/upvote`, { userId });
      fetchAllTickets();
    } catch (error) { console.error(error); }
  };

  const handleCommentSubmit = async (ticketId) => {
    if (!commentText[ticketId]) return;
    try {
      await axios.post(`http://localhost:5000/api/tickets/${ticketId}/comments`, { 
          senderName: userName,
          senderId: userId,
          text: commentText[ticketId] 
      });
      setCommentText({ ...commentText, [ticketId]: '' });
      fetchAllTickets();
    } catch (error) { console.error(error); }
  };

  const handleRateTicket = async (ticketId, rating) => {
    try {
      await axios.put(`http://localhost:5000/api/tickets/${ticketId}/rate`, { rating, userId });
      setMessage('✅ Rating submitted successfully!');
      fetchAllTickets();
    } catch (error) {
      setMessage(error.response?.data?.message ? `❌ ${error.response.data.message}` : '❌ Failed to submit rating');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const myTickets = tickets.filter(t => t.user === userId);
  const activeTickets = tickets.filter(t => t.status !== 'Resolved');

  // 🌟 NEW LOGIC: Real-time mathematical scoring for perfect sorting (ignores old database values)
  const getScore = (t) => {
    let score = 20; // Default Low
    if (t.severity === 'Medium') score = 30;
    if (t.severity === 'High') score = 40;
    score += (t.upvotedBy?.length || 0) * 10; // +10 per upvote
    return score;
  };

  const sortedActiveTickets = [...activeTickets].sort((a, b) => getScore(b) - getScore(a));
  const sortedMyTickets = [...myTickets].sort((a, b) => getScore(b) - getScore(a));

  const visibleTickets = activeTab === 'MyTickets' 
    ? sortedMyTickets 
    : (activeTab === 'WardFeed' 
        ? sortedActiveTickets.filter(t => t.wardNumber === subscribedWard) 
        : sortedActiveTickets);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2c3e50', padding: '20px', borderRadius: '12px', color: 'white', marginBottom: '30px' }}>
          <div>
            <h2 style={{ margin: 0 }}>CityFix Dashboard</h2>
            <p style={{ margin: '5px 0 0 0', color: '#bdc3c7' }}>Welcome, {userName}</p>
          </div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotifications(!showNotifications)}>
              <span style={{ fontSize: '1.5rem' }}>🔔</span>
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#e74c3c', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                  {unreadCount}
                </span>
              )}
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
            <button onClick={handleLogout} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
          </div>
        </div>

        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
          <h3 style={{ color: '#34495e', marginBottom: '20px' }}>Report an Issue</h3>
          {message && <div style={{ padding: '10px', background: message.includes('❌') ? '#fdeded' : '#e8f8f5', color: message.includes('❌') ? '#e74c3c' : '#2ecc71', borderRadius: '6px', marginBottom: '20px', fontWeight: 'bold' }}>{message}</div>}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="text" placeholder="Issue Title (e.g., Deep Pothole)" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #bdc3c7' }} />
            <textarea placeholder="Describe the issue in detail..." value={description} onChange={(e) => setDescription(e.target.value)} required rows="3" style={{ padding: '12px', borderRadius: '6px', border: '1px solid #bdc3c7' }} />
            <input type="text" placeholder="Exact Location / Landmark" value={location} onChange={(e) => setLocation(e.target.value)} required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #bdc3c7' }} />
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <select value={wardNumber} onChange={(e) => setWardNumber(e.target.value)} required style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #bdc3c7' }}>
                <option value="">Select Ward Number</option>
                {[...Array(54).keys()].map(i => <option key={i+1} value={i+1}>Ward {i+1}</option>)}
              </select>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #bdc3c7' }}>
                <option value="Roads">Roads & Transport</option>
                <option value="Water">Water & Sewage</option>
                <option value="Lighting">Street Lighting</option>
                <option value="Waste">Waste Management</option>
              </select>
              <select value={severity} onChange={(e) => setSeverity(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #bdc3c7' }}>
                <option value="Low">Low Severity</option>
                <option value="Medium">Medium Severity</option>
                <option value="High">High Severity</option>
              </select>
            </div>
            
            <input type="file" onChange={(e) => setImage(e.target.files[0])} accept="image/*" style={{ padding: '10px' }} />
            
            <button type="submit" style={{ background: '#2ecc71', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
              Submit Report
            </button>
          </form>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => setActiveTab('CityFeed')} style={{ flex: 1, padding: '12px', background: activeTab === 'CityFeed' ? '#3498db' : '#ecf0f1', color: activeTab === 'CityFeed' ? 'white' : '#7f8c8d', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Global City Feed</button>
          <button onClick={() => setActiveTab('WardFeed')} style={{ flex: 1, padding: '12px', background: activeTab === 'WardFeed' ? '#3498db' : '#ecf0f1', color: activeTab === 'WardFeed' ? 'white' : '#7f8c8d', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>My Neighborhood (Ward Feed)</button>
          <button onClick={() => setActiveTab('MyTickets')} style={{ flex: 1, padding: '12px', background: activeTab === 'MyTickets' ? '#3498db' : '#ecf0f1', color: activeTab === 'MyTickets' ? 'white' : '#7f8c8d', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>My Reports</button>
        </div>

        {activeTab === 'WardFeed' && (
          <div style={{ background: '#eaf2f8', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <strong style={{ color: '#2980b9' }}>Filter by Ward:</strong>
            <select value={subscribedWard} onChange={(e) => setSubscribedWard(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #3498db' }}>
              {[...Array(54).keys()].map(i => <option key={i+1} value={i+1}>Ward {i+1}</option>)}
            </select>
          </div>
        )}

        <div>
          {visibleTickets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d', background: 'white', borderRadius: '12px' }}>No reports found for this view.</div>
          ) : (
            visibleTickets.map(ticket => (
              <div key={ticket._id} style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: 0, color: '#2c3e50', fontSize: '1.2rem' }}>{ticket.title}</h4>
                    <div style={{ fontSize: '0.85rem', marginTop: '5px', color: '#7f8c8d' }}>📍 Ward {ticket.wardNumber} | 🚨 {ticket.severity} Priority</div>
                  </div>
                  
                  {/* Rank badge has been successfully removed! */}
                </div>

                <p style={{ color: '#7f8c8d', fontSize: '0.9rem', marginBottom: '15px', marginTop: '15px' }}>{ticket.description}</p>
                
                {ticket.imageUrl && (
                  <img src={ticket.imageUrl} alt="Evidence" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', border: '1px solid #bdc3c7', marginBottom: '15px', objectFit: 'cover' }} />
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                  <button onClick={() => handleUpvote(ticket._id)} disabled={ticket.upvotedBy.includes(userId)} style={{ background: ticket.upvotedBy.includes(userId) ? '#ecf0f1' : '#3498db', color: ticket.upvotedBy.includes(userId) ? '#bdc3c7' : 'white', border: 'none', padding: '8px 15px', borderRadius: '20px', cursor: ticket.upvotedBy.includes(userId) ? 'default' : 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>
                    👍 {ticket.upvotedBy.length} Upvotes
                  </button>
                  <span style={{ padding: '8px 15px', background: ticket.status === 'Resolved' ? '#e8f8f5' : '#fef9e7', color: ticket.status === 'Resolved' ? '#2ecc71' : '#f1c40f', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    {ticket.status}
                  </span>
                </div>

                {activeTab === 'MyTickets' && ticket.status === 'Resolved' && ticket.user === userId && (
                  <div style={{ background: '#e8f8f5', padding: '15px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #2ecc71' }}>
                    <h6 style={{ margin: '0 0 10px 0', color: '#27ae60' }}>⭐ Rate the completed repair</h6>
                    <p style={{ margin: '0 0 10px 0', color: '#7f8c8d', fontSize: '0.85rem' }}>Your rating will be counted in the worker leaderboard.</p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => handleRateTicket(ticket._id, star)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1.6rem',
                            color: ticket.resolutionRating >= star ? '#f1c40f' : '#bdc3c7',
                            padding: '0 2px'
                          }}
                          title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                        >
                          ★
                        </button>
                      ))}
                      <span style={{ color: '#34495e', fontWeight: 'bold', marginLeft: '8px' }}>
                        {ticket.resolutionRating ? `${ticket.resolutionRating}/5` : 'Not rated yet'}
                      </span>
                    </div>
                  </div>
                )}

                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #3498db' }}>
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
                    <button onClick={() => handleCommentSubmit(ticket._id)} style={{ background: '#3498db', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Post</button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
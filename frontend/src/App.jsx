import { useEffect, useState } from 'react';

function App() {
  const [tickets, setTickets] = useState([]);
  const [formData, setFormData] = useState({ category: '', description: '', severity: 'Medium', location: '' });

  const fetchTickets = () => {
    fetch('http://localhost:5000/api/tickets')
      .then(res => res.json())
      .then(data => setTickets(data))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    setFormData({ category: '', description: '', severity: 'Medium', location: '' });
    fetchTickets();
  };

  const deleteTicket = async (id) => {
    await fetch(`http://localhost:5000/api/tickets/${id}`, { method: 'DELETE' });
    fetchTickets(); // Refresh the list after deleting
  };

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: 'auto', fontFamily: 'Arial', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>🛠️ City-Fix Admin Portal</h1>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0 }}>Report New Issue</h3>
        <input style={{ display: 'block', width: '96%', padding: '10px', marginBottom: '10px' }} placeholder="Category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
        <textarea style={{ display: 'block', width: '96%', padding: '10px', marginBottom: '10px' }} placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
        <input style={{ display: 'block', width: '96%', padding: '10px', marginBottom: '10px' }} placeholder="Location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
        <select style={{ display: 'block', padding: '10px', width: '100%', marginBottom: '15px' }} value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})}>
          <option value="Low">Low (Minor Issue)</option>
          <option value="Medium">Medium (Needs Attention)</option>
          <option value="High">High (Emergency)</option>
        </select>
        <button type="submit" style={{ width: '100%', backgroundColor: '#28a745', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Submit Ticket</button>
      </form>

      <h2>Current Reports ({tickets.length})</h2>
      {tickets.map(ticket => (
        <div key={ticket._id} style={{ backgroundColor: 'white', border: '1px solid #eee', margin: '15px 0', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', position: 'relative' }}>
          <button onClick={() => deleteTicket(ticket._id)} style={{ position: 'absolute', top: '15px', right: '15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer' }}>Delete</button>
          <h3 style={{ margin: '0 0 10px 0', color: ticket.severity === 'High' ? '#d9534f' : '#333' }}>{ticket.category}</h3>
          <p style={{ color: '#666' }}>{ticket.description}</p>
          <div style={{ fontSize: '0.9rem', color: '#888' }}>📍 {ticket.location} | ⚠️ {ticket.severity}</div>
        </div>
      ))}
    </div>
  );
}

export default App;
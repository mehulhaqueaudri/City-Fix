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
    fetchTickets(); // Refresh the list
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto', fontFamily: 'Arial' }}>
      <h1>🛠️ City-Fix Issue Tracker</h1>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>Submit New Ticket</h3>
        <input style={{ display: 'block', width: '100%', marginBottom: '10px' }} placeholder="Category (e.g. Pothole)" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
        <textarea style={{ display: 'block', width: '100%', marginBottom: '10px' }} placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
        <input style={{ display: 'block', width: '100%', marginBottom: '10px' }} placeholder="Location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
        <select style={{ display: 'block', marginBottom: '10px' }} value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <button type="submit" style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>Submit Ticket</button>
      </form>

      <h2>Active Tickets</h2>
      {tickets.map(ticket => (
        <div key={ticket._id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '15px', borderRadius: '8px' }}>
          <strong>{ticket.category}</strong> - {ticket.severity}
          <p>{ticket.description}</p>
          <small>Location: {ticket.location}</small>
        </div>
      ))}
    </div>
  );
}

export default App;
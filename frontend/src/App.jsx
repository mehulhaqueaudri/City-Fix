import { useEffect, useState } from 'react';

function App() {
  const [tickets, setTickets] = useState([]);

  // This talks to the backend server you built!
  useEffect(() => {
    fetch('http://localhost:5000/api/tickets')
      .then(res => res.json())
      .then(data => setTickets(data))
      .catch(err => console.error("Error fetching tickets:", err));
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🛠️ City-Fix Issue Tracker</h1>
      
      {tickets.length === 0 ? (
        <p>No tickets found yet. (Is your backend server running?)</p>
      ) : (
        tickets.map(ticket => (
          <div key={ticket._id} style={{ border: '1px solid #ccc', margin: '15px 0', padding: '15px', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>{ticket.category}</h3>
            <p style={{ margin: '0 0 10px 0' }}>{ticket.description}</p>
            <span style={{ backgroundColor: '#eee', padding: '5px 10px', borderRadius: '5px', marginRight: '10px' }}>
              Status: <strong>{ticket.status}</strong>
            </span>
            <span style={{ backgroundColor: '#ffd700', padding: '5px 10px', borderRadius: '5px' }}>
              Severity: <strong>{ticket.severity}</strong>
            </span>
          </div>
        ))
      )}
    </div>
  );
}

export default App;
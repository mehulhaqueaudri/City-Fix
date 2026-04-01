import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// ==========================================
// 🧑‍💻 MEMBER 3: Shared Navbar Component
// ==========================================
const Navbar = () => (
  <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
    <div className="container">
      <Link className="navbar-brand" to="/">🛠️ CityFix</Link>
      <div className="navbar-nav">
        <Link className="nav-link" to="/">Report Issue</Link>
        <Link className="nav-link" to="/dashboard">Dashboard</Link>
        <Link className="nav-link" to="/login">Login</Link>
      </div>
    </div>
  </nav>
);

// ==========================================
// 🧑‍💻 MEMBER 3: Citizen "Report Issue" Form
// ==========================================
const ReportIssue = ({ fetchTickets }) => {
  const [formData, setFormData] = useState({ category: '', description: '', severity: 'Medium', location: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    setFormData({ category: '', description: '', severity: 'Medium', location: '' });
    fetchTickets();
    alert("Ticket Submitted Successfully!");
  };

  return (
    <div className="card shadow-sm p-4 mx-auto" style={{ maxWidth: '600px' }}>
      <h3 className="mb-3">Report a New Issue</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input className="form-control" placeholder="Category (e.g. Pothole)" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
        </div>
        <div className="mb-3">
          <textarea className="form-control" placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
        </div>
        <div className="mb-3">
          <input className="form-control" placeholder="Location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
        </div>
        <div className="mb-3">
          <select className="form-select" value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <button type="submit" className="btn btn-success w-100">Submit Ticket</button>
      </form>
    </div>
  );
};

// ==========================================
// 🧑‍💻 MEMBER 4: Dispatcher Dashboard (Cards & Table)
// ==========================================
const Dashboard = ({ tickets }) => {
  const openCount = tickets.length; // Simplified for this sprint

  return (
    <div>
      <h2 className="mb-4">Dispatcher Dashboard</h2>
      
      {/* M4: Status Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-white bg-primary mb-3 text-center">
            <div className="card-body">
              <h5 className="card-title">Open Tickets</h5>
              <h2>{openCount}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-warning mb-3 text-center">
            <div className="card-body">
              <h5 className="card-title">In Progress</h5>
              <h2>0</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-success mb-3 text-center">
            <div className="card-body">
              <h5 className="card-title">Resolved</h5>
              <h2>0</h2>
            </div>
          </div>
        </div>
      </div>

      {/* M4: Dashboard Table */}
      <div className="card shadow-sm">
        <div className="card-body">
          <table className="table table-hover">
            <thead className="table-dark">
              <tr>
                <th>Category</th>
                <th>Location</th>
                <th>Severity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? <tr><td colSpan="4" className="text-center">No tickets found</td></tr> : 
                tickets.map(ticket => (
                  <tr key={ticket._id}>
                    <td>{ticket.category}</td>
                    <td>{ticket.location}</td>
                    <td><span className={`badge bg-${ticket.severity === 'High' ? 'danger' : 'secondary'}`}>{ticket.severity}</span></td>
                    <td>Open</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🧑‍💻 MEMBER 5: Login/Signup UI
// ==========================================
const AuthUI = () => (
  <div className="card shadow-sm p-4 mx-auto" style={{ maxWidth: '400px' }}>
    <h3 className="text-center mb-3">Login</h3>
    <div className="mb-3">
      <input type="email" className="form-control" placeholder="Email Address" />
    </div>
    <div className="mb-3">
      <input type="password" className="form-control" placeholder="Password" />
    </div>
    <button className="btn btn-primary w-100 mb-2">Login</button>
    <div className="text-center">
      <small>Don't have an account? <a href="#signup">Sign up</a></small>
    </div>
  </div>
);

// ==========================================
// 🧑‍💻 MEMBER 5: React Router Setup (Main Component)
// ==========================================
function App() {
  const [tickets, setTickets] = useState([]);

  const fetchTickets = () => {
    fetch('http://localhost:5000/api/tickets')
      .then(res => res.json())
      .then(data => setTickets(data))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchTickets(); }, []);

  return (
    <Router>
      <div className="bg-light min-vh-100 pb-5">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<ReportIssue fetchTickets={fetchTickets} />} />
            <Route path="/dashboard" element={<Dashboard tickets={tickets} />} />
            <Route path="/login" element={<AuthUI />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [wardNumber, setWardNumber] = useState("");
  const [category, setCategory] = useState('Roads');
  const [severity, setSeverity] = useState('Low');
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState('CityFeed');
  const [subscribedWard, setSubscribedWard] = useState('1');

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const userld = storedUser ? storedUser._id : null;

  const fetchAllTickets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tickets');
      setTickets(response.data);
    } catch (error) {
      console.error(error);
    }
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
      formData.append('userld', userld);
      if (image) {
        formData.append('image', image);
      }

      const response = await axios.post('http://localhost:5000/api/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage(response.data?.message ? `${response.data.message}` : 'Report submitted successfully!');
      
      setTitle("");
      setDescription("");
      setLocation("");
      setWardNumber("");
      setCategory('Roads');
      setSeverity('Low');
      setImage(null);
      fetchAllTickets();
    } catch (error) {
      setMessage('X Failed to submit report');
    }
  };

  const handleUpvote = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/tickets/${id}/upvote`, { userld });
      fetchAllTickets();
    } catch (error) {
      console.error(error);
    }
  };

  const activeTickets = tickets.filter(t => t.status !== 'Resolved');
  
  const getScore = (t) => {
    let score = 20;
    if (t.severity === 'Medium') score = 30;
    if (t.severity === 'High') score = 40;
    score += (t.upvotedBy?.length || 0) * 10;
    return score;
  };

  const sortedActiveTickets = [...activeTickets].sort((a, b) => getScore(b) - getScore(a));

  const visibleTickets = activeTab === 'WardFeed'
    ? sortedActiveTickets.filter(t => t.wardNumber === subscribedWard)
    : sortedActiveTickets;

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Issue Title (e.g., Deep Pothole)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Describe the issue in detail..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Exact Location / Landmark"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        <select value={wardNumber} onChange={(e) => setWardNumber(e.target.value)} required>
          <option value="">Select Ward Number</option>
          {[...Array(54).keys()].map(i => (
            <option key={i + 1} value={i + 1}>Ward {i + 1}</option>
          ))}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="Roads">Roads & Transport</option>
          <option value="Water">Water & Sewage</option>
          <option value="Lighting">Street Lighting</option>
          <option value="Waste">Waste Management</option>
        </select>
        <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="Low">Low Severity</option>
          <option value="Medium">Medium Severity</option>
          <option value="High">High Severity</option>
        </select>
        <input type="file" onChange={(e) => setImage(e.target.files[0])} accept="image/*" />
        <button type="submit">Submit Report</button>
      </form>

      <div>
        <button onClick={() => setActiveTab('CityFeed')}>Global City Feed</button>
        <button onClick={() => setActiveTab('WardFeed')}>My Neighborhood (Ward Feed)</button>
      </div>

      {activeTab === 'WardFeed' && (
        <select value={subscribedWard} onChange={(e) => setSubscribedWard(e.target.value)}>
          {[...Array(54).keys()].map(i => (
            <option key={i + 1} value={i + 1}>Ward {i + 1}</option>
          ))}
        </select>
      )}

      {visibleTickets.map(ticket => (
        <div key={ticket._id}>
          <h4>{ticket.title}</h4>
          <div>Ward {ticket.wardNumber} | {ticket.severity} Priority</div>
          <p>{ticket.description}</p>
          <button onClick={() => handleUpvote(ticket._id)} disabled={ticket.upvotedBy.includes(userld)}>
            {ticket.upvotedBy.length} Upvotes
          </button>
          <span>{ticket.status}</span>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: 0,
    unit: 'bags',
    costPerUnit: 0
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/inventory');
      setInventory(response.data);
    } catch (error) {
      console.error("Error fetching inventory", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/inventory', formData);
      setMessage('✅ Material added to warehouse!');
      setFormData({ itemName: '', quantity: 0, unit: 'bags', costPerUnit: 0 }); // reset form
      fetchInventory(); // refresh list
    } catch (error) {
      setMessage('❌ Failed to add material. It might already exist.');
    }
  };

  // 🌟 FEATURE 14: Save custom threshold when Admin types it
  const handleThresholdUpdate = async (id, newThreshold) => {
    try {
      await axios.put(`http://localhost:5000/api/inventory/${id}/threshold`, { alarmThreshold: newThreshold });
      // Update local state so the red border applies instantly without reloading the page
      setInventory(inventory.map(item => item._id === id ? { ...item, alarmThreshold: newThreshold } : item));
    } catch (error) {
      console.error("Error updating threshold", error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Segoe UI', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#2c3e50', margin: 0 }}>City Warehouse & Inventory</h2>
          <Link to="/" style={{ textDecoration: 'none', color: '#3498db', fontWeight: 'bold' }}>🏠 Back to Home</Link>
        </div>

        {/* Add Material Form */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
          <h4 style={{ marginBottom: '15px', color: '#34495e' }}>Add New Material</h4>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
            
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px', color: '#7f8c8d' }}>Item Name</label>
              <input type="text" name="itemName" value={formData.itemName} onChange={handleChange} required placeholder="e.g. Asphalt" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7' }} />
            </div>
            
            <div style={{ flex: '1 1 100px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px', color: '#7f8c8d' }}>Quantity</label>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required min="0" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7' }} />
            </div>
            
            <div style={{ flex: '1 1 100px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px', color: '#7f8c8d' }}>Unit Measure</label>
              <select name="unit" value={formData.unit} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7' }}>
                <option value="bags">Bags</option>
                <option value="bulbs">Bulbs</option>
                <option value="gallons">Gallons</option>
                <option value="meters">Meters</option>
                <option value="units">Units</option>
              </select>
            </div>
            
            <div style={{ flex: '1 1 120px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px', color: '#7f8c8d' }}>Cost Per Unit (BDT)</label>
              <input type="number" name="costPerUnit" value={formData.costPerUnit} onChange={handleChange} required min="0" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7' }} />
            </div>
            
            <div style={{ flex: '1 1 100%', marginTop: '10px' }}>
              <button type="submit" style={{ width: '100%', background: '#00b09b', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>
                + Add to Warehouse
              </button>
            </div>

          </form>
          {message && <div style={{ marginTop: '15px', padding: '10px', backgroundColor: message.includes('✅') ? '#e8f8f5' : '#fdeder', color: message.includes('✅') ? '#1abc9c' : '#e74c3c', borderRadius: '6px', textAlign: 'center', fontWeight: 'bold' }}>{message}</div>}
        </div>

        {/* Current Stock Table */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h4 style={{ marginBottom: '15px', color: '#34495e' }}>Current Stock Levels</h4>
          {inventory.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#95a5a6', fontStyle: 'italic' }}>Warehouse is currently empty.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                    <th style={{ padding: '12px', color: '#2c3e50' }}>Item</th>
                    <th style={{ padding: '12px', color: '#2c3e50' }}>Quantity</th>
                    <th style={{ padding: '12px', color: '#2c3e50' }}>Alarm Threshold</th> {/* 🌟 NEW */}
                    <th style={{ padding: '12px', color: '#2c3e50' }}>Unit Cost</th>
                    <th style={{ padding: '12px', color: '#2c3e50' }}>Total Asset Value</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(item => {
                    // 🌟 FEATURE 14: Check threshold logic
                    const threshold = item.alarmThreshold !== undefined ? item.alarmThreshold : 10;
                    const isLowStock = item.quantity <= threshold;

                    return (
                    <tr key={item._id} style={{ 
                        borderBottom: isLowStock ? '2px solid #e74c3c' : '1px solid #eee',
                        backgroundColor: isLowStock ? '#fff5f5' : 'transparent'
                      }}>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#34495e' }}>{item.itemName}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          backgroundColor: isLowStock ? '#ffdede' : '#e8f8f5', 
                          color: isLowStock ? '#e74c3c' : '#1abc9c', 
                          padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' 
                        }}>
                          {item.quantity} {item.unit}
                        </span>
                      </td>
                      {/* 🌟 NEW INPUT FOR THRESHOLD */}
                      <td style={{ padding: '12px' }}>
                        <input 
                          type="number" 
                          defaultValue={threshold}
                          onBlur={(e) => handleThresholdUpdate(item._id, e.target.value)}
                          title="Click away to save"
                          style={{ width: '70px', padding: '5px', borderRadius: '4px', border: '1px solid #bdc3c7', textAlign: 'center' }}
                        />
                      </td>
                      <td style={{ padding: '12px', color: '#7f8c8d' }}>৳{item.costPerUnit}</td>
                      <td style={{ padding: '12px', color: '#7f8c8d', fontWeight: 'bold' }}>৳{item.quantity * item.costPerUnit}</td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Inventory;
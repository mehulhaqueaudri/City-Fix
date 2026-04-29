import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '+8801',
    wardNumber: '1',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear any previous messages
    try {
      await axios.post('https://cityfix-backend-2c0d.onrender.com/api/auth/register', formData);
      
      // FIXED: Hardcoded success string so it no longer says 'undefined'
      setMessage("✅ Account created successfully! Redirecting to login...");
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      // FIXED: Safely grab the error message or provide a fallback
      setMessage("❌ " + (err.response?.data?.message || "Registration failed."));
    }
  };

  return (
    <>
      <style>
        {`
          .register-wrapper {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            
            /* Fallback color */
            background-color: #1a2a3a;
            
            /* The reliable way to stack a gradient over a local image */
            background-image: linear-gradient(to bottom, rgba(15, 32, 39, 0.7), rgba(32, 58, 67, 0.8), rgba(44, 83, 100, 0.9)), 
                              url('/register_bg.jpg');
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            background-repeat: no-repeat;
            
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20px;
          }

          /* The Sophisticated Glassmorphism Card */
          .glass-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 40px;
            width: 100%;
            max-width: 500px;
            box-shadow: 0 25px 45px rgba(0, 0, 0, 0.3);
            color: white;
            position: relative;
            overflow: hidden;
            border-top: 1px solid rgba(255, 255, 255, 0.3);
          }

          /* A subtle glowing light effect inside the card */
          .glass-card::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
            transform: rotate(30deg);
            pointer-events: none;
          }

          .glass-card h2 {
            font-weight: 700;
            margin-bottom: 5px;
            letter-spacing: 1px;
            text-align: center;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.6);
          }

          .glass-card p.subtitle {
            text-align: center;
            font-size: 0.95rem;
            color: #e0e0e0;
            margin-bottom: 30px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          }

          /* Modern Inputs */
          .glass-input {
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            color: white;
            padding: 12px 15px;
            transition: all 0.3s ease;
            width: 100%;
            text-align: left;
          }

          .glass-input::placeholder {
            color: rgba(255, 255, 255, 0.5);
          }

          .glass-input:focus {
            background: rgba(0, 0, 0, 0.4);
            border-color: #00e676;
            box-shadow: 0 0 12px rgba(0, 230, 118, 0.4);
            outline: none;
            color: white;
          }

          select.glass-input option {
            background: #1a2a3a;
            color: white;
          }

          .form-label {
            font-weight: 600;
            font-size: 0.85rem;
            margin-bottom: 8px;
            letter-spacing: 0.5px;
            color: #f1f1f1;
            text-transform: uppercase;
            text-align: left;
            width: 100%;
          }

          /* The Professionally Reacting Gradient Button */
          .gradient-btn {
            background: linear-gradient(135deg, #00c6af, #a8df45);
            border: none;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            font-size: 1rem;
            padding: 14px;
            width: 100%;
            margin-top: 25px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 176, 155, 0.3);
            text-transform: uppercase;
            letter-spacing: 1px;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
          }

          .gradient-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(0, 176, 155, 0.5);
            background: linear-gradient(135deg, #01dcc3, #bbec5a);
          }

          .gradient-btn:active {
            transform: translateY(1px);
            box-shadow: 0 2px 10px rgba(0, 176, 155, 0.3);
            background: linear-gradient(135deg, #00b09b, #96c93d);
          }
        `}
      </style>

      <div className="register-wrapper">
        <div className="glass-card">
          <h2>CityFix Dhaka</h2>
          <p className="subtitle">Nagorik Service Portal | Wards 1-54</p>

          <form onSubmit={handleSubmit}>
            
            <div className="mb-3 d-flex flex-column align-items-start">
              <label className="form-label">Full Name</label>
              <input type="text" name="name" className="glass-input" placeholder="e.g. Karim Rahman" onChange={handleChange} required />
            </div>

            <div className="mb-3 d-flex flex-column align-items-start">
              <label className="form-label">Email Address</label>
              <input type="email" name="email" className="glass-input" placeholder="karim@email.com" onChange={handleChange} required />
            </div>

            <div className="mb-3 d-flex flex-column align-items-start">
              <label className="form-label">Create Password</label>
              <input type="password" name="password" className="glass-input" placeholder="••••••••" onChange={handleChange} required />
            </div>

            <div className="mb-3 d-flex flex-column align-items-start">
              <label className="form-label">Phone Number (BD)</label>
              <input type="text" name="phone" className="glass-input" value={formData.phone} onChange={handleChange} required />
            </div>

            <div className="mb-4 d-flex flex-column align-items-start">
              <label className="form-label">Your Ward Number</label>
              <select name="wardNumber" className="glass-input" onChange={handleChange}>
                {[...Array(54).keys()].map(i => (
                  <option key={i+1} value={i+1}>Ward {i+1}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="gradient-btn">
              Create Citizen Account
            </button>

            {message && (
              <div className="mt-4 p-3 text-center rounded fw-bold" style={{ backgroundColor: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.3)', textShadow: 'none' }}>
                {message}
              </div>
            )}

            <div className="mt-4 text-center text-sm" style={{fontSize: '0.85rem', color: '#a0a0a0'}}>
              Already have an account? <a href="/login" style={{color: '#00e676', textDecoration: 'none'}}>Login</a>
            </div>

          </form>
        </div>
      </div>
    </>
  );
};

export default Register;
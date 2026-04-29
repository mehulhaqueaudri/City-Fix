import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const WorkerRegister = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [wardNumber, setWardNumber] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('https://cityfix-backend-2c0d.onrender.com/api/auth/worker/register', {
        name, email, password, wardNumber
      });

      localStorage.setItem('user', JSON.stringify(response.data));
      navigate('/worker'); // Send straight to Worker Dashboard
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <>
      <style>
        {`
          .worker-wrapper {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #1a2a3a;
            
            /* 🧠 CONNECTS TO worker_bg.jpg IN PUBLIC FOLDER */
            background-image: linear-gradient(to bottom, rgba(15, 32, 39, 0.7), rgba(32, 58, 67, 0.8), rgba(44, 83, 100, 0.9)), 
                              url('/worker_bg.jpg');
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            background-repeat: no-repeat;
            
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20px;
          }

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

          .glass-input {
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            color: white;
            padding: 12px 15px;
            transition: all 0.3s ease;
            width: 100%;
            text-align: left;
            box-sizing: border-box;
          }

          .glass-input::placeholder {
            color: rgba(255, 255, 255, 0.5);
          }

          .glass-input:focus {
            background: rgba(0, 0, 0, 0.4);
            border-color: #f39c12;
            box-shadow: 0 0 12px rgba(243, 156, 18, 0.4);
            outline: none;
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
            display: block;
          }

          /* Orange/Gold gradient for Workers */
          .gradient-btn-worker {
            background: linear-gradient(135deg, #f39c12, #e67e22);
            border: none;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            font-size: 1rem;
            padding: 14px;
            width: 100%;
            margin-top: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(230, 126, 34, 0.3);
            text-transform: uppercase;
            letter-spacing: 1px;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
          }

          .gradient-btn-worker:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(230, 126, 34, 0.5);
            background: linear-gradient(135deg, #f1c40f, #d35400);
          }
        `}
      </style>

      <div className="worker-wrapper">
        <div className="glass-card">
          <h2>Worker Registration</h2>
          <p className="subtitle">Join the CityFix Dispatch Fleet</p>

          {error && (
            <div className="mb-4 p-3 text-center rounded fw-bold" style={{ backgroundColor: 'rgba(231, 76, 60, 0.8)', border: '1px solid #c0392b' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="mb-3" style={{ marginBottom: '15px' }}>
              <label className="form-label">Full Name</label>
              <input type="text" placeholder="e.g. Kamal Hossain" className="glass-input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            
            <div className="mb-3" style={{ marginBottom: '15px' }}>
              <label className="form-label">Email Address</label>
              <input type="email" placeholder="kamal.worker@email.com" className="glass-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="mb-3" style={{ marginBottom: '15px' }}>
              <label className="form-label">Create Password</label>
              <input type="password" placeholder="••••••••" className="glass-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <div className="mb-4" style={{ marginBottom: '20px' }}>
              <label className="form-label">Assigned Ward Number</label>
              <input type="number" placeholder="e.g. 5" className="glass-input" value={wardNumber} onChange={(e) => setWardNumber(e.target.value)} required min="1" max="54" />
            </div>
            
            <button type="submit" className="gradient-btn-worker">
              Register as Worker
            </button>

            <div className="mt-4 text-center text-sm" style={{ marginTop: '20px', fontSize: '0.85rem', color: '#a0a0a0' }}>
              Already registered? <Link to="/login" style={{ color: '#f39c12', textDecoration: 'none', fontWeight: 'bold' }}>Go to Login</Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default WorkerRegister;
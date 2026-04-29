import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('user', JSON.stringify(response.data));
      if (response.data.role === 'worker') {
        navigate('/worker');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <>
      <style>
        {`
          .login-wrapper {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #1a2a3a;
            /* 🧠 CONNECTS TO login_bg.jpg IN PUBLIC FOLDER */
            background-image: linear-gradient(to bottom, rgba(15, 32, 39, 0.7), rgba(32, 58, 67, 0.8), rgba(44, 83, 100, 0.9)), 
                              url('/login_bg.jpg');
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
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
            max-width: 450px;
            box-shadow: 0 25px 45px rgba(0, 0, 0, 0.3);
            color: white;
            position: relative;
            border-top: 1px solid rgba(255, 255, 255, 0.3);
          }

          .glass-card h2 {
            font-weight: 700;
            margin-bottom: 5px;
            text-align: center;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.6);
          }

          .glass-input {
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            color: white;
            padding: 12px 15px;
            width: 100%;
            transition: all 0.3s ease;
          }
          .glass-input::placeholder { color: rgba(255, 255, 255, 0.5); }
          .glass-input:focus {
            background: rgba(0, 0, 0, 0.4);
            border-color: #3498db;
            box-shadow: 0 0 12px rgba(52, 152, 219, 0.4);
            outline: none;
          }

          .form-label {
            font-weight: 600;
            font-size: 0.85rem;
            margin-bottom: 8px;
            color: #f1f1f1;
            text-transform: uppercase;
            display: block;
          }

          .gradient-btn {
            background: linear-gradient(135deg, #3498db, #2980b9);
            border: none;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            padding: 14px;
            width: 100%;
            margin-top: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
          }
          .gradient-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(52, 152, 219, 0.5);
          }
        `}
      </style>

      <div className="login-wrapper">
        <div className="glass-card">
          <h2>Unified Login</h2>
          <p style={{ textAlign: 'center', fontSize: '0.95rem', color: '#e0e0e0', marginBottom: '30px' }}>Citizens & Workers login here.</p>
          
          {error && (
            <div className="p-3 mb-3 text-center rounded fw-bold" style={{ backgroundColor: 'rgba(231, 76, 60, 0.8)', border: '1px solid #c0392b' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label">Email Address</label>
              <input type="email" placeholder="e.g. rudro@gmail.com" className="glass-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input type="password" placeholder="••••••••" className="glass-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            
            <button type="submit" className="gradient-btn">
              Sign In to Account
            </button>

            <div className="mt-4 text-center" style={{ fontSize: '0.85rem', color: '#a0a0a0' }}>
              Need an account? <Link to="/" style={{ color: '#3498db', textDecoration: 'none', fontWeight: 'bold' }}>Go back to Welcome</Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Register from './pages/Register';
import WorkerRegister from './pages/WorkerRegister'; 
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; 
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard'; 

const Home = () => {
  const navigate = useNavigate();

  const handleAdminClick = () => {
    const password = prompt("Please enter the Mayor/Admin password:");
    if (password === 'admin') {
      navigate('/admin');
    } else if (password !== null) { 
      alert("Incorrect Password!");
    }
  };

  return (
    <>
      <style>
        {`
          .home-wrapper {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #1a2a3a;
            /* 🧠 CONNECTS TO welcome_bg.jpg IN PUBLIC FOLDER */
            background-image: linear-gradient(to bottom, rgba(15, 32, 39, 0.7), rgba(32, 58, 67, 0.8), rgba(44, 83, 100, 0.9)), 
                              url('/welcome_bg.jpg');
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
            max-width: 450px;
            box-shadow: 0 25px 45px rgba(0, 0, 0, 0.3);
            color: white;
            position: relative;
            overflow: hidden;
            border-top: 1px solid rgba(255, 255, 255, 0.3);
            text-align: center;
          }

          .gradient-btn {
            border: none;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            font-size: 1rem;
            padding: 14px;
            width: 100%;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-decoration: none;
            display: inline-block;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
          }

          .gradient-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
          }

          /* Button Colors */
          .btn-citizen { background: linear-gradient(135deg, #00c6af, #a8df45); }
          .btn-citizen:hover { background: linear-gradient(135deg, #01dcc3, #bbec5a); }
          
          .btn-worker { background: linear-gradient(135deg, #f39c12, #e67e22); }
          .btn-worker:hover { background: linear-gradient(135deg, #f1c40f, #d35400); }
          
          .btn-login { background: linear-gradient(135deg, #34495e, #2c3e50); }
          .btn-login:hover { background: linear-gradient(135deg, #2c3e50, #1a252f); }
          
          .btn-admin { background: linear-gradient(135deg, #9b59b6, #8e44ad); }
          .btn-admin:hover { background: linear-gradient(135deg, #8e44ad, #732d91); }
        `}
      </style>

      <div className="home-wrapper">
        <div className="glass-card">
          <h1 style={{ fontWeight: '700', textShadow: '2px 2px 4px rgba(0,0,0,0.6)', marginBottom: '5px' }}>
            CityFix Dhaka
          </h1>
          <p style={{ color: '#e0e0e0', marginBottom: '35px', fontSize: '0.95rem', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
            Nagorik Service Portal | Empowering Citizens & Workers
          </p>
          
          {/* 🧠 BUTTONS NOW STACKED IN A COLUMN */}
          <div className="d-flex flex-column gap-3">
            <Link to="/register" className="gradient-btn btn-citizen">
              Register as Citizen
            </Link>
            <Link to="/register-worker" className="gradient-btn btn-worker">
              Register as Worker
            </Link>
            <Link to="/login" className="gradient-btn btn-login">
              Unified Login
            </Link>
            <button onClick={handleAdminClick} className="gradient-btn btn-admin mt-2">
              Mayor / Admin View
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-worker" element={<WorkerRegister />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} /> 
        <Route path="/worker" element={<WorkerDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} /> 
      </Routes>
    </Router>
  );
}

export default App;
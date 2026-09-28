import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Lock, User, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please enter username and password');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/login', { username, password });
      login(res.data);
      toast.success(`Welcome, ${res.data.full_name}!`);
      if (res.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/results');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img
            src="https://srmmcet.edu.in/uploads/51ba570fe68fc088e0a942bdf8700cdce7eb8b1d/1775065128SRM-Madurai-College-for-Engineering-and-Technology-3.webp"
            alt="SRM MCET Logo"
            className="login-logo"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <h2>SRM MCET - ERP Login</h2>
          <p>Semester Results Module Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label><User size={16} className="inline mr-1" /> Username</label>
            <input
              type="text"
              placeholder="e.g. prof.kumar or admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label><KeyRound size={16} className="inline mr-1" /> Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Login to Portal'}
          </button>

          <div className="demo-credentials">
            <p className="font-semibold text-xs text-gray-600 mb-1">Demo Credentials:</p>
            <div className="text-xs text-gray-500 space-y-1">
              <div>👨‍🏫 Faculty (CSE): <code className="bg-gray-100 px-1 py-0.5 rounded">prof.kumar</code> / <code className="bg-gray-100 px-1 py-0.5 rounded">kumar123</code></div>
              <div>👨‍🏫 Faculty (IT): <code className="bg-gray-100 px-1 py-0.5 rounded">prof.meena</code> / <code className="bg-gray-100 px-1 py-0.5 rounded">meena123</code></div>
              <div>🛠️ Admin: <code className="bg-gray-100 px-1 py-0.5 rounded">admin</code> / <code className="bg-gray-100 px-1 py-0.5 rounded">admin123</code></div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

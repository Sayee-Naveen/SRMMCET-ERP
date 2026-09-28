import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, User, Shield, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [username, setUsername] = useState('prof.kumar');
  const [password, setPassword] = useState('kumar123');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      toast.success('Successfully signed in to Extra-Curricular Module!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (user, pass) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh] px-4">
      <div className="card w-full max-w-md p-6 border-t-4 border-t-blue-800 shadow-xl">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-blue-50 text-blue-800 rounded-full mb-2">
            <Trophy size={28} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">SRM MCET ERP Portal</h2>
          <p className="text-xs text-gray-500">Extra-Curricular Activities & Achievements Cell</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="form-label">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input pl-9 text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input pl-9 text-xs"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2 text-xs"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        {/* Demo Accounts Helper */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Quick Demo Sign-In
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setDemoAccount('prof.kumar', 'kumar123')}
              className="p-2 bg-gray-50 hover:bg-blue-50 rounded border text-left transition-colors"
            >
              <div className="font-bold text-gray-800">Faculty (CSE)</div>
              <div className="text-[10px] text-gray-500 font-mono">prof.kumar</div>
            </button>
            <button
              type="button"
              onClick={() => setDemoAccount('admin', 'admin123')}
              className="p-2 bg-gray-50 hover:bg-amber-50 rounded border text-left transition-colors"
            >
              <div className="font-bold text-amber-900">Administrator</div>
              <div className="text-[10px] text-gray-500 font-mono">admin</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

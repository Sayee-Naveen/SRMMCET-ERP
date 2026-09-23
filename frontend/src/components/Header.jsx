import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, Shield, BookOpen, Heart } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="erp-header">
      <div className="header-top">
        <div className="logo-container">
          <img
            src="https://srmmcet.edu.in/uploads/51ba570fe68fc088e0a942bdf8700cdce7eb8b1d/1775065128SRM-Madurai-College-for-Engineering-and-Technology-3.webp"
            alt="SRM MCET Logo"
            className="header-logo"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="college-title">
            <h1>SRM MADURAI COLLEGE FOR ENGINEERING & TECHNOLOGY</h1>
            <p>Affiliated to Anna University, Chennai | Approved by AICTE, New Delhi</p>
          </div>
        </div>

        {user && (
          <div className="user-badge-area">
            <div className="user-info">
              <span className="user-name">
                <User size={16} className="inline mr-1" />
                {user.fullName}
              </span>
              <span className={`user-role ${user.role}`}>
                {user.role.toUpperCase()}
              </span>
            </div>
            <button onClick={handleLogout} className="logout-btn" title="Logout">
              <LogOut size={18} /> Logout
            </button>
          </div>
        )}
      </div>

      {user && (
        <nav className="header-nav">
          <div className="nav-links">
            <Link to="/results" className={`nav-link ${location.pathname === '/results' ? 'active' : ''}`}>
              <BookOpen size={16} /> Semester Results Module
            </Link>
            <Link to="/medical-disciplinary" className={`nav-link ${location.pathname === '/medical-disciplinary' ? 'active' : ''}`}>
              <Heart size={16} /> Medical & Disciplinary
            </Link>
            {user.role === 'admin' && (
              <Link to="/admin" className={`nav-link admin-link ${location.pathname === '/admin' ? 'active' : ''}`}>
                <Shield size={16} /> Admin Control Panel
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

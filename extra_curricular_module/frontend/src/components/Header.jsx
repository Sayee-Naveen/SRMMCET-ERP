import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, LayoutDashboard, Trophy, Award, FileCheck } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

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
            <p>Affiliated to Anna University, Chennai | Extra-Curricular & Student Achievements Cell</p>
          </div>
        </div>

        {user ? (
          <div className="user-badge-area">
            <div className="user-info">
              <span className="user-name">
                <User size={15} className="inline mr-1" />
                {user.full_name}
              </span>
              <span className={`user-role ${user.role}`}>
                {user.role.toUpperCase()}
              </span>
            </div>
            <button onClick={handleLogout} className="logout-btn" title="Logout">
              <LogOut size={16} /> Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn-gold text-xs py-1 px-3">
            Sign In
          </Link>
        )}
      </div>

      {user && (
        <nav className="header-nav">
          <div className="nav-links">
            <Link
              to="/dashboard"
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              <LayoutDashboard size={16} /> Overview & KPIs
            </Link>
            <Link
              to="/activities"
              className={`nav-link ${isActive('/activities') ? 'active' : ''}`}
            >
              <Trophy size={16} /> Activities & Events
            </Link>
            <Link
              to="/portfolio"
              className={`nav-link ${isActive('/portfolio') ? 'active' : ''}`}
            >
              <Award size={16} /> Student EC Portfolio
            </Link>
            <Link
              to="/certificates"
              className={`nav-link ${isActive('/certificates') ? 'active' : ''}`}
            >
              <FileCheck size={16} /> Certificate Documents
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

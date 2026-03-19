import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = ({ onToggle }) => {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  // Sync state with parent on mount and when isOpen changes
  useEffect(() => {
    if (onToggle) {
      onToggle(isOpen);
    }
  }, [isOpen, onToggle]);

  return (
    <>
      <div className="sidebar open">
        <nav className="sidebar-nav">
          <ul className="sidebar-nav-list">
            {/* Main Page - commented out
            <li>
              <NavLink 
                to="/"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <div>Main Page</div>
              </NavLink>
            </li>
            */}
            {/* Model Page - commented out
            <li>
              <NavLink 
                to="/user"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <div>Model Page</div>
              </NavLink>
            </li>
            */}
            <li>
              <NavLink 
                to="/profile"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <div>Profile</div>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/portfolio"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <div>Portfolio</div>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/bookings"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <div>Bookings</div>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/links"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <div>Custom Links</div>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/settings"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <div>Account Settings</div>
              </NavLink>
            </li>
            <li className="sidebar-logout">
              <button
                type="button"
                onClick={() => logout()}
                className="nav-item"
                style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', color: '#666' }}
              >
                <div>Logout</div>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;


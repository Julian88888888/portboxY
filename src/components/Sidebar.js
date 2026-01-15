import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ onToggle }) => {
  const [isOpen, setIsOpen] = useState(true);

  // Sync state with parent on mount and when isOpen changes
  useEffect(() => {
    if (onToggle) {
      onToggle(isOpen);
    }
  }, [isOpen, onToggle]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <button 
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <span className="toggle-icon">{isOpen ? '←' : '→'}</span>
        </button>
        
        <nav className="sidebar-nav">
          <ul className="sidebar-nav-list">
            <li>
              <NavLink 
                to="/"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">🏠</span>
                {isOpen && <span className="nav-text">Main Page</span>}
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/model"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">👤</span>
                {isOpen && <span className="nav-text">Model Page</span>}
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/profile"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">👤</span>
                {isOpen && <span className="nav-text">Profile</span>}
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/portfolio"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">📁</span>
                {isOpen && <span className="nav-text">Portfolio</span>}
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/bookings"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">📅</span>
                {isOpen && <span className="nav-text">Bookings</span>}
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/links"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">🔗</span>
                {isOpen && <span className="nav-text">Custom Links</span>}
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/settings"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">⚙️</span>
                {isOpen && <span className="nav-text">Settings</span>}
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;


import React, { useState, useEffect } from 'react';
import './Sidebar.css';

const Sidebar = ({ currentPage, onPageChange, onToggle }) => {
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

  const handlePageChange = (page) => {
    onPageChange(page);
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
              <button 
                className={`nav-item ${currentPage === 'main' ? 'active' : ''}`}
                onClick={() => handlePageChange('main')}
              >
                <span className="nav-icon">🏠</span>
                {isOpen && <span className="nav-text">Main Page</span>}
              </button>
            </li>
            <li>
              <button 
                className={`nav-item ${currentPage === 'model' ? 'active' : ''}`}
                onClick={() => handlePageChange('model')}
              >
                <span className="nav-icon">👤</span>
                {isOpen && <span className="nav-text">Model Page</span>}
              </button>
            </li>
            <li>
              <button 
                className={`nav-item ${currentPage === 'dashboard-profile' ? 'active' : ''}`}
                onClick={() => handlePageChange('dashboard-profile')}
              >
                <span className="nav-icon">👤</span>
                {isOpen && <span className="nav-text">Profile</span>}
              </button>
            </li>
            <li>
              <button 
                className={`nav-item ${currentPage === 'dashboard-portfolio' ? 'active' : ''}`}
                onClick={() => handlePageChange('dashboard-portfolio')}
              >
                <span className="nav-icon">📁</span>
                {isOpen && <span className="nav-text">Portfolio</span>}
              </button>
            </li>
            <li>
              <button 
                className={`nav-item ${currentPage === 'dashboard-bookings' ? 'active' : ''}`}
                onClick={() => handlePageChange('dashboard-bookings')}
              >
                <span className="nav-icon">📅</span>
                {isOpen && <span className="nav-text">Bookings</span>}
              </button>
            </li>
            <li>
              <button 
                className={`nav-item ${currentPage === 'dashboard-links' ? 'active' : ''}`}
                onClick={() => handlePageChange('dashboard-links')}
              >
                <span className="nav-icon">🔗</span>
                {isOpen && <span className="nav-text">Custom Links</span>}
              </button>
            </li>
            <li>
              <button 
                className={`nav-item ${currentPage === 'dashboard-settings' ? 'active' : ''}`}
                onClick={() => handlePageChange('dashboard-settings')}
              >
                <span className="nav-icon">⚙️</span>
                {isOpen && <span className="nav-text">Settings</span>}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;


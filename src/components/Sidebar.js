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
                className={`nav-item ${currentPage === 'edit-profile' ? 'active' : ''}`}
                onClick={() => handlePageChange('edit-profile')}
              >
                <span className="nav-icon">✏️</span>
                {isOpen && <span className="nav-text">Edit Profile</span>}
              </button>
            </li>
            <li>
              <button 
                className={`nav-item ${currentPage === 'dashboard' || (currentPage && currentPage.startsWith('dashboard-')) ? 'active' : ''}`}
                onClick={() => handlePageChange('dashboard-profile')}
              >
                <span className="nav-icon">⚙️</span>
                {isOpen && <span className="nav-text">Dashboard</span>}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;


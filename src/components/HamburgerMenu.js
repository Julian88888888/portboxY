import React, { useState } from 'react';
import './HamburgerMenu.css';

const HamburgerMenu = ({ currentPage, onPageChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handlePageChange = (page) => {
    onPageChange(page);
    setIsOpen(false);
  };

  return (
    <div className="hamburger-menu">
      <button 
        className={`hamburger-button ${isOpen ? 'open' : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>
      
      <nav className={`hamburger-nav ${isOpen ? 'open' : ''}`}>
        <ul className="hamburger-nav-list">
          <li>
            <button 
              className={`nav-item ${currentPage === 'main' ? 'active' : ''}`}
              onClick={() => handlePageChange('main')}
            >
              Main Page
            </button>
          </li>
          <li>
            <button 
              className={`nav-item ${currentPage === 'model' ? 'active' : ''}`}
              onClick={() => handlePageChange('model')}
            >
              Model Page
            </button>
          </li>
          <li>
            <button 
              className={`nav-item ${currentPage === 'edit-profile' ? 'active' : ''}`}
              onClick={() => handlePageChange('edit-profile')}
            >
              Edit Profile
            </button>
          </li>
        </ul>
      </nav>
      
      {isOpen && (
        <div className="hamburger-overlay" onClick={toggleMenu}></div>
      )}
    </div>
  );
};

export default HamburgerMenu;

import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

const MOBILE_MAX = 767;

const Sidebar = ({ onToggle }) => {
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= MOBILE_MAX
  );
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const updateIsMobile = useCallback(() => {
    const mobile = window.innerWidth <= MOBILE_MAX;
    setIsMobile(mobile);
    if (!mobile) {
      setMobileDrawerOpen(false);
    }
  }, []);

  useEffect(() => {
    updateIsMobile();
    window.addEventListener('resize', updateIsMobile);
    return () => window.removeEventListener('resize', updateIsMobile);
  }, [updateIsMobile]);

  useEffect(() => {
    if (!isMobile) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMobile]);

  // Sync state with parent on mount and when isOpen changes
  useEffect(() => {
    if (onToggle) {
      onToggle(isOpen);
    }
  }, [isOpen, onToggle]);

  const closeMobileDrawer = () => {
    if (isMobile) setMobileDrawerOpen(false);
  };

  const navClass = ({ isActive }) => `nav-item ${isActive ? 'active' : ''}`;

  return (
    <>
      {isMobile && (
        <>
          <button
            type="button"
            className="sidebar-hamburger"
            aria-label={mobileDrawerOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileDrawerOpen}
            aria-controls="app-sidebar-nav"
            onClick={() => setMobileDrawerOpen((v) => !v)}
          >
            <span className="sidebar-hamburger-box" aria-hidden>
              <span className={`sidebar-hamburger-inner ${mobileDrawerOpen ? 'is-open' : ''}`} />
            </span>
          </button>
          <button
            type="button"
            className={`sidebar-backdrop ${mobileDrawerOpen ? 'is-visible' : ''}`}
            aria-label="Close menu"
            tabIndex={mobileDrawerOpen ? 0 : -1}
            onClick={closeMobileDrawer}
          />
        </>
      )}
      <div
        id="app-sidebar-nav"
        className={`sidebar open${isMobile && mobileDrawerOpen ? ' drawer-open' : ''}`}
      >
        <nav className="sidebar-nav">
          {isMobile && (
            <div className="sidebar-auth-panel">
              <Link
                to="/"
                className="sidebar-auth-brand"
                onClick={closeMobileDrawer}
              >
                Portfolio-In-Link
              </Link>
              <h2 className="sidebar-auth-welcome">
                Welcome Back {user?.firstName || user?.user_metadata?.firstName || 'User'}
              </h2>
              {user?.email && (
                <p className="sidebar-auth-email">Logged in as: {user.email}</p>
              )}
            </div>
          )}
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
              <NavLink to="/profile" className={navClass} onClick={closeMobileDrawer}>
                <div>Profile</div>
              </NavLink>
            </li>
            <li>
              <NavLink to="/portfolio" className={navClass} onClick={closeMobileDrawer}>
                <div>Portfolio</div>
              </NavLink>
            </li>
            <li>
              <NavLink to="/bookings" className={navClass} onClick={closeMobileDrawer}>
                <div>Bookings</div>
              </NavLink>
            </li>
            <li>
              <NavLink to="/links" className={navClass} onClick={closeMobileDrawer}>
                <div>Custom Links</div>
              </NavLink>
            </li>
            <li>
              <NavLink to="/settings" className={navClass} onClick={closeMobileDrawer}>
                <div>Account Settings</div>
              </NavLink>
            </li>
            <li className="sidebar-logout">
              <button
                type="button"
                onClick={() => {
                  closeMobileDrawer();
                  logout();
                }}
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


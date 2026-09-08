import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import './Sidebar.css';

const MOBILE_MAX = 767;

const NavIcon = ({ children }) => (
  <span className="nav-icon" aria-hidden>
    {children}
  </span>
);

const icons = {
  profile: (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
      <path d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12m0 2.25c-4.14 0-7.5 2.1-7.5 4.69V21h15v-2.06c0-2.59-3.36-4.69-7.5-4.69" />
    </svg>
  ),
  portfolio: (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5zm2 1v4.25h5.25V6.5zm6.75 0v4.25H18V6.5zM6 12.25V18h5.25v-5.75zm6.75 0V18H18v-5.75z" />
    </svg>
  ),
  bookings: (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
      <path d="M7 2.75a.75.75 0 0 1 .75.75V5h8.5V3.5a.75.75 0 0 1 1.5 0V5H19a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h1.25V3.5A.75.75 0 0 1 7 2.75M5 9.5v9.5h14V9.5zm3 3h3.5v3.5H8zm5 0H16.5v3.5H13z" />
    </svg>
  ),
  links: (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
      <path d="M10.59 13.41a1.75 1.75 0 0 0 2.47 0l3.18-3.18a2.75 2.75 0 1 0-3.89-3.89l-.88.88a.75.75 0 1 0 1.06 1.06l.88-.88a1.25 1.25 0 1 1 1.77 1.77l-3.18 3.18a.25.25 0 0 1-.35 0 .75.75 0 0 0-1.06 1.06m2.82-2.82a1.75 1.75 0 0 0-2.47 0L7.76 13.77a2.75 2.75 0 1 0 3.89 3.89l.88-.88a.75.75 0 1 0-1.06-1.06l-.88.88a1.25 1.25 0 1 1-1.77-1.77l3.18-3.18a.25.25 0 0 1 .35 0 .75.75 0 1 0 1.06-1.06" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
      <path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.61-.22l-2.39.96a7.03 7.03 0 0 0-1.62-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54c-.59.24-1.13.55-1.62.94l-2.39-.96a.5.5 0 0 0-.61.22L2.71 8.84a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.83 14.52a.5.5 0 0 0-.12.64l1.92 3.32c.14.24.43.34.69.22l2.39-.96c.5.39 1.04.71 1.62.94l.36 2.54c.05.24.26.42.5.42h3.84c.24 0 .45-.18.5-.42l.36-2.54c.59-.24 1.13-.55 1.62-.94l2.39.96c.26.1.55 0 .69-.22l1.92-3.32a.5.5 0 0 0-.12-.64zM12 15.5A3.5 3.5 0 1 1 15.5 12 3.5 3.5 0 0 1 12 15.5" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
      <path d="M10.75 3.5a.75.75 0 0 0-.75.75v4a.75.75 0 0 0 1.5 0V5h6.5v14H11.5v-3.25a.75.75 0 0 0-1.5 0v4c0 .41.34.75.75.75h8a.75.75 0 0 0 .75-.75V4.25a.75.75 0 0 0-.75-.75zm-2.22 5.47a.75.75 0 1 0-1.06-1.06l-4 4a.75.75 0 0 0 0 1.06l4 4a.75.75 0 1 0 1.06-1.06L5.81 12.75H14a.75.75 0 0 0 0-1.5H5.81z" />
    </svg>
  ),
};

const Sidebar = ({ onToggle }) => {
  const { logout, user } = useAuth();
  const { data: profile } = useProfile();
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

  const loggedInUsername = String(
    profile?.username || user?.username || user?.user_metadata?.username || ''
  )
    .trim()
    .replace(/^@+/, '');

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
                Welcome Back
              </h2>
              {loggedInUsername && (
                <p className="sidebar-auth-email">Logged in as: @{loggedInUsername}</p>
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
                <div className="nav-item-content">
                  <NavIcon>{icons.profile}</NavIcon>
                  <span className="nav-text">Profile</span>
                </div>
              </NavLink>
            </li>
            <li>
              <NavLink to="/portfolio" className={navClass} onClick={closeMobileDrawer}>
                <div className="nav-item-content">
                  <NavIcon>{icons.portfolio}</NavIcon>
                  <span className="nav-text">Portfolio</span>
                </div>
              </NavLink>
            </li>
            <li>
              <NavLink to="/bookings" className={navClass} onClick={closeMobileDrawer}>
                <div className="nav-item-content">
                  <NavIcon>{icons.bookings}</NavIcon>
                  <span className="nav-text">Bookings</span>
                </div>
              </NavLink>
            </li>
            <li>
              <NavLink to="/links" className={navClass} onClick={closeMobileDrawer}>
                <div className="nav-item-content">
                  <NavIcon>{icons.links}</NavIcon>
                  <span className="nav-text">Custom Links</span>
                </div>
              </NavLink>
            </li>
            <li>
              <NavLink to="/settings" className={navClass} onClick={closeMobileDrawer}>
                <div className="nav-item-content">
                  <NavIcon>{icons.settings}</NavIcon>
                  <span className="nav-text">Account Settings</span>
                </div>
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
                <div className="nav-item-content">
                  <NavIcon>{icons.logout}</NavIcon>
                  <span className="nav-text">Logout</span>
                </div>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;


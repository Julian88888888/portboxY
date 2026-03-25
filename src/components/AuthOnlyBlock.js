import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function AuthOnlyBlock() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <div className="auth-block" style={{
      background: 'transparent',
      color: '#333',
      padding: '12px 12px',
      textAlign: 'left',
      borderRadius: '8px',
      margin: 0,
      boxShadow: 'none',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1100,
      maxWidth: 'min(260px, calc(100vw - 24px))',
      boxSizing: 'border-box'
    }}>
      <Link
        to="/"
        style={{
          display: 'inline-block',
          color: '#111',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '13px',
          marginBottom: '4px'
        }}
      >
        Portfolio-In-Link
      </Link>
      <h2 style={{ margin: 0, fontSize: '18px', lineHeight: '1.2', fontWeight: 600 }}>
        Welcome Back {user?.firstName || 'User'}
      </h2>
      {user?.email && (
        <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
          Logged in as: {user.email}
        </p>
      )}
    </div>
  );
}

export default AuthOnlyBlock;

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
      padding: '20px 24px',
      textAlign: 'left',
      borderRadius: '8px',
      margin: 0,
      boxShadow: 'none',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1100
    }}>
      <Link
        to="/"
        style={{
          display: 'inline-block',
          color: '#111',
          textDecoration: 'none',
          fontWeight: 600,
          marginBottom: '8px'
        }}
      >
        Portfolio-In-Link
      </Link>
      <h2 style={{ margin: 0, fontSize: '24px', lineHeight: '1.2', fontWeight: 600 }}>
        Welcome Back {user?.firstName || 'User'}
      </h2>
      {user?.email && (
        <p style={{ fontSize: '14px', color: '#666', margin: '6px 0 0 0' }}>
          Logged in as: {user.email}
        </p>
      )}
    </div>
  );
}

export default AuthOnlyBlock;

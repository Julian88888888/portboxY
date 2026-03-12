import React from 'react';
import { useAuth } from '../contexts/AuthContext';

function AuthOnlyBlock() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <div className="auth-block" style={{
      background: 'transparent',
      color: '#333',
      padding: '20px',
      textAlign: 'center',
      borderRadius: '8px',
      margin: '20px',
      boxShadow: 'none'
    }}>
      <h2>Welcome back, {user?.firstName || 'User'}!</h2>
      <p>You're successfully logged in to your Model Link Portfolio account.</p>
      {user?.email && (
        <p style={{ fontSize: '14px', color: '#666' }}>
          Logged in as: {user.email}
        </p>
      )}
    </div>
  );
}

export default AuthOnlyBlock;

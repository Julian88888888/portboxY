import React from 'react';
import { useAuth } from '../contexts/AuthContext';

function AuthOnlyBlock() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <div className="auth-block" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '20px',
      textAlign: 'center',
      borderRadius: '8px',
      margin: '20px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <h2>Welcome back, {user?.firstName || 'User'}!</h2>
      <p>You're successfully logged in to your Model Link Portfolio account.</p>
      {user?.email && (
        <p style={{ fontSize: '14px', opacity: 0.9 }}>
          Logged in as: {user.email}
        </p>
      )}
    </div>
  );
}

export default AuthOnlyBlock;

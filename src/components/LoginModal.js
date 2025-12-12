import React, { useState } from 'react';
import { FaTimes, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const LoginModal = ({ isOpen, onClose, onSwitchToSignUp }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      // Validate password is not empty
      if (!formData.password || formData.password.trim().length === 0) {
        setError('Please enter your password');
        setIsLoading(false);
        return;
      }

      const result = await login(formData);
      
      if (result.success) {
        onClose();
        // Optionally redirect or update app state
        window.location.reload(); // Simple refresh for now
      } else {
        // Use the error message from the result (already formatted)
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login form error:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSwitchToSignUp = (e) => {
    e.preventDefault();
    if (onSwitchToSignUp) {
      onSwitchToSignUp();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <FaTimes />
        </button>
        
        <div className="text-wrapper text-align-center">
          <h2 className="section-title">Welcome Back</h2>
          <p className="text-color-grey text-width-medium">
            Sign in to your Model Link Portfolio account
          </p>
        </div>
        
        <div className="spacing-24"></div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">
              <FaEnvelope size={16} style={{ marginRight: '8px' }} />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">
              <FaLock size={16} style={{ marginRight: '8px' }} />
              Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
          </div>
          
          <div className="form-options">
            <label className="checkbox-wrapper">
              <input type="checkbox" />
              <span className="checkmark"></span>
              Remember me
            </label>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <FaSpinner className="spinner" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div className="spacing-24"></div>
        
        <div className="text-align-center">
          <p className="text-color-grey">
            Don't have an account?{' '}
            <a href="#" className="signup-link" onClick={handleSwitchToSignUp}>Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal; 
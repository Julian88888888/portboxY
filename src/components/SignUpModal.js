import React, { useState } from 'react';
import { FaTimes, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUser, FaPhone, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const SignUpModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'model'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    setSuccess('');
    setIsLoading(true);

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate password length (Supabase requires minimum 6 characters)
      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        throw new Error('Please fill in all required fields');
      }

      // Prepare data for API (remove confirmPassword)
      const { confirmPassword, ...registrationData } = formData;

      const result = await register(registrationData);
      
      if (result.success) {
        setSuccess('Account created successfully! Welcome to Model Link Portfolio.');
        setTimeout(() => {
          onClose();
          // Optionally redirect or update app state
          window.location.reload(); // Simple refresh for now
        }, 2000);
      } else {
        // Better error handling for Supabase errors
        let errorMessage = result.error || 'Registration failed. Please try again.';
        
        // Parse common Supabase errors
        if (result.error) {
          const errorLower = result.error.toLowerCase();
          
          if (errorLower.includes('already registered') || 
              errorLower.includes('user already exists') ||
              errorLower.includes('already exists')) {
            errorMessage = 'This email is already registered. Please sign in instead.';
          } else if (errorLower.includes('password') || errorLower.includes('too short')) {
            errorMessage = 'Password must be at least 6 characters long.';
          } else if (errorLower.includes('email') || errorLower.includes('invalid')) {
            errorMessage = 'Invalid email address. Please check and try again.';
          } else if (errorLower.includes('422') || errorLower.includes('unprocessable')) {
            errorMessage = 'Invalid data provided. Please check all fields are filled correctly.';
          } else if (errorLower.includes('rate limit') || errorLower.includes('too many')) {
            errorMessage = 'Too many requests. Please wait a moment and try again.';
          }
        }
        
        setError(errorMessage);
      }
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSwitchToLogin = (e) => {
    e.preventDefault();
    if (onSwitchToLogin) {
      onSwitchToLogin();
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
          <h2 className="section-title">Create Account</h2>
          <p className="text-color-grey text-width-medium">
            Join Model Link Portfolio and showcase your talent
          </p>
        </div>
        
        <div className="spacing-24"></div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">
                <FaUser size={16} style={{ marginRight: '8px' }} />
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter your first name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">
                <FaUser size={16} style={{ marginRight: '8px' }} />
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter your last name"
                required
              />
            </div>
          </div>
          
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
            <label htmlFor="phone">
              <FaPhone size={16} style={{ marginRight: '8px' }} />
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
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
                placeholder="Create a password"
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
          
          <div className="form-group">
            <label htmlFor="confirmPassword">
              <FaLock size={16} style={{ marginRight: '8px' }} />
              Confirm Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="userType">
              <FaUser size={16} style={{ marginRight: '8px' }} />
              I am a
            </label>
            <select
              id="userType"
              name="userType"
              value={formData.userType}
              onChange={handleInputChange}
              required
            >
              <option value="model">Model</option>
              <option value="photographer">Photographer</option>
              <option value="stylist">Wardrobe Stylist</option>
              <option value="makeup_artist">Makeup Artist</option>
              <option value="hair_stylist">Hair Stylist</option>
            </select>
          </div>
          
          <div className="form-options">
            <label className="checkbox-wrapper">
              <input type="checkbox" required />
              <span className="checkmark"></span>
              I agree to the Terms of Service and Privacy Policy
            </label>
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {success && (
            <div className="success-message">
              {success}
            </div>
          )}
          
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <FaSpinner className="spinner" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        
        <div className="spacing-24"></div>
        
        <div className="text-align-center">
          <p className="text-color-grey">
            Already have an account?{' '}
            <a href="#" className="signup-link" onClick={handleSwitchToLogin}>Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpModal; 
import React, { useState, useEffect, useMemo } from 'react';
import { FaTimes, FaCamera, FaVideo, FaWalking, FaMicrophone } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { createBooking, createGuestBooking } from '../services/bookingsService';
import { getAvatarUrl } from '../services/profileService';
import { PAY_CURRENCIES } from '../utils/currencies';
import { PAY_RATE_TYPES, formatPayRate } from '../utils/payRate';

const BookingModal = ({ isOpen, onClose, profile, onBookingCreated }) => {
  const { user } = useAuth();
  const { data: clientProfile } = useProfile();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dates: '',
    location: '',
    offerAmount: '',
    payCurrency: 'USD',
    payRate: '',
    details: '',
    jobType: ''
  });
  const [selectedJobType, setSelectedJobType] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);
  const isIdentityLocked = Boolean(user);

  const clientAvatarSrc = useMemo(() => {
    if (clientProfile?.profile_photo_path) {
      return getAvatarUrl(clientProfile.profile_photo_path);
    }
    if (user?.profilePhotos?.length > 0) {
      const mainPhoto = user.profilePhotos.find((photo) => photo.isMain);
      return mainPhoto ? mainPhoto.url : user.profilePhotos[0].url;
    }
    return '/images/default-avatar.svg';
  }, [clientProfile?.profile_photo_path, user?.profilePhotos]);

  const clientUsername = useMemo(() => {
    const raw = clientProfile?.username ?? user?.user_metadata?.username ?? '';
    const handle = String(raw).trim().replace(/^@+/, '');
    return handle || null;
  }, [clientProfile?.username, user?.user_metadata?.username]);

  // Prefill email (and name) when modal opens and user is logged in
  useEffect(() => {
    if (isOpen && user) {
      const fallbackName =
        clientProfile?.display_name ||
        clientProfile?.name ||
        clientProfile?.username ||
        '';
      setFormData((prev) => ({
        ...prev,
        email: (user.email || prev.email || '').trim(),
        name: (
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          fallbackName ||
          prev.name ||
          ''
        ).trim()
      }));
    }
  }, [isOpen, user?.id, user?.email, user?.user_metadata?.full_name, user?.user_metadata?.name, clientProfile?.display_name, clientProfile?.name, clientProfile?.username]);

  const jobTypes = [
    { name: 'Photoshoots', icon: FaCamera },
    { name: 'Acting', icon: FaVideo },
    { name: 'Runway', icon: FaWalking },
    { name: 'Promos', icon: FaMicrophone }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleJobTypeSelect = (jobType) => {
    setSelectedJobType(jobType);
    setFormData(prev => ({
      ...prev,
      jobType: jobType
    }));
  };

  const formatDateForDisplay = (dateValue) => {
    if (!dateValue) return '';
    const d = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(d.getTime())) return dateValue;
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const syncDatesText = (fromValue, toValue) => {
    let nextText = '';
    if (fromValue && toValue) {
      nextText = `${formatDateForDisplay(fromValue)} - ${formatDateForDisplay(toValue)}`;
    } else if (fromValue) {
      nextText = formatDateForDisplay(fromValue);
    } else if (toValue) {
      nextText = formatDateForDisplay(toValue);
    }
    setFormData((prev) => ({ ...prev, dates: nextText }));
  };

  const handleDateFromChange = (e) => {
    const nextFrom = e.target.value;
    let nextTo = dateTo;
    if (nextTo && nextFrom && nextTo < nextFrom) {
      nextTo = nextFrom;
      setDateTo(nextFrom);
    }
    setDateFrom(nextFrom);
    syncDatesText(nextFrom, nextTo);
  };

  const handleDateToChange = (e) => {
    const nextTo = e.target.value;
    setDateTo(nextTo);
    syncDatesText(dateFrom, nextTo);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    if (user && !String(formData.email || '').trim()) {
      setSubmitError('Your account email is required to send a booking request.');
      setIsSubmitting(false);
      return;
    }

    const bookingPayload = {
      name: formData.name,
      email: formData.email,
      job_type: selectedJobType || formData.jobType,
      dates: formData.dates,
      location: formData.location,
      pay_rate: formatPayRate(formData.offerAmount, formData.payCurrency, formData.payRate),
      details: formData.details,
      status: 'pending',
      ...(user && clientProfile?.username
        ? {
            client_username: String(clientProfile.username).trim().replace(/^@+/, '').slice(0, 30)
          }
        : {})
    };

    try {
      const result = profile?.id
        ? await createGuestBooking(bookingPayload, { modelId: profile.id, username: profile.username })
        : await createBooking(bookingPayload);

      if (result.success) {
        const bookingId = result.data?.id;
        const clientEmail = formData.email?.trim() || '';
        setCreatedBooking(bookingId && clientEmail ? { id: bookingId, email: clientEmail } : null);
        setSubmitSuccess(true);
        setFormData({
          name: '',
          email: '',
          dates: '',
          location: '',
          offerAmount: '',
          payCurrency: 'USD',
          payRate: '',
          details: '',
          jobType: ''
        });
        setDateFrom('');
        setDateTo('');
        setSelectedJobType(null);
        if (onBookingCreated) onBookingCreated();
        setTimeout(() => {
          onClose();
          setSubmitSuccess(false);
          setCreatedBooking(null);
        }, 6000);
      } else {
        setSubmitError(result.error || 'Failed to submit booking request');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      setSubmitError(error.message || 'An error occurred while submitting the booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: '',
        email: '',
        dates: '',
        location: '',
        offerAmount: '',
        payCurrency: 'USD',
        payRate: '',
        details: '',
        jobType: ''
      });
      setDateFrom('');
      setDateTo('');
      setSelectedJobType(null);
      setSubmitError(null);
      setSubmitSuccess(false);
      setCreatedBooking(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose} disabled={isSubmitting}>
          <FaTimes />
        </button>
        
        {profile && (
          <>
            <div className="profile-wrapper">
              <img 
                src={profile.profileImage || "/images/default-avatar.svg"} 
                alt={profile.displayName || "Profile"} 
                className="profile-image"
                style={{ width: '80px', height: '80px' }}
              />
            </div>
            
            <div className="text-wrapper text-align-center">
              <div className="flex-wrapper flex-center">
                <h3>{profile.displayName || "User Name"}</h3>
                <span className="accent-button small-btn">{profile.jobType || "Model"}</span>
              </div>
              
              <div className="spacing-8"></div>
              
              {profile.username && <p className="username-txt">@{profile.username}</p>}
            </div>
          </>
        )}
        
        <div className="spacing-24"></div>
        
        <h3>Send Booking Request</h3>
        {isIdentityLocked && (
          <div className="form-group booking-modal-from">
            <div className="booking-modal-from-row" aria-label="Booking request sender">
              <span className="booking-modal-from-label">From</span>
              <img
                src={clientAvatarSrc}
                alt=""
                className="booking-modal-from-avatar"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = '/images/default-avatar.svg';
                }}
              />
              {clientUsername ? (
                <span className="booking-modal-from-handle">@{clientUsername}</span>
              ) : (
                <span className="booking-modal-from-handle booking-modal-from-handle--muted">
                  Set username in Profile
                </span>
              )}
            </div>
          </div>
        )}
        <div className="spacing-24"></div>
        
        <p className="text-color-grey text-width-medium">Select a job type ⤵</p>
        
        <div className="job-types">
          {jobTypes.map((job, index) => (
            <div 
              key={index} 
              className={`job-type-btn ${selectedJobType === job.name ? 'selected' : ''}`}
              onClick={() => handleJobTypeSelect(job.name)}
              style={{ 
                cursor: 'pointer',
                backgroundColor: selectedJobType === job.name ? '#783FF3' : 'transparent',
                color: selectedJobType === job.name ? 'white' : 'inherit'
              }}
            >
              <span>{job.name}</span>
              <job.icon size={20} />
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="spacing-24"></div>
          
          {submitError && (
            <div style={{ 
              padding: '12px', 
              marginBottom: '16px', 
              backgroundColor: '#fee', 
              color: '#c33', 
              borderRadius: '4px' 
            }}>
              {submitError}
            </div>
          )}
          
          {submitSuccess && (
            <div style={{ 
              padding: '12px', 
              marginBottom: '16px', 
              backgroundColor: '#efe', 
              color: '#155724', 
              borderRadius: '4px' 
            }}>
              <p style={{ margin: '0 0 8px 0' }}>Booking request submitted successfully!</p>
              {createdBooking && (
                <p style={{ margin: 0, fontSize: '14px' }}>
                  You can message about this booking:{' '}
                  <a
                    href={`${window.location.origin}/booking/chat/${createdBooking.id}?email=${encodeURIComponent(createdBooking.email)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#783FF3', fontWeight: 600 }}
                  >
                    Open chat
                  </a>
                </p>
              )}
            </div>
          )}
          
          {isIdentityLocked ? null : (
            <>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </>
          )}
          
          <div className="form-group">
            <label htmlFor="dates">Dates Requesting</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <label htmlFor="dateFrom" style={{ fontSize: '12px', color: '#666', marginBottom: '6px', display: 'block' }}>
                  From
                </label>
                <input
                  type="date"
                  id="dateFrom"
                  value={dateFrom}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={handleDateFromChange}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="dateTo" style={{ fontSize: '12px', color: '#666', marginBottom: '6px', display: 'block' }}>
                  To
                </label>
                <input
                  type="date"
                  id="dateTo"
                  value={dateTo}
                  min={dateFrom || new Date().toISOString().slice(0, 10)}
                  onChange={handleDateToChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <input
              type="text"
              id="dates"
              name="dates"
              value={formData.dates}
              onChange={handleInputChange}
              placeholder="Dates"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="location">City/Country</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Name of City/Country"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="form-group">
            <label>Budget</label>
            <div className="pay-rate-row">
              <div className="pay-rate-field">
                <label htmlFor="offerAmount" className="pay-rate-sublabel">Offer Amount</label>
                <input
                  type="text"
                  id="offerAmount"
                  name="offerAmount"
                  value={formData.offerAmount}
                  onChange={handleInputChange}
                  placeholder="Amount"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="pay-rate-field pay-rate-field--currency">
                <label htmlFor="payCurrency" className="pay-rate-sublabel">Currency</label>
                <select
                  id="payCurrency"
                  name="payCurrency"
                  value={formData.payCurrency}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                >
                  {PAY_CURRENCIES.map((currency) => (
                    <option key={currency.value} value={currency.value}>
                      {currency.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pay-rate-field">
                <label htmlFor="payRate" className="pay-rate-sublabel">Pay Rate</label>
                <select
                  id="payRate"
                  name="payRate"
                  value={formData.payRate}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select...</option>
                  {PAY_RATE_TYPES.map((rate) => (
                    <option key={rate.value} value={rate.value}>
                      {rate.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="details">Job Details</label>
            <textarea
              id="details"
              name="details"
              value={formData.details}
              onChange={handleInputChange}
              placeholder="Description of project"
              rows="4"
              disabled={isSubmitting}
            />
          </div>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting || !selectedJobType}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal; 
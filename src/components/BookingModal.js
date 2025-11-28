import React, { useState } from 'react';
import { FaTimes, FaCamera, FaVideo, FaWalking, FaMicrophone } from 'react-icons/fa';

const BookingModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dates: '',
    location: '',
    payRate: '',
    details: ''
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <FaTimes />
        </button>
        
        <div className="profile-wrapper">
          <img 
            src="/images/headshot_model.jpg" 
            alt="Mary Adams" 
            className="profile-image"
            style={{ width: '80px', height: '80px' }}
          />
        </div>
        
        <div className="text-wrapper text-align-center">
          <div className="flex-wrapper flex-center">
            <h3>Mary Adams</h3>
            <div className="icon-20x20">
              <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.50033 10.5003L9.16699 12.167L12.917 8.41699M6.1118 3.68258C6.78166 3.62912 7.41758 3.36571 7.92905 2.92984C9.12258 1.91271 10.8781 1.91271 12.0716 2.92984C12.5831 3.36571 13.219 3.62912 13.8888 3.68258C15.4521 3.80732 16.6933 5.04861 16.8181 6.6118C16.8716 7.28166 17.1349 7.91758 17.5708 8.42905C18.5879 9.62258 18.5879 11.3781 17.5708 12.5716C17.1349 13.0831 16.8716 13.719 16.8181 14.3888C16.6933 15.9521 15.4521 17.1933 13.8888 17.3181C13.219 17.3716 12.5831 17.6349 12.0716 18.0708C10.8781 19.0879 9.12258 19.0879 7.92905 18.0708C7.41758 17.6349 6.78166 17.3716 6.1118 17.3181C4.54861 17.1933 3.30732 15.9521 3.18258 14.3888C3.12912 13.719 2.86571 13.0831 2.42984 12.5716C1.41271 11.3781 1.41271 9.62258 2.42984 8.42905C2.86571 7.91758 3.12912 7.28166 3.18258 6.6118C3.30732 5.04861 4.54861 3.80732 6.1118 3.68258Z" stroke="#783FF3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
            <span className="accent-button small-btn">Model</span>
          </div>
          
          <div className="spacing-8"></div>
          
          <p className="username-txt">@maryadams</p>
          <p className="text-color-grey text-width-medium">
            I am a professional model with many years of experience working for top brands all over the world.
          </p>
        </div>
        
        <div className="spacing-24"></div>
        
        <h3>Send Job Request</h3>
        <div className="spacing-24"></div>
        
        <p className="text-color-grey text-width-medium">Select a job type ⤵</p>
        
        <div className="job-types">
          {jobTypes.map((job, index) => (
            <div key={index} className="job-type-btn">
              <span>{job.name}</span>
              <job.icon size={20} />
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="spacing-24"></div>
          
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
              placeholder="@"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="dates">Dates Requesting</label>
            <input
              type="text"
              id="dates"
              name="dates"
              value={formData.dates}
              onChange={handleInputChange}
              placeholder="Dates"
              required
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
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="payRate">Pay Rate</label>
            <input
              type="text"
              id="payRate"
              name="payRate"
              value={formData.payRate}
              onChange={handleInputChange}
              placeholder="Pay rate for job"
              required
            />
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
            />
          </div>
          
          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal; 
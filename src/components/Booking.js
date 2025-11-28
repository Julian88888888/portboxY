import React from 'react';
import { FaCamera, FaVideo, FaWalking, FaMicrophone, FaCalendar } from 'react-icons/fa';

const Booking = ({ onBookMe }) => {
  const availability = [
    { day: 'Mon', hours: 5, available: true },
    { day: 'Tue', hours: 5, available: true },
    { day: 'Wed', hours: 4, available: true },
    { day: 'Thu', hours: 6, available: true },
    { day: 'Fri', hours: 2, available: true },
    { day: 'Sat', hours: 0, available: false },
    { day: 'Sun', hours: 0, available: false }
  ];

  const travelDates = [
    { location: 'Miami', dates: 'July 1 - July 10', flag: '/images/323310.png' },
    { location: 'Paris', dates: 'July 13 - July 28', flag: '/images/197560.png' },
    { location: 'Hong Kong', dates: 'Aug 1 - Aug 22', flag: '/images/197570.png' }
  ];

  const jobTypes = [
    { name: 'Photoshoots', icon: FaCamera },
    { name: 'Acting', icon: FaVideo },
    { name: 'Runway', icon: FaWalking },
    { name: 'Promos', icon: FaMicrophone }
  ];

  return (
    <section className="section booking-section">
      <div className="content-wrapper">
        <div className="availability-section">
          <h4 className="section-title">Weekly Availability (overview)</h4>
          <div className="spacing-24"></div>
          
          <div className="availability-grid">
            {availability.map((day, index) => (
              <div key={index} className="availability-column">
                <div className="availability-graph-item">
                  <div className="graph-bar"></div>
                  {day.available && (
                    <div 
                      className="graph-bar available"
                      style={{ height: `${(day.hours / 8) * 100}%` }}
                    >
                      <div>{day.hours} hours</div>
                    </div>
                  )}
                </div>
                <div className="small-text font-weight-bold">{day.day}</div>
              </div>
            ))}
          </div>
          
          <div className="spacing-24"></div>
          <p className="text-color-muted">* Gray areas indicate unavailability</p>
          <div className="spacing-24"></div>
          <div className="line-divider"></div>
        </div>
        
        <div className="spacing-24"></div>
        
        {/* <h4 className="section-title">Upcoming Travel Dates</h4> */}
        <div className="spacing-24"></div>
        
        <div className="three-col-grid">
          {travelDates.map((travel, index) => (
            <div key={index} className="travel-card">
              <div className="travel-info">
                <div className="travel-location">{travel.location}</div>
                <div className="travel-dates">{travel.dates}</div>
              </div>
              <img 
                src={travel.flag} 
                alt={`${travel.location} flag`} 
                className="icon-32x32"
              />
            </div>
          ))}
        </div>
        
        <div className="spacing-24"></div>
        <div className="line-divider"></div>
        <div className="spacing-24"></div>
        
        <h4 className="section-title">Current City</h4>
        <p className="text-color-grey booking-description">Miami, USA</p>
        <div className="spacing-24"></div>
        
        <h4 className="section-title">Currently Available For</h4>
        <div className="spacing-24"></div>
        
        <div className="job-types">
          {jobTypes.map((job, index) => (
            <div key={index} className="job-type-btn">
              <span>{job.name}</span>
              <job.icon size={20} />
            </div>
          ))}
        </div>
        
        <div className="spacing-24"></div>
      </div>
      
      <div className="content-wrapper">
        <h4 className="section-title">Send Job Request</h4>
        <div className="spacing-24"></div>
        <p className="text-color-grey booking-description">
          Currently accepting all paid job bookings.
        </p>
        
        <button onClick={onBookMe} className="book-me-card">
          <div className="book-me-content">
            <h3 className="book-me-heading">BOOK ME+</h3>
            <div className="spacing-16"></div>
            <div className="flex-wrapper flex-distribute">
              <span>Usually responds ~2 hours</span>
              <FaCalendar size={20} />
            </div>
            <div className="spacing-4"></div>
          </div>
        </button>
        
        <div className="spacing-48"></div>
        <div className="line-divider"></div>
      </div>
    </section>
  );
};

export default Booking; 
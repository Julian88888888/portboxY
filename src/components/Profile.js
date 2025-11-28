import React from 'react';
import { FaTwitter, FaLinkedin, FaInstagram, FaTiktok, FaYoutube, FaWhatsapp, FaSnapchat } from 'react-icons/fa';
import { BsSpotify } from 'react-icons/bs';

const Profile = ({ onBookMe }) => {
  const socialLinks = [
    { icon: FaTwitter, url: 'https://twitter.com/jmsbaduor', label: 'Twitter' },
    { icon: FaLinkedin, url: 'https://www.linkedin.com/in/jmsbaduor/', label: 'LinkedIn' },
    { icon: FaInstagram, url: 'https://www.instagram.com/jmsbaduor/', label: 'Instagram' },
    { icon: FaTiktok, url: '#', label: 'TikTok' },
    { icon: FaYoutube, url: '#', label: 'YouTube' },
    { icon: FaWhatsapp, url: '#', label: 'WhatsApp' },
    { icon: FaSnapchat, url: '#', label: 'Snapchat' },
    { icon: BsSpotify, url: '#', label: 'Spotify' }
  ];

  const stats = [
    { label: 'INDUSTRY', value: 'Fashion' },
    { label: 'STATUS', value: 'Professional' },
    { label: 'AGE', value: '23' },
    { label: 'GENDER', value: 'Female' },
    { label: 'MARKETS', value: 'Miami, Los Angeles, New York' },
    { label: 'AVAILABLE FOR', value: 'Beauty, Editorial, Glamour, Print' }
  ];

  return (
    <section className="section profile-section">
      <div className="content-wrapper content-align-center">
        <div className="spacing-48"></div>
        
        <div className="profile-wrapper">
          <img 
            src="/images/headshot_model.jpg" 
            alt="Mary Adams" 
            className="profile-image"
          />
        </div>
        
        <div className="spacing-24"></div>
        
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
        
        <div className="flex-wrapper flex-center">
          {socialLinks.map((social, index) => (
            <a 
              key={index}
              href={social.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="icon-wrapper"
              aria-label={social.label}
            >
              <social.icon size={20} />
            </a>
          ))}
        </div>
        
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
          ))}
        </div>
        
        <div className="spacing-24"></div>
        <div className="spacing-24"></div>
        
        <button onClick={onBookMe} className="book-me-btn">
          Book Me
        </button>
        
        <div className="spacing-48"></div>
      </div>
    </section>
  );
};

export default Profile; 
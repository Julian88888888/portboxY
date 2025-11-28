import React from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { BsSpotify } from 'react-icons/bs';

const Links = () => {
  const links = [
    { 
      icon: '/images/onlyfans-logo-15222.png', 
      text: 'My Exclusive Content',
      url: '#'
    },
    { 
      icon: null, 
      text: 'New merch out now, 50% discount 🥳',
      url: '#'
    },
    { 
      icon: null, 
      text: 'Amazon Wishlist',
      url: '#'
    }
  ];

  const mediaLinks = [
    { 
      icon: BsSpotify, 
      text: 'My New Song',
      url: '#'
    },
    { 
      icon: '/images/vimeo-logo.png', 
      text: 'Daily Videos',
      url: '#'
    },
    { 
      icon: '/images/Square_Cash_app_logo.png', 
      text: 'Gift Me',
      url: '#'
    }
  ];

  return (
    <section className="section links-section">
      <div className="content-wrapper large-banner-btn">
        <div className="spacing-48"></div>
        
        <h4 className="section-title links-heading">My Links</h4>
        <div className="spacing-24"></div>
        
        <div className="link-cloud-grid">
          {links.map((link, index) => (
            <a key={index} href={link.url} className="link-item">
              <div className="link-content">
                {link.icon && (
                  <img src={link.icon} alt="" className="icon-32x32" />
                )}
                <span className="link-text">{link.text}</span>
              </div>
              <FaExternalLinkAlt size={20} color="#783FF3" />
            </a>
          ))}
        </div>
        
        <div className="spacing-24"></div>
        
        <div className="three-col-grid">
          {mediaLinks.map((link, index) => (
            <a key={index} href={link.url} className="card-link photo-block">
              {typeof link.icon === 'string' ? (
                <img src={link.icon} alt="" className="icon-32x32" />
              ) : (
                <link.icon size={32} />
              )}
              <div className="link-description">{link.text}</div>
            </a>
          ))}
        </div>
        
        <div className="spacing-48"></div>
        
        <a href="#" className="card-link photo-block large-link">
          <BsSpotify size={32} />
          <div className="link-description">My New Song</div>
        </a>
        
        <div className="spacing-24"></div>
        
        <div className="youtube-embed">
          <iframe 
            src="https://www.youtube.com/embed/uV2BhlTnG8A?rel=0&controls=1&autoplay=0&mute=0&start=0" 
            frameBorder="0" 
            allow="autoplay; encrypted-media" 
            allowFullScreen 
            title="Get To Know Me! Photoshoot BTS"
            style={{
              width: '100%',
              height: '400px',
              borderRadius: '12px'
            }}
          />
        </div>
        
        <div className="spacing-24"></div>
      </div>
    </section>
  );
};

export default Links; 
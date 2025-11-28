import React, { useState } from 'react';
import { FaFolder } from 'react-icons/fa';

const Portfolio = () => {
  const [activeTab, setActiveTab] = useState('headshots');

  const portfolioTabs = [
    { id: 'headshots', label: 'Headshots', icon: FaFolder },
    { id: 'high-fashion', label: 'High Fashion', icon: FaFolder },
    { id: 'glamour', label: 'Glamour', icon: FaFolder }
  ];

  const measurements = [
    { label: 'HEIGHT', value: "5'11\"" },
    { label: 'WEIGHT', value: '135 lbs' },
    { label: 'BUST', value: '23A' },
    { label: 'WAIST', value: '26' },
    { label: 'HIPS', value: '36' },
    { label: 'SHOE', value: '7 US' }
  ];

  return (
    <section className="section portfolio-section">
      <div className="content-wrapper">
        <h4 className="section-title">Portfolio</h4>
        <div className="spacing-24"></div>
        
        <div className="portfolio-menu">
          {portfolioTabs.map((tab) => (
            <button
              key={tab.id}
              className={`job-type-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.label}</span>
              <tab.icon size={20} />
            </button>
          ))}
        </div>
        
        <div className="grid">
          {/* Portfolio images would go here */}
          <div className="portfolio-placeholder">
            <div className="placeholder-content">
              <FaFolder size={48} color="#ddd" />
              <p>Portfolio images would be displayed here</p>
            </div>
          </div>
          <div className="portfolio-placeholder">
            <div className="placeholder-content">
              <FaFolder size={48} color="#ddd" />
              <p>Portfolio images would be displayed here</p>
            </div>
          </div>
          <div className="portfolio-placeholder">
            <div className="placeholder-content">
              <FaFolder size={48} color="#ddd" />
              <p>Portfolio images would be displayed here</p>
            </div>
          </div>
          <div className="portfolio-placeholder">
            <div className="placeholder-content">
              <FaFolder size={48} color="#ddd" />
              <p>Portfolio images would be displayed here</p>
            </div>
          </div>
          <div className="portfolio-placeholder">
            <div className="placeholder-content">
              <FaFolder size={48} color="#ddd" />
              <p>Portfolio images would be displayed here</p>
            </div>
          </div>
          <div className="portfolio-placeholder video">
            <div className="placeholder-content">
              <FaFolder size={48} color="#ddd" />
              <p>Video content would be displayed here</p>
            </div>
          </div>
        </div>
        
        <div className="spacing-24"></div>
        
        <div className="measurements-container">
          <div className="stats-grid">
            {measurements.map((measurement, index) => (
              <div key={index} className="stat-item">
                <div className="stat-label">{measurement.label}</div>
                <div className="stat-value">{measurement.value}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="spacing-24"></div>
        <div className="spacing-24"></div>
        
        <div className="line-divider"></div>
        <div className="spacing-48"></div>
      </div>
    </section>
  );
};

export default Portfolio; 
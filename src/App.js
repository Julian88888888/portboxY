import React, { useState } from 'react';
import { FaCalendar } from 'react-icons/fa';
import PortfolioSection from './components/PortfolioSection';
import MissedDMSection from './components/MissedDMSection';
import Footer from './components/Footer';
import HomeSection from './components/HomeSection';
import ModelPage from './components/ModelPage';
import EditProfile from './components/EditProfile';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import './components/index.css';
import './App.css';
import AuthOnlyBlock from './components/AuthOnlyBlock';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('main'); // 'main', 'model', 'edit-profile', or 'dashboard'
  const [dashboardTab, setDashboardTab] = useState('Tab 1'); // Dashboard tab state
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSidebarToggle = (isOpen) => {
    setSidebarOpen(isOpen);
  };

  return (
    <AuthProvider>
      <div className="App">
        <AuthOnlyBlock />
        
        {/* Sidebar Navigation */}
        <Sidebar 
          currentPage={currentPage} 
          onPageChange={handlePageChange}
          onToggle={handleSidebarToggle}
        />

        <div className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          {currentPage === 'model' ? (
            <ModelPage onEditProfile={() => handlePageChange('edit-profile')} />
          ) : currentPage === 'edit-profile' ? (
            <EditProfile onBackToModel={() => handlePageChange('model')} />
          ) : currentPage === 'dashboard' || currentPage === 'dashboard-profile' || currentPage === 'dashboard-portfolio' || currentPage === 'dashboard-bookings' || currentPage === 'dashboard-links' || currentPage === 'dashboard-settings' ? (
            <Dashboard 
              activeTab={
                currentPage === 'dashboard-profile' ? 'Tab 1' :
                currentPage === 'dashboard-portfolio' ? 'Tab 2' :
                currentPage === 'dashboard-bookings' ? 'Tab 3' :
                currentPage === 'dashboard-links' ? 'Tab 4' :
                currentPage === 'dashboard-settings' ? 'Tab 5' :
                'Tab 1'
              }
              onTabChange={(tab) => {
                const pageMap = {
                  'Tab 1': 'dashboard-profile',
                  'Tab 2': 'dashboard-portfolio',
                  'Tab 3': 'dashboard-bookings',
                  'Tab 4': 'dashboard-links',
                  'Tab 5': 'dashboard-settings'
                };
                const newPage = pageMap[tab] || 'dashboard-profile';
                setCurrentPage(newPage);
                setDashboardTab(tab);
              }}
            />
          ) : (
            <>
              <PortfolioSection />
              <MissedDMSection />
              <HomeSection />
              <Footer />
            </>
          )}
        </div>
      </div>
    </AuthProvider>
  );
}

export default App; 
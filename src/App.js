import React, { useState } from 'react';
import { FaCalendar } from 'react-icons/fa';
import PortfolioSection from './components/PortfolioSection';
import MissedDMSection from './components/MissedDMSection';
import Footer from './components/Footer';
import HomeSection from './components/HomeSection';
import ModelPage from './components/ModelPage';
import EditProfile from './components/EditProfile';
import HamburgerMenu from './components/HamburgerMenu';
import './components/index.css';
import AuthOnlyBlock from './components/AuthOnlyBlock';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('main'); // 'main', 'model', or 'edit-profile'

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <AuthProvider>
      <div className="App">
        <AuthOnlyBlock />
        
        {/* Hamburger Menu Navigation */}
        <HamburgerMenu 
          currentPage={currentPage} 
          onPageChange={handlePageChange} 
        />

        {currentPage === 'model' ? (
          <ModelPage onEditProfile={() => handlePageChange('edit-profile')} />
        ) : currentPage === 'edit-profile' ? (
          <EditProfile onBackToModel={() => handlePageChange('model')} />
        ) : (
          <>
            <PortfolioSection />
            <MissedDMSection />
            <HomeSection />
            <Footer />
          </>
        )}
      </div>
    </AuthProvider>
  );
}

export default App; 
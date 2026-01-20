import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import './components/index.css';
import './App.css';
import AuthOnlyBlock from './components/AuthOnlyBlock';
import { AuthProvider } from './contexts/AuthContext';
import MainPage from './pages/MainPage';
import ModelPage from './components/ModelPage';
import ProfilePage from './pages/ProfilePage';
import PortfolioPage from './pages/PortfolioPage';
import BookingsPage from './pages/BookingsPage';
import CustomLinksPage from './pages/CustomLinksPage';
import SettingsPage from './pages/SettingsPage';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSidebarToggle = (isOpen) => {
    setSidebarOpen(isOpen);
  };

  return (
    <div className="App">
      <AuthOnlyBlock />
      
      {/* Sidebar Navigation */}
      <Sidebar onToggle={handleSidebarToggle} />

      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/model/:username?" element={<ModelPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/links" element={<CustomLinksPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App; 
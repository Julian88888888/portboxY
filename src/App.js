import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import './components/index.css';
import './App.css';
import AuthOnlyBlock from './components/AuthOnlyBlock';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainPage from './pages/MainPage';
import ModelPage from './components/ModelPage';
import ProfilePage from './pages/ProfilePage';
import PortfolioPage from './pages/PortfolioPage';
import BookingsPage from './pages/BookingsPage';
import BookingChatPage from './pages/BookingChatPage';
import CustomLinksPage from './pages/CustomLinksPage';
import SettingsPage from './pages/SettingsPage';

function LegacyUserProfileRedirect() {
  const { username } = useParams();
  return <Navigate to={`/@${username}`} replace />;
}

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isAuthenticated } = useAuth();

  const handleSidebarToggle = (isOpen) => {
    setSidebarOpen(isOpen);
  };

  return (
    <div className="App">
      <AuthOnlyBlock />
      
      {/* Sidebar Navigation - only show when authenticated */}
      {isAuthenticated && <Sidebar onToggle={handleSidebarToggle} />}

      <div
        className={`main-content ${
          isAuthenticated ? (sidebarOpen ? 'sidebar-open' : 'sidebar-closed') : 'no-sidebar'
        }`}
      >
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<MainPage />} />
          <Route path="/user/:username" element={<LegacyUserProfileRedirect />} />
          <Route path="/user" element={<ModelPage />} />
          <Route path="/booking/chat/:bookingId" element={<BookingChatPage />} />
          
          {/* Protected routes - require authentication */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/portfolio" 
            element={
              <ProtectedRoute>
                <PortfolioPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/bookings" 
            element={
              <ProtectedRoute>
                <BookingsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/links" 
            element={
              <ProtectedRoute>
                <CustomLinksPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />
          {/* /@handle — one URL segment (e.g. /@dev); React Router does not match /@:param */}
          <Route path="/:username" element={<ModelPage />} />
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
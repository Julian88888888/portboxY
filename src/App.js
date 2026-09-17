import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
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

function canonicalProfilePath(rawUsername, search = '', hash = '') {
  const handle = String(rawUsername || '')
    .trim()
    .replace(/^@+/, '')
    .toLowerCase();
  if (!handle) return '/';
  return `/@${handle}${search || ''}${hash || ''}`;
}

function LegacyUserProfileRedirect() {
  const { username } = useParams();
  const location = useLocation();
  return <Navigate to={canonicalProfilePath(username, location.search, location.hash)} replace />;
}

function PublicProfileRoute() {
  const { username } = useParams();
  const location = useLocation();
  const canonical = canonicalProfilePath(username, location.search, location.hash);
  const current = `${location.pathname}${location.search || ''}${location.hash || ''}`;
  if (canonical !== current) {
    return <Navigate to={canonical} replace />;
  }
  return <ModelPage />;
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
          <Route path="/:username" element={<PublicProfileRoute />} />
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
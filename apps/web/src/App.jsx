import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider } from '@/contexts/AuthContext';
import { AdminProvider } from '@/contexts/AdminContext';
import { JoinModalProvider } from '@/contexts/JoinModalContext';

import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import EventsPage from '@/pages/EventsPage';
import ActivitiesPage from '@/pages/ActivitiesPage';
import GalleryPage from '@/pages/GalleryPage';
import LoginPage from '@/pages/LoginPage';
import MyHoursPage from '@/pages/MyHoursPage';
import TeamPage from '@/pages/TeamPage';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminLoginPage from '@/pages/AdminLoginPage';

import ProtectedRoute from '@/components/ProtectedRoute';
import ProtectedAdminRoute from '@/components/ProtectedAdminRoute';
import ScrollToTop from '@/components/ScrollToTop';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
          <JoinModalProvider>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/activities" element={<ActivitiesPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/team" element={<TeamPage />} />
              
              <Route path="/my-hours" element={
                <ProtectedRoute>
                  <MyHoursPage />
                </ProtectedRoute>
              } />

              <Route path="/admin-login" element={<AdminLoginPage />} />
              <Route path="/admin" element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              } />
            </Routes>
          </JoinModalProvider>
        </AdminProvider>
      </AuthProvider>
      <Toaster />
    </Router>
  );
}

export default App;

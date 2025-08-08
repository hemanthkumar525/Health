import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import Recommendations from './pages/Recommendations';
import Tracking from './pages/Tracking';
import Auth from './pages/Auth';
import supabase from './lib/supabase';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [userProfile, setUserProfile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
  // Check if user profile is in localStorage (manual auth)
  const savedProfile = localStorage.getItem('healthProfile');
  if (savedProfile) {
    const profile = JSON.parse(savedProfile);
    setUserProfile(profile);
    setUser({ id: profile.id, email: profile.email }); // Minimal user object
  }
  setLoading(false);
}, []);


  const handleLogout = () => {
  localStorage.removeItem('healthProfile');
  setUser(null);
  setUserProfile(null);
};


  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.3
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
        <span className="ml-3 text-gray-600">Loading your health data...</span>
      </div>
    );
  }

  // Use for protected routes
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/auth" replace />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={
          user ? <Navigate to="/dashboard" replace /> : <Auth setUserProfile={setUserProfile} />
        } />
        
        <Route path="*" element={
          <div className="flex h-screen bg-gray-50">
            <Sidebar 
              currentPage={currentPage} 
              setCurrentPage={setCurrentPage}
              isOpen={sidebarOpen}
              setIsOpen={setSidebarOpen}
              user={user}
              userProfile={userProfile}
              onLogout={handleLogout}
            />
            
            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                  className="h-full"
                >
                  <Routes>
                    <Route path="/" element={
                      <ProtectedRoute>
                        <Dashboard userProfile={userProfile} />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Dashboard userProfile={userProfile} />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <Profile 
                          userProfile={userProfile} 
                          setUserProfile={setUserProfile}
                          userId={user?.id}
                        />
                      </ProtectedRoute>
                    } />
                    <Route path="/reports" element={
                      <ProtectedRoute>
                        <Reports 
                          userProfile={userProfile}
                          userId={user?.id}
                        />
                      </ProtectedRoute>
                    } />
                    <Route path="/recommendations" element={
                      <ProtectedRoute>
                        <Recommendations 
                          userProfile={userProfile}
                          userId={user?.id}
                        />
                      </ProtectedRoute>
                    } />
                    <Route path="/tracking" element={
                      <ProtectedRoute>
                        <Tracking 
                          userProfile={userProfile}
                          userId={user?.id}
                        />
                      </ProtectedRoute>
                    } />
                  </Routes>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
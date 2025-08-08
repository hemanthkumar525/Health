import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { 
  FiHome, 
  FiUser, 
  FiFileText, 
  FiTarget, 
  FiTrendingUp, 
  FiMenu, 
  FiActivity,
  FiLogOut,
  FiSettings
} = FiIcons;

const Sidebar = ({ isOpen, setIsOpen, user, userProfile, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome, path: '/dashboard' },
    { id: 'profile', label: 'Health Profile', icon: FiUser, path: '/profile' },
    { id: 'reports', label: 'Medical Reports', icon: FiFileText, path: '/reports' },
    { id: 'recommendations', label: 'AI Recommendations', icon: FiTarget, path: '/recommendations' },
    { id: 'tracking', label: 'Progress Tracking', icon: FiTrendingUp, path: '/tracking' },
  ];

  const handleLogout = () => {
    onLogout();
    navigate('/auth');
  };

  return (
    <motion.div 
      className={`fixed left-0 top-0 h-full bg-white shadow-xl z-50 transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'}`}
      initial={false}
      animate={{ width: isOpen ? 256 : 64 }}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-3"
            animate={{ opacity: isOpen ? 1 : 0 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiActivity} className="text-white text-lg" />
            </div>
            {isOpen && <h1 className="text-xl font-bold text-gray-800">HealthAI</h1>}
          </motion.div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <SafeIcon icon={FiMenu} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* User Info */}
      {isOpen && user && (
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium">
                {userProfile?.name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-800 truncate max-w-[180px]">
                {userProfile?.name || user.email?.split('@')[0] || 'User'}
              </span>
              {user.email && (
                <span className="text-xs text-gray-500 truncate max-w-[180px]">{user.email}</span>
              )}
            </div>
          </div>
        </div>
      )}

      <nav className="mt-6">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/dashboard');
          return (
            <motion.button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center px-4 py-3 text-left transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 border-r-3 border-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
              whileHover={{ x: isOpen ? 4 : 0 }}
              whileTap={{ scale: 0.98 }}
            >
              <SafeIcon 
                icon={item.icon} 
                className={`text-xl ${isActive ? 'text-blue-600' : 'text-gray-500'}`} 
              />
              {isOpen && (
                <motion.span 
                  className="ml-3 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {item.label}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {user ? (
          <motion.button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-left transition-all duration-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800"
            whileHover={{ x: isOpen ? 4 : 0 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiLogOut} className="text-xl text-gray-500" />
            {isOpen && (
              <motion.span 
                className="ml-3 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                Log Out
              </motion.span>
            )}
          </motion.button>
        ) : (
          <motion.button
            onClick={() => navigate('/auth')}
            className="w-full flex items-center px-4 py-3 text-left transition-all duration-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800"
            whileHover={{ x: isOpen ? 4 : 0 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiUser} className="text-xl text-gray-500" />
            {isOpen && (
              <motion.span 
                className="ml-3 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                Log In
              </motion.span>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default Sidebar;
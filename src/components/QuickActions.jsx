import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiUpload, FiEdit, FiTarget, FiCalendar } = FiIcons;

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'upload',
      label: 'Upload Report',
      icon: FiUpload,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => navigate('/reports')
    },
    {
      id: 'profile',
      label: 'Update Profile',
      icon: FiEdit,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => navigate('/profile')
    },
    {
      id: 'goals',
      label: 'Set Goals',
      icon: FiTarget,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => navigate('/tracking')
    },
    {
      id: 'track',
      label: 'Daily Log',
      icon: FiCalendar,
      color: 'bg-orange-500 hover:bg-orange-600',
      action: () => navigate('/tracking')
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-lg"
    >
      <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <motion.button
            key={action.id}
            onClick={action.action}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`${action.color} text-white p-4 rounded-lg transition-colors duration-200 flex flex-col items-center space-y-2`}
          >
            <SafeIcon icon={action.icon} className="text-xl" />
            <span className="text-sm font-medium">{action.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default QuickActions;
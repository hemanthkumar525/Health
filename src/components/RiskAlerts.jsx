import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiAlertTriangle, FiInfo, FiCheckCircle, FiX } = FiIcons;

const RiskAlerts = ({ userProfile }) => {
  const alerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Cholesterol Levels',
      message: 'Your LDL cholesterol is borderline high. Consider dietary changes.',
      priority: 'medium',
      action: 'Schedule follow-up'
    },
    {
      id: 2,
      type: 'info',
      title: 'Vitamin D',
      message: 'Low vitamin D levels detected. Supplementation recommended.',
      priority: 'low',
      action: 'Consult doctor'
    },
    {
      id: 3,
      type: 'success',
      title: 'Blood Pressure',
      message: 'Your blood pressure is within optimal range. Keep it up!',
      priority: 'positive',
      action: 'Continue current routine'
    }
  ];

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning': return FiAlertTriangle;
      case 'info': return FiInfo;
      case 'success': return FiCheckCircle;
      default: return FiInfo;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'warning': return 'text-orange-500';
      case 'info': return 'text-blue-500';
      case 'success': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getAlertBg = (type) => {
    switch (type) {
      case 'warning': return 'bg-orange-50 border-orange-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      case 'success': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-lg"
    >
      <h3 className="text-xl font-bold text-gray-800 mb-4">Health Alerts</h3>
      
      <div className="space-y-4">
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border ${getAlertBg(alert.type)}`}
          >
            <div className="flex items-start space-x-3">
              <SafeIcon 
                icon={getAlertIcon(alert.type)} 
                className={`text-lg mt-0.5 ${getAlertColor(alert.type)}`} 
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-1">{alert.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                <button className={`text-xs font-medium ${getAlertColor(alert.type)} hover:underline`}>
                  {alert.action}
                </button>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <SafeIcon icon={FiX} className="text-sm" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RiskAlerts;

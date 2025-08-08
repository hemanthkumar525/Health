import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import DailyTracking from '../components/tracking/DailyTracking';
import ProgressCharts from '../components/tracking/ProgressCharts';
import Goals from '../components/tracking/Goals';

const { FiCalendar, FiTrendingUp, FiTarget } = FiIcons;

const Tracking = ({ userProfile, userId }) => {
  const [activeTab, setActiveTab] = useState('daily');

  const tabs = [
    { id: 'daily', label: 'Daily Tracking', icon: FiCalendar },
    { id: 'progress', label: 'Progress Charts', icon: FiTrendingUp },
    { id: 'goals', label: 'Health Goals', icon: FiTarget },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Progress Tracking</h1>
          <p className="text-indigo-100">
            Track your daily health metrics and monitor your progress
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={tab.icon} className="text-lg" />
                  <span>{tab.label}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'daily' && <DailyTracking userId={userId} />}
            {activeTab === 'progress' && <ProgressCharts userId={userId} />}
            {activeTab === 'goals' && <Goals userProfile={userProfile} userId={userId} />}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Tracking;
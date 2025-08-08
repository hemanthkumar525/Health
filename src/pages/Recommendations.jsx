import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import AIRecommendations from '../components/recommendations/AIRecommendations';
import LifestyleChanges from '../components/recommendations/LifestyleChanges';
import Cautions from '../components/recommendations/Cautions';

const { FiBrain, FiTarget, FiAlertTriangle } = FiIcons;

const Recommendations = ({ userProfile }) => {
  const [activeTab, setActiveTab] = useState('ai');
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate AI analysis
    setTimeout(() => {
      generateRecommendations();
      setLoading(false);
    }, 2000);
  }, [userProfile]);

  const generateRecommendations = () => {
    const recs = {
      lifestyle: [
        {
          id: 1,
          category: 'Exercise',
          recommendation: 'Increase cardio activity to 150 minutes per week',
          priority: 'high',
          reason: 'Based on your age and current fitness level',
          target: '30 min daily walking',
          timeline: '4 weeks'
        },
        {
          id: 2,
          category: 'Diet',
          recommendation: 'Reduce sodium intake to under 2300mg daily',
          priority: 'medium',
          reason: 'Family history of hypertension',
          target: 'Low-sodium meals',
          timeline: '2 weeks'
        },
        {
          id: 3,
          category: 'Sleep',
          recommendation: 'Maintain consistent sleep schedule of 7-8 hours',
          priority: 'medium',
          reason: 'Better recovery and immune function',
          target: '10 PM - 6 AM schedule',
          timeline: '1 week'
        }
      ],
      cautions: [
        {
          id: 1,
          type: 'warning',
          title: 'Cholesterol Monitoring',
          description: 'Your recent lipid profile shows borderline high cholesterol. Monitor regularly.',
          action: 'Schedule follow-up in 3 months'
        },
        {
          id: 2,
          type: 'info',
          title: 'Vitamin D Deficiency',
          description: 'Low vitamin D levels detected. Consider supplementation.',
          action: 'Consult with doctor about supplements'
        }
      ],
      aiInsights: [
        'Your health score has improved by 8% over the last month',
        'Cardiovascular risk is within normal range for your age group',
        'Sleep quality improvements needed for optimal recovery',
        'Dietary changes showing positive impact on cholesterol levels'
      ]
    };
    setRecommendations(recs);
  };

  const tabs = [
    { id: 'ai', label: 'AI Insights', icon: FiBrain },
    { id: 'lifestyle', label: 'Lifestyle Changes', icon: FiTarget },
    { id: 'cautions', label: 'Health Alerts', icon: FiAlertTriangle },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
        />
        <span className="ml-3 text-gray-600">Generating AI recommendations...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">AI Recommendations</h1>
          <p className="text-purple-100">
            Personalized health recommendations powered by artificial intelligence
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
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
            {activeTab === 'ai' && (
              <AIRecommendations 
                insights={recommendations?.aiInsights} 
                userProfile={userProfile}
              />
            )}
            {activeTab === 'lifestyle' && (
              <LifestyleChanges 
                recommendations={recommendations?.lifestyle}
              />
            )}
            {activeTab === 'cautions' && (
              <Cautions 
                cautions={recommendations?.cautions}
              />
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Recommendations;
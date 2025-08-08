import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiBrain, FiCheckCircle, FiInfo, FiZap } = FiIcons;

const AIRecommendations = ({ insights, userProfile }) => {
  const recommendations = [
    {
      id: 1,
      category: 'Cardiovascular Health',
      priority: 'high',
      title: 'Optimize Heart Health',
      description: 'Based on your recent lipid profile and family history, focus on cardiovascular wellness.',
      actions: [
        'Increase omega-3 fatty acids (fish, walnuts, flax seeds)',
        'Aim for 150 minutes of moderate cardio per week',
        'Monitor blood pressure regularly',
        'Consider CoQ10 supplementation'
      ],
      aiConfidence: 92,
      icon: FiCheckCircle,
      color: 'red'
    },
    {
      id: 2,
      category: 'Metabolic Health',
      priority: 'medium',
      title: 'Blood Sugar Optimization',
      description: 'Your glucose levels are trending positively. Maintain current lifestyle with minor adjustments.',
      actions: [
        'Continue intermittent fasting schedule',
        'Add 10 minutes post-meal walking',
        'Include more fiber-rich vegetables',
        'Monitor HbA1c every 3 months'
      ],
      aiConfidence: 88,
      icon: FiZap,
      color: 'yellow'
    },
    {
      id: 3,
      category: 'Immune System',
      priority: 'medium',
      title: 'Boost Immune Function',
      description: 'Vitamin D deficiency detected. Strengthen immune system with targeted interventions.',
      actions: [
        'Vitamin D3 supplementation (2000 IU daily)',
        'Increase sun exposure (15-20 min daily)',
        'Add zinc-rich foods (pumpkin seeds, beef)',
        'Prioritize 7-8 hours of quality sleep'
      ],
      aiConfidence: 85,
      icon: FiInfo,
      color: 'green'
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (color) => {
    const colors = {
      red: 'bg-red-50 border-red-200 text-red-700',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      green: 'bg-green-50 border-green-200 text-green-700',
      blue: 'bg-blue-50 border-blue-200 text-blue-700'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* AI Insights Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white"
      >
        <div className="flex items-center space-x-3 mb-4">
          <SafeIcon icon={FiBrain} className="text-2xl" />
          <h2 className="text-xl font-bold">AI Health Insights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights?.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 rounded-lg p-3"
            >
              <p className="text-purple-100">{insight}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Detailed Recommendations */}
      <div className="space-y-6">
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className={`border rounded-xl p-6 ${getCategoryColor(rec.color)}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg">
                  <SafeIcon icon={rec.icon} className="text-xl text-gray-700" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{rec.title}</h3>
                  <p className="text-sm opacity-80">{rec.category}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(rec.priority)}`}>
                  {rec.priority.toUpperCase()} PRIORITY
                </span>
                <div className="text-right">
                  <div className="text-xs opacity-70">AI Confidence</div>
                  <div className="text-sm font-bold">{rec.aiConfidence}%</div>
                </div>
              </div>
            </div>

            <p className="mb-4 opacity-90">{rec.description}</p>

            <div className="space-y-3">
              <h4 className="font-semibold">Recommended Actions:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rec.actions.map((action, actionIndex) => (
                  <motion.div
                    key={actionIndex}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index * 0.2) + (actionIndex * 0.1) }}
                    className="flex items-start space-x-2 bg-white/50 p-3 rounded-lg"
                  >
                    <SafeIcon icon={FiCheckCircle} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{action}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-70">Estimated Impact: High</span>
                <span className="text-sm opacity-70">Timeline: 2-4 weeks</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AIRecommendations;
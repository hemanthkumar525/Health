import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiActivity, FiHeart, FiMoon, FiCheck, FiClock, FiTarget } = FiIcons;

const LifestyleChanges = ({ recommendations }) => {
  const [completedActions, setCompletedActions] = useState(new Set());

  const toggleAction = (recId, actionIndex) => {
    const actionKey = `${recId}-${actionIndex}`;
    const newCompleted = new Set(completedActions);
    
    if (newCompleted.has(actionKey)) {
      newCompleted.delete(actionKey);
    } else {
      newCompleted.add(actionKey);
    }
    
    setCompletedActions(newCompleted);
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'exercise': return FiActivity;
      case 'diet': return FiHeart;
      case 'sleep': return FiMoon;
      default: return FiTarget;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {recommendations?.map((rec, index) => (
        <motion.div
          key={rec.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <SafeIcon 
                  icon={getCategoryIcon(rec.category)} 
                  className="text-xl text-blue-600" 
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">{rec.recommendation}</h3>
                <p className="text-sm text-gray-600">{rec.category}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${getPriorityColor(rec.priority)}`}></div>
              <span className="text-sm font-medium text-gray-600 capitalize">{rec.priority} Priority</span>
            </div>
          </div>

          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Why this matters:</strong> {rec.reason}
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <SafeIcon icon={FiTarget} className="text-blue-500" />
                <span>Target: {rec.target}</span>
              </div>
              <div className="flex items-center space-x-1">
                <SafeIcon icon={FiClock} className="text-green-500" />
                <span>Timeline: {rec.timeline}</span>
              </div>
            </div>
          </div>

          {/* Action Steps */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">Action Steps:</h4>
            <div className="space-y-2">
              {[rec.recommendation].map((action, actionIndex) => {
                const actionKey = `${rec.id}-${actionIndex}`;
                const isCompleted = completedActions.has(actionKey);
                
                return (
                  <motion.div
                    key={actionIndex}
                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                      isCompleted 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    whileHover={{ scale: 1.01 }}
                  >
                    <button
                      onClick={() => toggleAction(rec.id, actionIndex)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isCompleted
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {isCompleted && (
                        <SafeIcon icon={FiCheck} className="text-white text-xs" />
                      )}
                    </button>
                    <span className={`flex-1 ${isCompleted ? 'text-green-700 line-through' : 'text-gray-700'}`}>
                      {action}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Progress Tracking */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm font-medium text-gray-800">
                {Array.from(completedActions).filter(key => key.startsWith(`${rec.id}-`)).length} / 1 completed
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-green-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${(Array.from(completedActions).filter(key => key.startsWith(`${rec.id}-`)).length / 1) * 100}%` 
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>
      ))}

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white"
      >
        <h3 className="text-lg font-bold mb-2">Your Progress Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{completedActions.size}</div>
            <div className="text-sm text-blue-100">Actions Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{recommendations?.length || 0}</div>
            <div className="text-sm text-blue-100">Total Recommendations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {recommendations?.filter(r => r.priority === 'high').length || 0}
            </div>
            <div className="text-sm text-blue-100">High Priority</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {Math.round((completedActions.size / (recommendations?.length || 1)) * 100)}%
            </div>
            <div className="text-sm text-blue-100">Completion Rate</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LifestyleChanges;
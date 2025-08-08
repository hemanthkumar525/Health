import React from 'react';
import { motion } from 'framer-motion';

const LifestyleInfo = ({ data, updateData }) => {
  const handleChange = (field, value) => {
    updateData({ [field]: value }); // send only one field change
  };

  const questions = [
    {
      field: 'smoking',
      label: 'Do you smoke?',
      options: [
        { value: 'no', label: 'No, never' },
        { value: 'former', label: 'Former smoker' },
        { value: 'occasional', label: 'Occasionally' },
        { value: 'daily', label: 'Daily smoker' }
      ]
    },
    {
      field: 'alcohol',
      label: 'Alcohol consumption',
      options: [
        { value: 'none', label: 'None' },
        { value: 'occasional', label: 'Occasional (1-2 drinks/week)' },
        { value: 'moderate', label: 'Moderate (3-7 drinks/week)' },
        { value: 'heavy', label: 'Heavy (8+ drinks/week)' }
      ]
    },
    {
      field: 'exercise',
      label: 'Exercise frequency',
      options: [
        { value: 'none', label: 'No regular exercise' },
        { value: 'light', label: 'Light (1-2 times/week)' },
        { value: 'moderate', label: 'Moderate (3-4 times/week)' },
        { value: 'intense', label: 'Intense (5+ times/week)' }
      ]
    },
    {
      field: 'diet',
      label: 'Diet type',
      options: [
        { value: 'balanced', label: 'Balanced diet' },
        { value: 'vegetarian', label: 'Vegetarian' },
        { value: 'vegan', label: 'Vegan' },
        { value: 'keto', label: 'Ketogenic' },
        { value: 'mediterranean', label: 'Mediterranean' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      field: 'sleep',
      label: 'Average sleep duration',
      options: [
        { value: '<5', label: 'Less than 5 hours' },
        { value: '5-6', label: '5-6 hours' },
        { value: '7-8', label: '7-8 hours' },
        { value: '9+', label: '9+ hours' }
      ]
    },
    {
      field: 'stress',
      label: 'Stress level',
      options: [
        { value: 'low', label: 'Low stress' },
        { value: 'moderate', label: 'Moderate stress' },
        { value: 'high', label: 'High stress' },
        { value: 'severe', label: 'Severe stress' }
      ]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {questions.map((question, index) => (
          <motion.div
            key={question.field}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <label className="block text-sm font-medium text-gray-700">
              {question.label}
            </label>
            <select
              value={data?.[question.field] || ''}
              onChange={(e) => handleChange(question.field, e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Select an option</option>
              {question.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </motion.div>
        ))}
      </div>

      {/* Lifestyle Score */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 p-4 rounded-lg border border-green-200"
      >
        <h4 className="font-semibold text-green-800 mb-2">Lifestyle Assessment</h4>
        <div className="text-sm text-green-700">
          Based on your responses, we'll provide personalized recommendations to improve your health outcomes.
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LifestyleInfo;

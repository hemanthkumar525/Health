import React from 'react';
import { motion } from 'framer-motion';

const BasicInfo = ({ data, updateData }) => {
  const handleChange = (field, value) => {
    updateData({ ...data, [field]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={data.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age
          </label>
          <input
            type="number"
            value={data.age || ''}
            onChange={(e) => handleChange('age', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter your age"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender
          </label>
          <select
            value={data.gender || ''}
            onChange={(e) => handleChange('gender', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Height (cm)
          </label>
          <input
            type="number"
            value={data.height || ''}
            onChange={(e) => handleChange('height', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter your height"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Weight (kg)
          </label>
          <input
            type="number"
            value={data.weight || ''}
            onChange={(e) => handleChange('weight', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter your weight"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blood Type
          </label>
          <select
            value={data.bloodType || ''}
            onChange={(e) => handleChange('bloodType', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">Select blood type</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
      </div>

      {/* BMI Calculation */}
      {data.height && data.weight && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 p-4 rounded-lg border border-blue-200"
        >
          <h4 className="font-semibold text-blue-800 mb-2">Body Mass Index (BMI)</h4>
          <div className="text-2xl font-bold text-blue-600">
            {((data.weight / (data.height / 100)) ** 2).toFixed(1)}
          </div>
          <div className="text-sm text-blue-600">
            {(() => {
              const bmi = (data.weight / (data.height / 100)) ** 2;
              if (bmi < 18.5) return 'Underweight';
              if (bmi < 25) return 'Normal weight';
              if (bmi < 30) return 'Overweight';
              return 'Obese';
            })()}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default BasicInfo;
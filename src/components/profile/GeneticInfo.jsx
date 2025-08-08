import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiPlus, FiX, FiInfo } = FiIcons;

const GeneticInfo = ({ data, updateData }) => {
  const [newRiskFactor, setNewRiskFactor] = useState('');

  const handleChange = (field, value) => {
    updateData({ ...data, [field]: value });
  };

  const addRiskFactor = () => {
    if (newRiskFactor.trim()) {
      const currentFactors = data.riskFactors || [];
      updateData({ ...data, riskFactors: [...currentFactors, newRiskFactor.trim()] });
      setNewRiskFactor('');
    }
  };

  const removeRiskFactor = (index) => {
    const currentFactors = data.riskFactors || [];
    updateData({ ...data, riskFactors: currentFactors.filter((_, i) => i !== index) });
  };

  const commonRiskFactors = [
    'BRCA1/BRCA2 mutations',
    'Factor V Leiden',
    'APOE4 variant',
    'Lynch syndrome',
    'Familial hypercholesterolemia',
    'Sickle cell trait',
    'Tay-Sachs carrier',
    'Cystic fibrosis carrier'
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Info Banner */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-3">
          <SafeIcon icon={FiInfo} className="text-blue-500 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Genetic Information</p>
            <p>This information helps our AI provide more accurate risk assessments and personalized recommendations. All genetic data is kept strictly confidential.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ethnicity
          </label>
          <select
            value={data.ethnicity || ''}
            onChange={(e) => handleChange('ethnicity', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">Select ethnicity</option>
            <option value="caucasian">Caucasian</option>
            <option value="african">African/African American</option>
            <option value="asian">Asian</option>
            <option value="hispanic">Hispanic/Latino</option>
            <option value="native">Native American</option>
            <option value="pacific">Pacific Islander</option>
            <option value="mixed">Mixed</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Genetic Risk Factors */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-800">Known Genetic Risk Factors</h4>
        
        <div className="flex space-x-2">
          <input
            type="text"
            value={newRiskFactor}
            onChange={(e) => setNewRiskFactor(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addRiskFactor()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter genetic risk factor"
          />
          <button
            onClick={addRiskFactor}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <SafeIcon icon={FiPlus} />
          </button>
        </div>

        {/* Common Risk Factors */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Common genetic risk factors:</p>
          <div className="flex flex-wrap gap-2">
            {commonRiskFactors.map((factor) => (
              <button
                key={factor}
                onClick={() => {
                  const currentFactors = data.riskFactors || [];
                  if (!currentFactors.includes(factor)) {
                    updateData({ ...data, riskFactors: [...currentFactors, factor] });
                  }
                }}
                className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                {factor}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Risk Factors */}
        <div className="space-y-2">
          {data.riskFactors?.map((factor, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between bg-red-50 px-3 py-2 rounded-lg border border-red-200"
            >
              <span className="text-red-700">{factor}</span>
              <button
                onClick={() => removeRiskFactor(index)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <SafeIcon icon={FiX} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default GeneticInfo;
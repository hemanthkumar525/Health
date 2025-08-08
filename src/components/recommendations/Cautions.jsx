import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiAlertTriangle, FiInfo, FiShield, FiX, FiClock, FiPhone } = FiIcons;

const Cautions = ({ cautions }) => {
  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning': return FiAlertTriangle;
      case 'info': return FiInfo;
      case 'critical': return FiShield;
      default: return FiInfo;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'warning': return 'border-orange-200 bg-orange-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      case 'critical': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'warning': return 'text-orange-500';
      case 'info': return 'text-blue-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const additionalCautions = [
    {
      id: 3,
      type: 'critical',
      title: 'Blood Pressure Monitoring',
      description: 'Family history indicates increased risk. Monitor blood pressure weekly.',
      action: 'Schedule cardiology consultation',
      urgency: 'high',
      timeline: 'Within 2 weeks'
    },
    {
      id: 4,
      type: 'warning',
      title: 'Exercise Limitations',
      description: 'Recent knee injury may affect recommended exercise routine. Modify as needed.',
      action: 'Consult physical therapist',
      urgency: 'medium',
      timeline: 'Next month'
    }
  ];

  const allCautions = [...(cautions || []), ...additionalCautions];

  return (
    <div className="space-y-6">
      {/* Emergency Contact Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-500 text-white rounded-xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <SafeIcon icon={FiPhone} className="text-2xl" />
          <h2 className="text-xl font-bold">Emergency Contacts</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-600 rounded-lg p-3">
            <div className="font-semibold">Emergency Services</div>
            <div className="text-red-100">911</div>
          </div>
          <div className="bg-red-600 rounded-lg p-3">
            <div className="font-semibold">Primary Care</div>
            <div className="text-red-100">(555) 123-4567</div>
          </div>
          <div className="bg-red-600 rounded-lg p-3">
            <div className="font-semibold">Poison Control</div>
            <div className="text-red-100">1-800-222-1222</div>
          </div>
        </div>
      </motion.div>

      {/* Health Alerts */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800">Health Alerts & Cautions</h3>
        
        {allCautions.map((caution, index) => (
          <motion.div
            key={caution.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`border rounded-xl p-6 ${getAlertColor(caution.type)}`}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-2 rounded-lg bg-white ${getIconColor(caution.type)}`}>
                <SafeIcon 
                  icon={getAlertIcon(caution.type)} 
                  className="text-xl"
                />
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-bold text-gray-800">{caution.title}</h4>
                  <div className="flex items-center space-x-2">
                    {caution.urgency && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        caution.urgency === 'high' 
                          ? 'bg-red-100 text-red-800' 
                          : caution.urgency === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {caution.urgency.toUpperCase()} URGENCY
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4">{caution.description}</p>
                
                <div className="bg-white rounded-lg p-4 mb-4">
                  <h5 className="font-semibold text-gray-800 mb-2">Recommended Action:</h5>
                  <p className="text-gray-700">{caution.action}</p>
                </div>
                
                {caution.timeline && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <SafeIcon icon={FiClock} className="text-gray-500" />
                    <span>Timeline: {caution.timeline}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Prevention Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border border-blue-200 rounded-xl p-6"
      >
        <h3 className="text-lg font-bold text-blue-800 mb-4">Prevention & Safety Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-blue-700">Daily Precautions:</h4>
            <ul className="space-y-2 text-sm text-blue-600">
              <li>• Monitor blood pressure daily</li>
              <li>• Take medications as prescribed</li>
              <li>• Stay hydrated (8+ glasses water)</li>
              <li>• Avoid excessive salt intake</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-blue-700">Warning Signs to Watch:</h4>
            <ul className="space-y-2 text-sm text-blue-600">
              <li>• Chest pain or discomfort</li>
              <li>• Shortness of breath</li>
              <li>• Unusual fatigue</li>
              <li>• Severe headaches</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Medication Interactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-yellow-50 border border-yellow-200 rounded-xl p-6"
      >
        <h3 className="text-lg font-bold text-yellow-800 mb-4">Medication & Supplement Cautions</h3>
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Potential Interactions:</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Blood thinners may interact with vitamin K supplements</li>
              <li>• Grapefruit juice can affect cholesterol medications</li>
              <li>• NSAIDs may increase blood pressure</li>
            </ul>
          </div>
          <p className="text-sm text-yellow-700">
            Always consult your healthcare provider before starting new medications or supplements.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Cautions;
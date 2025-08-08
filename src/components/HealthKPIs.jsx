import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiHeart, FiActivity, FiShield, FiTrendingUp, FiThermometer, FiZap } = FiIcons;

const HealthKPIs = ({ userProfile, healthScore }) => {
  const kpis = [
    {
      id: 'cardiovascular',
      label: 'Cardiovascular Health',
      value: 85,
      unit: '%',
      icon: FiHeart,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      trend: '+2%',
      status: 'good'
    },
    {
      id: 'fitness',
      label: 'Fitness Level',
      value: 72,
      unit: '%',
      icon: FiActivity,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      trend: '+5%',
      status: 'improving'
    },
    {
      id: 'immunity',
      label: 'Immune System',
      value: 78,
      unit: '%',
      icon: FiShield,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      trend: '+1%',
      status: 'stable'
    },
    {
      id: 'metabolic',
      label: 'Metabolic Health',
      value: 68,
      unit: '%',
      icon: FiZap,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      trend: '-3%',
      status: 'attention'
    },
    {
      id: 'stress',
      label: 'Stress Level',
      value: 35,
      unit: '%',
      icon: FiThermometer,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      trend: '-8%',
      status: 'improving'
    },
    {
      id: 'overall',
      label: 'Overall Trend',
      value: healthScore,
      unit: '/100',
      icon: FiTrendingUp,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      trend: '+4%',
      status: 'improving'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'improving': return 'text-blue-600';
      case 'stable': return 'text-gray-600';
      case 'attention': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {kpis.map((kpi, index) => (
        <motion.div
          key={kpi.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
              <SafeIcon icon={kpi.icon} className={`text-xl ${kpi.color}`} />
            </div>
            <div className={`text-sm font-medium ${getStatusColor(kpi.status)}`}>
              {kpi.trend}
            </div>
          </div>
          
          <div className="mb-2">
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold text-gray-900">{kpi.value}</span>
              <span className="text-sm text-gray-500">{kpi.unit}</span>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 mb-3">{kpi.label}</div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full ${kpi.color.replace('text-', 'bg-')}`}
              initial={{ width: 0 }}
              animate={{ width: `${kpi.value}%` }}
              transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default HealthKPIs;

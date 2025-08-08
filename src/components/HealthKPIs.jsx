import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';

const { FiHeart, FiActivity, FiShield, FiTrendingUp, FiThermometer, FiZap } = FiIcons;

const HealthKPIs = ({ userProfile, healthScore }) => {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealthMetrics = async () => {
      if (!userProfile?.id) return;

      try {
        // Fetch the latest metrics for each type
        const { data, error } = await supabase
          .from('tracking')
          .select('metric, value, logged_at')
          .eq('user_id', userProfile.id)
          .order('logged_at', { ascending: false });

        if (error) {
          console.error('Error fetching health metrics:', error);
          setKpis(getDefaultKpis());
          return;
        }

        // Get the most recent value for each metric
        const latestMetrics = {};
        data.forEach(record => {
          if (!latestMetrics[record.metric]) {
            latestMetrics[record.metric] = record.value;
          }
        });

        // Calculate trends (comparing latest vs previous values)
        const trends = await calculateTrends(data);

        // Build KPIs array from fetched data
        const dynamicKpis = buildKpisFromData(latestMetrics, trends, healthScore);
        setKpis(dynamicKpis);

      } catch (error) {
        console.error('Error in fetchHealthMetrics:', error);
        setKpis(getDefaultKpis());
      } finally {
        setLoading(false);
      }
    };

    fetchHealthMetrics();
  }, [userProfile?.id, healthScore]);

  const calculateTrends = async (data) => {
    const trends = {};
    
    // Group data by metric
    const metricGroups = {};
    data.forEach(record => {
      if (!metricGroups[record.metric]) {
        metricGroups[record.metric] = [];
      }
      metricGroups[record.metric].push(record);
    });

    // Calculate trend for each metric
    Object.keys(metricGroups).forEach(metric => {
      const records = metricGroups[metric];
      if (records.length >= 2) {
        const latest = records[0].value;
        const previous = records[1].value;
        const change = ((latest - previous) / previous * 100).toFixed(1);
        trends[metric] = change >= 0 ? `+${change}%` : `${change}%`;
      } else {
        trends[metric] = '0%';
      }
    });

    return trends;
  };

  const buildKpisFromData = (metrics, trends, overallScore) => {
    const kpiConfig = {
      cardiovascular: {
        id: 'cardiovascular',
        label: 'Cardiovascular Health',
        icon: FiHeart,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        unit: '%'
      },
      fitness: {
        id: 'fitness',
        label: 'Fitness Level',
        icon: FiActivity,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        unit: '%'
      },
      immunity: {
        id: 'immunity',
        label: 'Immune System',
        icon: FiShield,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        unit: '%'
      },
      metabolic: {
        id: 'metabolic',
        label: 'Metabolic Health',
        icon: FiZap,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        unit: '%'
      },
      stress: {
        id: 'stress',
        label: 'Stress Level',
        icon: FiThermometer,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50',
        unit: '%'
      }
    };

    const result = [];

    // Add metrics from database
    Object.keys(kpiConfig).forEach(metricKey => {
      const config = kpiConfig[metricKey];
      const value = metrics[metricKey] || getDefaultValue(metricKey);
      const trend = trends[metricKey] || '0%';
      
      result.push({
        ...config,
        value: Math.round(value),
        trend,
        status: getStatusFromValue(value, trend)
      });
    });

    // Add overall trend
    result.push({
      id: 'overall',
      label: 'Overall Trend',
      value: overallScore || 75,
      unit: '/100',
      icon: FiTrendingUp,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      trend: calculateOverallTrend(trends),
      status: 'improving'
    });

    return result;
  };

  const getDefaultValue = (metricKey) => {
    const defaults = {
      cardiovascular: 85,
      fitness: 72,
      immunity: 78,
      metabolic: 68,
      stress: 35
    };
    return defaults[metricKey] || 70;
  };

  const getStatusFromValue = (value, trend) => {
    const trendValue = parseFloat(trend.replace('%', ''));
    
    if (value >= 80) return 'good';
    if (trendValue > 0) return 'improving';
    if (trendValue < -2) return 'attention';
    return 'stable';
  };

  const calculateOverallTrend = (trends) => {
    const trendValues = Object.values(trends)
      .map(t => parseFloat(t.replace('%', '')))
      .filter(v => !isNaN(v));
    
    if (trendValues.length === 0) return '+4%';
    
    const avgTrend = trendValues.reduce((sum, val) => sum + val, 0) / trendValues.length;
    return avgTrend >= 0 ? `+${avgTrend.toFixed(1)}%` : `${avgTrend.toFixed(1)}%`;
  };

  const getDefaultKpis = () => [
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
      value: healthScore || 75,
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-lg animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="w-12 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="mb-2">
              <div className="w-16 h-8 bg-gray-200 rounded"></div>
            </div>
            <div className="w-24 h-4 bg-gray-200 rounded mb-3"></div>
            <div className="w-full h-2 bg-gray-200 rounded-full"></div>
          </div>
        ))}
      </div>
    );
  }
  if (!loading && kpis.length === 0) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg col-span-full">
      <p className="text-gray-500">No data found.</p>
    </div>
  );
}


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

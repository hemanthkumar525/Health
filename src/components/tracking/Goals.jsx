import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import supabase from '../../lib/supabase';

const { FiTrendingUp, FiTrendingDown, FiMinus, FiCalendar } = FiIcons;

const ProgressCharts = ({ userId }) => {
  const [timeRange, setTimeRange] = useState('30days');
  const [selectedMetric, setSelectedMetric] = useState('weight');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabase
          .from('tracking')
          .select('metric, value, logged_at')
          .eq('user_id', userId)
          .gte('logged_at', startDate.toISOString())
          .lte('logged_at', endDate.toISOString())
          .order('logged_at', { ascending: true });

        if (error) throw error;

        // Group metrics by date
        const grouped = {};
        data.forEach(row => {
          const dateKey = new Date(row.logged_at).toISOString().split('T')[0];
          if (!grouped[dateKey]) {
            grouped[dateKey] = { 
              date: dateKey,
              weight: null,
              bloodPressureSys: null,
              bloodPressureDia: null,
              heartRate: null,
              steps: null,
              sleep: null,
              energy: null
            };
          }
          
          // Map database metric names to chart data keys
          let metricKey = row.metric;
          if (row.metric === 'blood_pressure_systolic') metricKey = 'bloodPressureSys';
          if (row.metric === 'blood_pressure_diastolic') metricKey = 'bloodPressureDia';
          
          grouped[dateKey][metricKey] = Number(row.value);
        });

        setChartData(Object.values(grouped));
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError('Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, timeRange]);

  const metrics = {
    weight: { label: 'Weight (kg)', color: '#3b82f6', target: 70 },
    bloodPressureSys: { label: 'Systolic BP (mmHg)', color: '#ef4444', target: 120 },
    bloodPressureDia: { label: 'Diastolic BP (mmHg)', color: '#f59e0b', target: 80 },
    heartRate: { label: 'Heart Rate (bpm)', color: '#10b981', target: 70 },
    steps: { label: 'Daily Steps', color: '#8b5cf6', target: 10000 },
    sleep: { label: 'Sleep Hours', color: '#06b6d4', target: 8 },
    energy: { label: 'Energy Level (1-5)', color: '#f97316', target: 4 }
  };

  const getTrend = (data, metric) => {
    if (data.length < 2) return 'stable';
    
    // Filter out null values and get recent valid data points
    const validData = data.filter(d => d[metric] !== null && d[metric] !== undefined);
    if (validData.length < 2) return 'stable';
    
    const recent = validData.slice(-Math.min(7, validData.length)).reduce((sum, d) => sum + d[metric], 0) / Math.min(7, validData.length);
    const previous = validData.slice(-Math.min(14, validData.length), -Math.min(7, validData.length));
    
    if (previous.length === 0) return 'stable';
    
    const previousAvg = previous.reduce((sum, d) => sum + d[metric], 0) / previous.length;
    
    if (recent > previousAvg * 1.05) return 'up';
    if (recent < previousAvg * 0.95) return 'down';
    return 'stable';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return FiTrendingUp;
      case 'down': return FiTrendingDown;
      default: return FiMinus;
    }
  };

  const getTrendColor = (trend, isGood) => {
    if (trend === 'stable') return 'text-gray-500';
    if ((trend === 'up' && isGood) || (trend === 'down' && !isGood)) return 'text-green-500';
    return 'text-red-500';
  };

  const isPositiveTrend = (metric, trend) => {
    const positiveUp = ['steps', 'sleep', 'energy'];
    const positiveDown = ['weight', 'bloodPressureSys', 'bloodPressureDia', 'heartRate'];
    
    if (positiveUp.includes(metric)) return trend === 'up';
    if (positiveDown.includes(metric)) return trend === 'down';
    return false;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
        <span className="ml-3 text-gray-500">Loading charts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No tracking data available for the selected time range.</p>
        <p className="text-gray-400 text-sm mt-2">Start tracking your health metrics to see charts here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiCalendar} className="text-gray-500" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 3 Months</option>
          </select>
        </div>

        <select
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {Object.entries(metrics).map(([key, metric]) => (
            <option key={key} value={key}>{metric.label}</option>
          ))}
        </select>
      </div>

      {/* Main Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            {metrics[selectedMetric].label} Trend
          </h3>
          <div className="flex items-center space-x-2">
            {(() => {
              const trend = getTrend(chartData, selectedMetric);
              const isGood = isPositiveTrend(selectedMetric, trend);
              return (
                <>
                  <SafeIcon 
                    icon={getTrendIcon(trend)} 
                    className={getTrendColor(trend, isGood)}
                  />
                  <span className={`text-sm font-medium ${getTrendColor(trend, isGood)}`}>
                    {trend === 'up' ? 'Increasing' : trend === 'down' ? 'Decreasing' : 'Stable'}
                  </span>
                </>
              );
            })()}
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Area 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke={metrics[selectedMetric].color}
                fill={metrics[selectedMetric].color}
                fillOpacity={0.2}
                strokeWidth={3}
                connectNulls={false}
              />
              {/* Target line */}
              <Line 
                type="monotone" 
                dataKey={() => metrics[selectedMetric].target}
                stroke="#94a3b8"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(metrics).map(([key, metric], index) => {
          const trend = getTrend(chartData, key);
          const isGood = isPositiveTrend(key, trend);
          const validEntries = chartData.filter(d => d[key] !== null && d[key] !== undefined);
          const currentValue = validEntries.length > 0 ? validEntries[validEntries.length - 1][key] : 0;
          
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-xl p-6 shadow-lg border-2 transition-colors cursor-pointer ${
                selectedMetric === key ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
              }`}
              onClick={() => setSelectedMetric(key)}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800 text-sm">{metric.label}</h4>
                <SafeIcon 
                  icon={getTrendIcon(trend)} 
                  className={`${getTrendColor(trend, isGood)} text-lg`}
                />
              </div>
              
              <div className="mb-2">
                <span className="text-2xl font-bold text-gray-900">
                  {typeof currentValue === 'number' ? currentValue.toFixed(1) : currentValue || 'N/A'}
                </span>
              </div>
              
              <div className="text-xs text-gray-500">
                Target: {metric.target}
              </div>
              
              <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
                <motion.div
                  className="h-1 rounded-full"
                  style={{ backgroundColor: metric.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${currentValue ? Math.min((currentValue / metric.target) * 100, 100) : 0}%` }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Weekly Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-6">Weekly Activity Summary</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.slice(-7)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
              />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="steps" 
                fill="#8b5cf6" 
                radius={[4, 4, 0, 0]}
                name="Daily Steps"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default ProgressCharts;
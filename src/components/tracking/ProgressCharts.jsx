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
  const [data, setData] = useState([]);
  const [goals, setGoals] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const metrics = {
    weight: { label: 'Weight (kg)', color: '#3b82f6', target: 70 },
    bloodPressureSys: { label: 'Systolic BP (mmHg)', color: '#ef4444', target: 120 },
    bloodPressureDia: { label: 'Diastolic BP (mmHg)', color: '#f59e0b', target: 80 },
    heartRate: { label: 'Heart Rate (bpm)', color: '#10b981', target: 70 },
    steps: { label: 'Daily Steps', color: '#8b5cf6', target: 10000 },
    sleep: { label: 'Sleep Hours', color: '#06b6d4', target: 8 },
    energy: { label: 'Energy Level (1-5)', color: '#f97316', target: 4 }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      try {
        setLoading(true);

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
        startDate.setDate(endDate.getDate() - days);

        // Fetch tracking data
        const { data: trackingData, error: trackingError } = await supabase
          .from('tracking')
          .select('metric, value, logged_at')
          .eq('user_id', userId)
          .gte('logged_at', startDate.toISOString())
          .lte('logged_at', endDate.toISOString())
          .order('logged_at', { ascending: true });

        if (trackingError) throw trackingError;

        // Fetch goals
        const { data: goalsData, error: goalsError } = await supabase
          .from('tracking')
          .select('metric, value')
          .eq('user_id', userId)
          .in('metric', ['goal_weight', 'goal_steps', 'goal_sleep_hours', 'goal_bloodPressureSys', 'goal_bloodPressureDia', 'goal_heartRate', 'goal_energy'])
          .order('logged_at', { ascending: false });

        if (goalsError) throw goalsError;

        // Map goals
        const mappedGoals = {};
        goalsData.forEach(row => {
          const metricKey = row.metric.replace('goal_', '');
          mappedGoals[metricKey] = row.value;
        });

        // Update metrics with user goals
        const updatedMetrics = { ...metrics };
        Object.keys(mappedGoals).forEach(key => {
          if (updatedMetrics[key]) {
            updatedMetrics[key].target = mappedGoals[key];
          }
        });

        // Group tracking data by date
        const grouped = {};
        trackingData.forEach(row => {
          const dateKey = new Date(row.logged_at).toISOString().split('T')[0];
          if (!grouped[dateKey]) {
            grouped[dateKey] = { date: dateKey };
          }
          grouped[dateKey][row.metric] = row.value;
        });

        // Fill missing dates with null values and sort
        const chartData = [];
        for (let i = days; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateKey = date.toISOString().split('T')[0];
          
          chartData.push({
            date: dateKey,
            weight: grouped[dateKey]?.weight || null,
            bloodPressureSys: grouped[dateKey]?.bloodPressureSys || null,
            bloodPressureDia: grouped[dateKey]?.bloodPressureDia || null,
            heartRate: grouped[dateKey]?.heartRate || null,
            steps: grouped[dateKey]?.steps || null,
            sleep: grouped[dateKey]?.sleep || null,
            energy: grouped[dateKey]?.energy || null
          });
        }

        setData(chartData);
        setGoals(mappedGoals);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, timeRange]);

  const getTrend = (data, metric) => {
    const validData = data.filter(d => d[metric] !== null);
    if (validData.length < 14) return 'stable';
    
    const recent = validData.slice(-7).reduce((sum, d) => sum + d[metric], 0) / 7;
    const previous = validData.slice(-14, -7).reduce((sum, d) => sum + d[metric], 0) / 7;
    
    if (recent > previous * 1.05) return 'up';
    if (recent < previous * 0.95) return 'down';
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

  const getMetricTarget = (metricKey) => {
    return goals[metricKey] || metrics[metricKey].target;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading charts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
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
              const trend = getTrend(data, selectedMetric);
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
            <AreaChart data={data}>
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
                dataKey={() => getMetricTarget(selectedMetric)}
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
          const trend = getTrend(data, key);
          const isGood = isPositiveTrend(key, trend);
          const validData = data.filter(d => d[key] !== null);
          const currentValue = validData.length > 0 ? validData[validData.length - 1][key] : 0;
          const target = getMetricTarget(key);
          
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
                  {typeof currentValue === 'number' ? currentValue.toFixed(1) : '–'}
                </span>
              </div>
              
              <div className="text-xs text-gray-500">
                Target: {target}
              </div>
              
              <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
                <motion.div
                  className="h-1 rounded-full"
                  style={{ backgroundColor: metric.color }}
                  initial={{ width: 0 }}
                  animate={{ width: currentValue ? `${Math.min((currentValue / target) * 100, 100)}%` : '0%' }}
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
            <BarChart data={data.slice(-7)}>
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
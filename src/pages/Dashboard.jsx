import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import HealthKPIs from '../components/HealthKPIs';
import HealthTrends from '../components/HealthTrends';
import RiskAlerts from '../components/RiskAlerts';
import QuickActions from '../components/QuickActions';
import supabase from '../lib/supabase';

const { FiUser, FiActivity, FiHeart, FiBrain, FiShield } = FiIcons;

const Dashboard = ({ userProfile }) => {
  const [healthScore, setHealthScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState(null);
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    // Simulate AI analysis and fetch data
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Check if user is logged in and has a profile
        if (userProfile?.user_id) {
          // Fetch health metrics
          const { data: metricsData, error: metricsError } = await supabase
            .from('health_metrics')
            .select('*')
            .eq('user_id', userProfile.user_id)
            .order('recorded_at', { ascending: false })
            .limit(30);
            
          if (metricsError) throw metricsError;
          
          // Process metrics for trend data
          if (metricsData && metricsData.length > 0) {
            // Transform metrics data into the format expected by charts
            const processedTrends = processMetricsForTrends(metricsData);
            setTrendData(processedTrends);
          }
          
          // Calculate health score based on profile data and metrics
          const score = calculateHealthScore(userProfile, metricsData);
          setHealthScore(score);
          
          // Fetch any additional health data
          const { data: healthData, error: healthError } = await supabase
            .from('health_assessments')
            .select('*')
            .eq('user_id', userProfile.user_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
            
          if (healthError && healthError.code !== 'PGRST116') {
            // Only throw if it's not a "no rows returned" error
            throw healthError;
          }
          
          if (healthData) {
            setHealthData(healthData);
          }
        } else {
          // No user profile, use demo data
          setHealthScore(75); // Default score
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userProfile]);

  const processMetricsForTrends = (metrics) => {
    // Group metrics by day
    const groupedByDay = {};
    
    metrics.forEach(metric => {
      const date = new Date(metric.recorded_at).toISOString().split('T')[0];
      if (!groupedByDay[date]) {
        groupedByDay[date] = [];
      }
      groupedByDay[date].push(metric);
    });
    
    // Convert to array format expected by charts
    return Object.keys(groupedByDay).map(date => {
      const dayMetrics = groupedByDay[date];
      const avgMetrics = {
        date,
        month: new Date(date).toLocaleString('default', { month: 'short' })
      };
      
      // Calculate averages for each metric type
      dayMetrics.forEach(metric => {
        if (metric.weight) avgMetrics.weight = metric.weight;
        if (metric.blood_pressure_systolic) avgMetrics.bloodPressure = metric.blood_pressure_systolic;
        if (metric.blood_pressure_diastolic) avgMetrics.bloodPressureDia = metric.blood_pressure_diastolic;
        if (metric.heart_rate) avgMetrics.heartRate = metric.heart_rate;
        if (metric.steps) avgMetrics.steps = metric.steps;
        if (metric.sleep_hours) avgMetrics.sleep = metric.sleep_hours;
      });
      
      return avgMetrics;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const calculateHealthScore = (profile, metrics) => {
    let score = 100;
    
    if (!profile) return 75; // Default score
    
    // Age factor
    if (profile.age > 60) score -= 10;
    else if (profile.age > 40) score -= 5;
    
    // Existing conditions
    if (profile.existingConditions?.length > 0) {
      score -= profile.existingConditions.length * 8;
    }
    
    // Lifestyle factors
    if (profile.lifestyle?.smoking === 'yes' || profile.lifestyle?.smoking === 'daily') score -= 15;
    if (profile.lifestyle?.smoking === 'occasional') score -= 8;
    if (profile.lifestyle?.alcohol === 'heavy') score -= 10;
    if (profile.lifestyle?.alcohol === 'moderate') score -= 5;
    if (profile.lifestyle?.exercise === 'none') score -= 12;
    if (profile.lifestyle?.exercise === 'light') score -= 6;
    
    // Metrics factors - if available
    if (metrics && metrics.length > 0) {
      const latestMetric = metrics[0];
      
      // Blood pressure
      if (latestMetric.blood_pressure_systolic > 140) score -= 10;
      else if (latestMetric.blood_pressure_systolic > 130) score -= 5;
      
      // Heart rate
      if (latestMetric.heart_rate > 100) score -= 8;
      else if (latestMetric.heart_rate < 50) score -= 5;
      
      // BMI calculation if weight and height available
      if (latestMetric.weight && profile.height) {
        const heightInMeters = profile.height / 100;
        const bmi = latestMetric.weight / (heightInMeters * heightInMeters);
        
        if (bmi > 30) score -= 15; // Obese
        else if (bmi > 25) score -= 8; // Overweight
        else if (bmi < 18.5) score -= 8; // Underweight
      }
    }
    
    return Math.max(score, 20);
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getHealthScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
        <span className="ml-3 text-gray-600">Analyzing your health data...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-6 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {userProfile?.name || 'User'}!
            </h1>
            <p className="text-blue-100">
              Here's your personalized health overview for today
            </p>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-bold ${getHealthScoreColor(healthScore)}`}>
              {healthScore}
            </div>
            <div className="text-sm text-blue-100">Health Score</div>
            <div className="text-xs text-blue-200">{getHealthScoreLabel(healthScore)}</div>
          </div>
        </div>
      </motion.div>

      {/* KPIs Grid */}
      <HealthKPIs userProfile={userProfile} healthScore={healthScore} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Trends */}
        <div className="lg:col-span-2">
          <HealthTrends userProfile={userProfile} trendData={trendData.length > 0 ? trendData : undefined} />
        </div>

        {/* Risk Alerts & Quick Actions */}
        <div className="space-y-6">
          <RiskAlerts userProfile={userProfile} />
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
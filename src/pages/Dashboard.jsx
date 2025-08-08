import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import HealthKPIs from '../components/HealthKPIs';
import HealthTrends from '../components/HealthTrends';
import RiskAlerts from '../components/RiskAlerts';
import QuickActions from '../components/QuickActions';
import supabase from '../lib/supabase';

const Dashboard = ({ userProfile }) => {
  const [healthData, setHealthData] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [healthScore, setHealthScore] = useState(75);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        if (userProfile?.id) {
          // Fetch health profile from Supabase
          const { data: profileData, error: profileError } = await supabase
            .from('health_profiles')
            .select('*')
            .eq('id', userProfile.id)
            .single();

          if (profileError) throw profileError;

          if (profileData) {
            setHealthData(profileData);
            const score = calculateHealthScore(profileData, []);
            setHealthScore(score);
          }

          // Fetch tracking data for trends
          const { data: trackingData, error: trackingError } = await supabase
            .from('tracking')
            .select('*')
            .eq('user_id', userProfile.id)
            .order('logged_at', { ascending: false })
            .limit(30);

          if (trackingError && trackingError.code !== 'PGRST116') {
            console.error('Error fetching tracking data:', trackingError);
          }

          if (trackingData && trackingData.length > 0) {
            const processedTrends = processTrackingForTrends(trackingData);
            setTrendData(processedTrends);
          }
        } else {
          setHealthScore(75); // fallback score if no profile
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userProfile]);

  const calculateHealthScore = (profile, tracking) => {
    let score = 75;
    if (profile?.weight && profile?.height) {
      const bmi = profile.weight / Math.pow(profile.height / 100, 2);
      if (bmi >= 18.5 && bmi <= 24.9) score += 10;
    }
    return Math.min(score, 100);
  };

  const processTrackingForTrends = (trackingData) => {
    const grouped = {};
    trackingData.forEach(row => {
      const dateKey = new Date(row.logged_at).toLocaleDateString();
      if (!grouped[dateKey]) grouped[dateKey] = { date: dateKey };
      grouped[dateKey][row.metric] = row.value;
    });
    return Object.values(grouped).reverse();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FiIcons.FiLoader className="animate-spin text-3xl text-gray-500" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      <h1 className="text-2xl font-bold flex items-center">
        <SafeIcon icon={FiIcons.FiUser} className="mr-2" />
        Welcome, {healthData?.name || 'User'}!
      </h1>

      <HealthKPIs profile={healthData} healthScore={healthScore} />

      {trendData.length > 0 && (
        <HealthTrends data={trendData} />
      )}

      <RiskAlerts profile={healthData} />

      <QuickActions />
    </motion.div>
  );
};

export default Dashboard;

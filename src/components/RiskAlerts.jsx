import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';

const { FiAlertTriangle, FiInfo, FiCheckCircle, FiX } = FiIcons;

const RiskAlerts = ({ userProfile }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateHealthAlerts = async () => {
      if (!userProfile?.id) return;

      try {
        // Fetch latest health profile data
        const { data: profileData, error: profileError } = await supabase
          .from('health_profiles')
          .select('*')
          .eq('user_id', userProfile.id)
          .single();

        // Fetch latest tracking data for each metric
        const { data: trackingData, error: trackingError } = await supabase
          .from('tracking')
          .select('metric, value, logged_at')
          .eq('user_id', userProfile.id)
          .order('logged_at', { ascending: false });

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching health profile:', profileError);
        }

        if (trackingError) {
          console.error('Error fetching tracking data:', trackingError);
          setAlerts([]);
          return;
        }

        // Get latest values for each metric
        const latestMetrics = {};
        if (trackingData) {
          trackingData.forEach(record => {
            if (!latestMetrics[record.metric]) {
              latestMetrics[record.metric] = record.value;
            }
          });
        }

        // Generate alerts based on data
        const generatedAlerts = await generateAlertsFromData(profileData, latestMetrics);
        setAlerts(generatedAlerts);

      } catch (error) {
        console.error('Error in generateHealthAlerts:', error);
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    generateHealthAlerts();
  }, [userProfile?.id]);

  const generateAlertsFromData = async (profileData, latestMetrics) => {
    const generatedAlerts = [];
    let alertId = 1;

    // Helper function to add alert
    const addAlert = (type, title, message, priority, action) => {
      generatedAlerts.push({
        id: alertId++,
        type,
        title,
        message,
        priority,
        action
      });
    };

    // Check cholesterol levels
    if (latestMetrics.cholesterol) {
      const cholesterol = latestMetrics.cholesterol;
      if (cholesterol > 200) {
        addAlert('warning', 'Cholesterol Levels', 
          `Your total cholesterol is ${cholesterol} mg/dL, which is above recommended levels. Consider dietary changes.`,
          'high', 'Schedule follow-up');
      } else if (cholesterol > 180) {
        addAlert('warning', 'Cholesterol Levels', 
          'Your cholesterol is borderline high. Consider dietary changes.',
          'medium', 'Schedule follow-up');
      } else {
        addAlert('success', 'Cholesterol Levels', 
          'Your cholesterol levels are within healthy range. Great work!',
          'positive', 'Continue current routine');
      }
    }

    // Check blood pressure
    if (latestMetrics.bloodPressure) {
      const bp = latestMetrics.bloodPressure;
      if (bp > 140) {
        addAlert('warning', 'Blood Pressure', 
          `Your blood pressure is ${bp} mmHg, which is elevated. Please consult your doctor.`,
          'high', 'Consult doctor immediately');
      } else if (bp > 130) {
        addAlert('info', 'Blood Pressure', 
          'Your blood pressure is slightly elevated. Monitor closely.',
          'medium', 'Monitor daily');
      } else {
        addAlert('success', 'Blood Pressure', 
          'Your blood pressure is within optimal range. Keep it up!',
          'positive', 'Continue current routine');
      }
    }

    // Check vitamin D levels
    if (latestMetrics.vitaminD) {
      const vitD = latestMetrics.vitaminD;
      if (vitD < 20) {
        addAlert('warning', 'Vitamin D', 
          'Severely low vitamin D levels detected. Immediate supplementation needed.',
          'high', 'Consult doctor');
      } else if (vitD < 30) {
        addAlert('info', 'Vitamin D', 
          'Low vitamin D levels detected. Supplementation recommended.',
          'low', 'Consult doctor');
      } else {
        addAlert('success', 'Vitamin D', 
          'Your vitamin D levels are adequate. Well done!',
          'positive', 'Maintain current intake');
      }
    }

    // Check glucose levels
    if (latestMetrics.glucose) {
      const glucose = latestMetrics.glucose;
      if (glucose > 125) {
        addAlert('warning', 'Blood Glucose', 
          `Elevated fasting glucose detected (${glucose} mg/dL). Diabetes screening recommended.`,
          'high', 'Schedule screening');
      } else if (glucose > 100) {
        addAlert('info', 'Blood Glucose', 
          'Slightly elevated glucose levels. Monitor your diet.',
          'medium', 'Monitor diet');
      }
    }

    // Check BMI if weight and height data available
    if (latestMetrics.weight && profileData?.height) {
      const heightM = profileData.height / 100; // Convert cm to m
      const bmi = latestMetrics.weight / (heightM * heightM);
      
      if (bmi > 30) {
        addAlert('warning', 'BMI Status', 
          `Your BMI is ${bmi.toFixed(1)}, indicating obesity. Consider lifestyle changes.`,
          'medium', 'Consult nutritionist');
      } else if (bmi > 25) {
        addAlert('info', 'BMI Status', 
          `Your BMI is ${bmi.toFixed(1)}, indicating overweight. Consider dietary adjustments.`,
          'low', 'Review diet plan');
      }
    }

    // Check hemoglobin levels
    if (latestMetrics.hemoglobin) {
      const hgb = latestMetrics.hemoglobin;
      const gender = profileData?.gender || 'male';
      const lowThreshold = gender === 'female' ? 12.0 : 13.5;
      const highThreshold = gender === 'female' ? 15.5 : 17.5;
      
      if (hgb < lowThreshold) {
        addAlert('warning', 'Hemoglobin Levels', 
          'Low hemoglobin detected. Possible anemia - consult your doctor.',
          'medium', 'Blood work needed');
      } else if (hgb > highThreshold) {
        addAlert('info', 'Hemoglobin Levels', 
          'Elevated hemoglobin levels detected. Follow up recommended.',
          'low', 'Schedule check-up');
      }
    }

    // Check age-related alerts
    if (profileData?.date_of_birth) {
      const age = calculateAge(profileData.date_of_birth);
      
      if (age >= 50 && !hasRecentScreening(latestMetrics)) {
        addAlert('info', 'Health Screening', 
          'Due for routine health screening based on your age.',
          'low', 'Schedule screening');
      }
    }

    // If no alerts generated and we have data, add a positive general message
    // If no data at all, we'll show "no data found" message
    if (generatedAlerts.length === 0 && Object.keys(latestMetrics).length > 0) {
      addAlert('success', 'Overall Health', 
        'Your health metrics look good! Keep up the great work.',
        'positive', 'Continue monitoring');
    }

    // Limit to 5 most important alerts
    return generatedAlerts
      .sort((a, b) => getPriorityWeight(a.priority) - getPriorityWeight(b.priority))
      .slice(0, 5);
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const hasRecentScreening = (metrics) => {
    // Check if user has recent comprehensive metrics
    const requiredMetrics = ['cholesterol', 'bloodPressure', 'glucose'];
    return requiredMetrics.every(metric => metrics[metric] !== undefined);
  };

  const getPriorityWeight = (priority) => {
    const weights = { high: 1, medium: 2, low: 3, positive: 4 };
    return weights[priority] || 5;
  };

  const getDefaultAlerts = () => [
    {
      id: 1,
      type: 'warning',
      title: 'Cholesterol Levels',
      message: 'Your LDL cholesterol is borderline high. Consider dietary changes.',
      priority: 'medium',
      action: 'Schedule follow-up'
    },
    {
      id: 2,
      type: 'info',
      title: 'Vitamin D',
      message: 'Low vitamin D levels detected. Supplementation recommended.',
      priority: 'low',
      action: 'Consult doctor'
    },
    {
      id: 3,
      type: 'success',
      title: 'Blood Pressure',
      message: 'Your blood pressure is within optimal range. Keep it up!',
      priority: 'positive',
      action: 'Continue current routine'
    }
  ];

  const handleDismissAlert = async (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    
    // Optional: Store dismissed alerts in database
    try {
      await supabase
        .from('dismissed_alerts')
        .insert({
          user_id: userProfile.id,
          alert_id: alertId,
          dismissed_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error storing dismissed alert:', error);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning': return FiAlertTriangle;
      case 'info': return FiInfo;
      case 'success': return FiCheckCircle;
      default: return FiInfo;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'warning': return 'text-orange-500';
      case 'info': return 'text-blue-500';
      case 'success': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getAlertBg = (type) => {
    switch (type) {
      case 'warning': return 'bg-orange-50 border-orange-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      case 'success': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4">Health Alerts</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="p-4 rounded-lg border bg-gray-50 animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-gray-200 rounded mt-0.5"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  // If no alerts to show, display no data message
  if (alerts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4">Health Alerts</h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <SafeIcon icon={FiInfo} className="text-4xl text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">No health data found</p>
          <p className="text-gray-400 text-xs mt-1">Start tracking your health metrics to see personalized alerts</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-lg"
    >
      <h3 className="text-xl font-bold text-gray-800 mb-4">Health Alerts</h3>
      
      <div className="space-y-4">
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border ${getAlertBg(alert.type)}`}
          >
            <div className="flex items-start space-x-3">
              <SafeIcon 
                icon={getAlertIcon(alert.type)} 
                className={`text-lg mt-0.5 ${getAlertColor(alert.type)}`} 
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-1">{alert.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                <button className={`text-xs font-medium ${getAlertColor(alert.type)} hover:underline`}>
                  {alert.action}
                </button>
              </div>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => handleDismissAlert(alert.id)}
              >
                <SafeIcon icon={FiX} className="text-sm" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RiskAlerts;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import supabase from '../../lib/supabase';

const { FiActivity, FiHeart, FiDroplet, FiMoon, FiPlus, FiCheck, FiAlertTriangle, FiX } = FiIcons;

const DailyTracking = ({ userId }) => {
  const [todayData, setTodayData] = useState({
    steps: 0,
    heartRate: 0,
    bloodPressure: { systolic: 0, diastolic: 0 },
    weight: 0,
    sleep: 0,
    water: 0,
    mood: '',
    energy: 0,
    symptoms: []
  });

  const [newSymptom, setNewSymptom] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  // Load latest entry when component mounts
  useEffect(() => {
    const fetchTodayData = async () => {
      if (!userId) return;
      
      try {
        const todayDate = new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase
          .from('tracking')
          .select('metric, value')
          .eq('user_id', userId)
          .gte('logged_at', `${todayDate}T00:00:00Z`)
          .lte('logged_at', `${todayDate}T23:59:59Z`);
          
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          const mapped = {};
          data.forEach(row => {
            if (row.metric === 'blood_pressure_systolic') {
              if (!mapped.bloodPressure) mapped.bloodPressure = { systolic: 0, diastolic: 0 };
              mapped.bloodPressure.systolic = row.value;
            } else if (row.metric === 'blood_pressure_diastolic') {
              if (!mapped.bloodPressure) mapped.bloodPressure = { systolic: 0, diastolic: 0 };
              mapped.bloodPressure.diastolic = row.value;
            } else if (row.metric === 'symptoms') {
              mapped.symptoms = Array.isArray(row.value) ? row.value : [];
            } else {
              mapped[row.metric] = row.value;
            }
          });
          
          setTodayData(prev => ({
            ...prev,
            steps: mapped.steps || 0,
            heartRate: mapped.heartRate || 0,
            bloodPressure: mapped.bloodPressure || { systolic: 0, diastolic: 0 },
            weight: mapped.weight || 0,
            sleep: mapped.sleep || 0,
            water: mapped.water || 0,
            mood: mapped.mood || '',
            energy: mapped.energy || 0,
            symptoms: mapped.symptoms || []
          }));
        }
      } catch (err) {
        console.error('Error fetching today\'s data:', err);
        setError('Failed to load your latest health data');
      }
    };
    
    fetchTodayData();
  }, [userId]);

  const quickMetrics = [
    {
      id: 'steps',
      label: 'Steps Today',
      value: todayData.steps,
      unit: 'steps',
      target: 10000,
      icon: FiActivity,
      color: 'blue'
    },
    {
      id: 'heartRate',
      label: 'Resting Heart Rate',
      value: todayData.heartRate,
      unit: 'bpm',
      target: 70,
      icon: FiHeart,
      color: 'red'
    },
    {
      id: 'water',
      label: 'Water Intake',
      value: todayData.water,
      unit: 'glasses',
      target: 8,
      icon: FiDroplet,
      color: 'blue'
    },
    {
      id: 'sleep',
      label: 'Sleep Duration',
      value: todayData.sleep,
      unit: 'hours',
      target: 8,
      icon: FiMoon,
      color: 'purple'
    }
  ];

  const updateMetric = (metric, value) => {
    setTodayData(prev => ({ ...prev, [metric]: value }));
  };

  const addSymptom = () => {
    if (newSymptom.trim()) {
      setTodayData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, { text: newSymptom.trim(), time: new Date().toLocaleTimeString() }]
      }));
      setNewSymptom('');
    }
  };

  const removeSymptom = (index) => {
    setTodayData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter((_, i) => i !== index)
    }));
  };

  const getProgressColor = (value, target) => {
    const percentage = (value / target) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const saveData = async () => {
    if (!userId) {
      setError('You must be logged in to save tracking data');
      return;
    }
    
    setSaving(true);
    setError('');
    setSaveSuccess(false);
    
    try {
      const todayDate = new Date().toISOString().split('T')[0];
      
      // Delete today's entries first
      const deleteResult = await supabase
        .from('tracking')
        .delete()
        .eq('user_id', userId)
        .gte('logged_at', `${todayDate}T00:00:00Z`)
        .lte('logged_at', `${todayDate}T23:59:59Z`);
      
      if (deleteResult.error) throw deleteResult.error;
      
      // Prepare rows for insertion
      const rows = [];
      const currentTime = new Date();
      
      // Add basic metrics
      if (todayData.steps) {
        rows.push({
          user_id: userId,
          metric: 'steps',
          value: Number(todayData.steps),
          logged_at: currentTime
        });
      }
      
      if (todayData.heartRate) {
        rows.push({
          user_id: userId,
          metric: 'heartRate',
          value: Number(todayData.heartRate),
          logged_at: currentTime
        });
      }
      
      if (todayData.bloodPressure.systolic) {
        rows.push({
          user_id: userId,
          metric: 'blood_pressure_systolic',
          value: Number(todayData.bloodPressure.systolic),
          logged_at: currentTime
        });
      }
      
      if (todayData.bloodPressure.diastolic) {
        rows.push({
          user_id: userId,
          metric: 'blood_pressure_diastolic',
          value: Number(todayData.bloodPressure.diastolic),
          logged_at: currentTime
        });
      }
      
      if (todayData.weight) {
        rows.push({
          user_id: userId,
          metric: 'weight',
          value: Number(todayData.weight),
          logged_at: currentTime
        });
      }
      
      if (todayData.sleep) {
        rows.push({
          user_id: userId,
          metric: 'sleep',
          value: Number(todayData.sleep),
          logged_at: currentTime
        });
      }
      
      if (todayData.water) {
        rows.push({
          user_id: userId,
          metric: 'water',
          value: Number(todayData.water),
          logged_at: currentTime
        });
      }
      
      if (todayData.energy) {
        rows.push({
          user_id: userId,
          metric: 'energy',
          value: Number(todayData.energy),
          logged_at: currentTime
        });
      }
      
      if (todayData.mood) {
        rows.push({
          user_id: userId,
          metric: 'mood',
          value: todayData.mood,
          logged_at: currentTime
        });
      }
      
      if (todayData.symptoms.length > 0) {
        rows.push({
          user_id: userId,
          metric: 'symptoms',
          value: JSON.stringify(todayData.symptoms),
          logged_at: currentTime
        });
      }
      
      // Insert new entries
      if (rows.length > 0) {
        const insertResult = await supabase
          .from('tracking')
          .insert(rows);
        
        if (insertResult.error) throw insertResult.error;
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving health metrics:', err);
      setError(`Failed to save data: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error/Success Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 p-4 rounded-lg border border-red-200 flex items-center space-x-3"
        >
          <SafeIcon icon={FiAlertTriangle} className="text-red-500" />
          <span className="text-red-700">{error}</span>
          <button 
            onClick={() => setError('')} 
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <SafeIcon icon={FiX} />
          </button>
        </motion.div>
      )}
      
      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 p-4 rounded-lg border border-green-200 flex items-center space-x-3"
        >
          <SafeIcon icon={FiCheck} className="text-green-500" />
          <span className="text-green-700">Your health data has been saved successfully!</span>
        </motion.div>
      )}

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickMetrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-2 rounded-lg bg-${metric.color}-100`}>
                <SafeIcon icon={metric.icon} className={`text-${metric.color}-600 text-xl`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{metric.label}</h3>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                  <span className="text-sm text-gray-500">{metric.unit}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress</span>
                <span>{Math.round((metric.value / metric.target) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${getProgressColor(metric.value, metric.target)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
                />
              </div>
              <div className="text-xs text-gray-500">Target: {metric.target} {metric.unit}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detailed Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vitals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">Vital Signs</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blood Pressure (mmHg)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={todayData.bloodPressure.systolic}
                  onChange={(e) => updateMetric('bloodPressure', {
                    ...todayData.bloodPressure,
                    systolic: parseInt(e.target.value)
                  })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Systolic"
                />
                <span className="py-2 text-gray-500">/</span>
                <input
                  type="number"
                  value={todayData.bloodPressure.diastolic}
                  onChange={(e) => updateMetric('bloodPressure', {
                    ...todayData.bloodPressure,
                    diastolic: parseInt(e.target.value)
                  })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Diastolic"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={todayData.weight}
                onChange={(e) => updateMetric('weight', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Energy Level (1-5)
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => updateMetric('energy', level)}
                    className={`w-10 h-10 rounded-full border-2 transition-colors ${
                      todayData.energy >= level
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'border-gray-300 text-gray-400 hover:border-gray-400'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sleep Hours
              </label>
              <input
                type="number"
                step="0.5"
                value={todayData.sleep}
                onChange={(e) => updateMetric('sleep', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Steps
              </label>
              <input
                type="number"
                value={todayData.steps}
                onChange={(e) => updateMetric('steps', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heart Rate (bpm)
              </label>
              <input
                type="number"
                value={todayData.heartRate}
                onChange={(e) => updateMetric('heartRate', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Water Glasses
              </label>
              <input
                type="number"
                value={todayData.water}
                onChange={(e) => updateMetric('water', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Symptoms & Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">Symptoms & Notes</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Symptom or Note
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newSymptom}
                  onChange={(e) => setNewSymptom(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSymptom()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Headache, Fatigue, Good mood"
                />
                <button
                  onClick={addSymptom}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <SafeIcon icon={FiPlus} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {todayData.symptoms.map((symptom, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                >
                  <div>
                    <span className="text-gray-800">{symptom.text}</span>
                    <span className="text-xs text-gray-500 ml-2">{symptom.time}</span>
                  </div>
                  <button
                    onClick={() => removeSymptom(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    ×
                  </button>
                </motion.div>
              ))}
            </div>
            
            {todayData.symptoms.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                No symptoms or notes added today
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mood
              </label>
              <select
                value={todayData.mood}
                onChange={(e) => updateMetric('mood', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select mood</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="neutral">Neutral</option>
                <option value="tired">Tired</option>
                <option value="stressed">Stressed</option>
                <option value="sad">Sad</option>
                <option value="anxious">Anxious</option>
              </select>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center"
      >
        <button 
          onClick={saveData}
          disabled={saving || !userId}
          className={`flex items-center space-x-2 px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium ${
            (saving || !userId) ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          {saving ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <SafeIcon icon={FiCheck} />
              <span>Save Today's Data</span>
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
};

export default DailyTracking;
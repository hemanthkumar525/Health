import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import BasicInfo from '../components/profile/BasicInfo';
import MedicalHistory from '../components/profile/MedicalHistory';
import LifestyleInfo from '../components/profile/LifestyleInfo';
import GeneticInfo from '../components/profile/GeneticInfo';
import supabase from '../lib/supabase';

const { FiUser, FiHeart, FiActivity, FiDna, FiSave, FiCheckCircle, FiAlertTriangle } = FiIcons;

const Profile = ({ userProfile, setUserProfile }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [profileData, setProfileData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  

  // Load profile
  useEffect(() => {
    let profile = userProfile;
    if (!profile) {
      const saved = localStorage.getItem('healthProfile');
      if (saved) profile = JSON.parse(saved);
    }
    if (profile) {
      // Ensure default structure exists
      setProfileData({
        ...profile,
        existingConditions: profile.existing_conditions || [],
        medications: profile.medications || [],
        allergies: profile.allergies || [],
        familyHistory: profile.family_history || [],
        lifestyle: profile.lifestyle || {
          smoking: 'no',
          alcohol: 'none',
          exercise: 'moderate',
          diet: 'balanced',
          sleep: '7-8'
        },
        genetics: profile.genetics || {
          bloodType: '',
          riskFactors: []
        }
      });
    }
  }, [userProfile]);

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: FiUser },
    { id: 'medical', label: 'Medical History', icon: FiHeart },
    { id: 'lifestyle', label: 'Lifestyle', icon: FiActivity },
    { id: 'genetic', label: 'Genetic Info', icon: FiDna },
  ];

  const handleSave = async () => {
    if (!profileData?.id) {
      setError('Profile not loaded');
      return;
    }

    setSaving(true);
    setError('');
    setSaveSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from('health_profiles')
        .update({
          name: profileData.name,
          age: profileData.age,
          gender: profileData.gender,
          height: profileData.height,
          weight: profileData.weight,
          existing_conditions: profileData.existingConditions,
          medications: profileData.medications,
          allergies: profileData.allergies,
          family_history: profileData.familyHistory,
          lifestyle: profileData.lifestyle,
          genetics: profileData.genetics,
          updated_at: new Date()
        })
        .eq('id', profileData.id);


      if (updateError) throw updateError;

      localStorage.setItem('healthProfile', JSON.stringify(profileData));
      setUserProfile(profileData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const updateProfileData = (section, data) => {
    setProfileData((prev) => ({
      ...prev,
      [section]: data
    }));
  };

  if (!profileData) return <div className="p-6">Loading profile...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Health Profile</h1>
          <p className="text-blue-100">Complete your profile for personalized AI recommendations</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={tab.icon} className="text-lg" />
                  <span>{tab.label}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'basic' && (
            <BasicInfo data={profileData} updateData={(data) => setProfileData({ ...profileData, ...data })} />
          )}
          {activeTab === 'medical' && (
            <MedicalHistory
  data={profileData}
  updateData={(field, value) =>
    setProfileData((prev) => ({
      ...prev,
      [field]: value
    }))
  }
/>

          )}
          {activeTab === 'lifestyle' && (
            <LifestyleInfo
  data={profileData.lifestyle}
  updateData={(updatedLifestyle) =>
    setProfileData((prev) => ({
      ...prev,
      lifestyle: {
        ...prev.lifestyle,
        ...updatedLifestyle
      }
    }))
  }
/>

          )}
          {activeTab === 'genetic' && (
            <GeneticInfo
  data={profileData.genetics}
  updateData={(updatedGenetics) =>
    setProfileData((prev) => ({
      ...prev,
      genetics: {
        ...prev.genetics,
        ...updatedGenetics
      }
    }))
  }
/>

          )}
        </div>

        {/* Save Button */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <motion.button
              onClick={handleSave}
              className={`bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 ${
                saving ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={saving}
            >
              {saving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <SafeIcon icon={FiSave} />
                  <span>Save Profile</span>
                </>
              )}
            </motion.button>

            {saveSuccess && (
              <div className="flex items-center space-x-2 text-green-600">
                <SafeIcon icon={FiCheckCircle} />
                <span>Profile saved successfully!</span>
              </div>
            )}

            {error && (
              <div className="flex items-center space-x-2 text-red-600">
                <SafeIcon icon={FiAlertTriangle} />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;

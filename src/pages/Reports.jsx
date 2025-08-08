import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import ReportUpload from '../components/reports/ReportUpload';
import ReportsList from '../components/reports/ReportsList';
import ReportAnalysis from '../components/reports/ReportAnalysis';
import supabase from '../lib/supabase';

const { FiUpload, FiFileText, FiBarChart3, FiAlertTriangle } = FiIcons;

const Reports = ({ userProfile, userId }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // ✅ Directly fetch reports using health_profile_id = userId
        const { data, error } = await supabase
          .from("reports")
          .select("*")
          .eq("health_profile_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // ✅ Attach public URLs & normalize fields for ReportsList.jsx
        const reportsWithUrls = data.map((report) => {
          let fileUrl = null;

          if (report.file_path) {
            const { data: fileData } = supabase
              .storage
              .from("your-bucket-name") // ⬅ Replace with actual bucket name
              .getPublicUrl(report.file_path);
            fileUrl = fileData.publicUrl;
          }

          return {
            ...report,
            name: report.title || "Untitled Report",
            date: new Date(report.created_at).toLocaleDateString(),
            status: report.status || "analyzed", // fallback if null
            type: report.type || "general", // fallback if null
            file_url: fileUrl
          };
        });

        setReports(reportsWithUrls);
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError("Failed to load your medical reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [userId]);

  const tabs = [
    { id: 'upload', label: 'Upload Reports', icon: FiUpload },
    { id: 'list', label: 'My Reports', icon: FiFileText },
    { id: 'analysis', label: 'AI Analysis', icon: FiBarChart3 },
  ];

  const addReport = (newReport) => {
    setReports(prev => [newReport, ...prev]);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Medical Reports</h1>
          <p className="text-green-100">
            Upload and track your medical reports with AI-powered analysis
          </p>
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
                    ? 'border-green-500 text-green-600'
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

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <div className="flex items-center space-x-3 text-red-700">
              <SafeIcon icon={FiAlertTriangle} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full"
              />
              <span className="ml-3 text-gray-600">Loading your reports...</span>
            </div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'upload' && (
                <ReportUpload onReportAdd={addReport} userId={userId} />
              )}
              {activeTab === 'list' && (
                <ReportsList reports={reports} userId={userId} />
              )}
              {activeTab === 'analysis' && (
                <ReportAnalysis reports={reports} userProfile={userProfile} />
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Reports;

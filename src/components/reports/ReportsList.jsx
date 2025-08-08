import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiFileText, FiDownload, FiEye, FiCalendar, FiFilter } = FiIcons;

const ReportsList = ({ reports }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const reportTypes = {
    blood: { label: 'Blood Test', color: 'bg-red-100 text-red-800' },
    lipid: { label: 'Lipid Profile', color: 'bg-blue-100 text-blue-800' },
    imaging: { label: 'Imaging', color: 'bg-purple-100 text-purple-800' },
    urine: { label: 'Urine Test', color: 'bg-yellow-100 text-yellow-800' },
    general: { label: 'General', color: 'bg-gray-100 text-gray-800' }
  };

  const filteredReports = reports
    .filter(report => filter === 'all' || report.type === filter)
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const getStatusColor = (status) => {
    switch (status) {
      case 'analyzed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiFilter} className="text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="blood">Blood Tests</option>
            <option value="lipid">Lipid Profiles</option>
            <option value="imaging">Imaging</option>
            <option value="urine">Urine Tests</option>
            <option value="general">General</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiCalendar} className="text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <SafeIcon icon={FiFileText} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 truncate">{report.name}</h3>
                  <p className="text-sm text-gray-500">{report.date}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${reportTypes[report.type]?.color}`}>
                {reportTypes[report.type]?.label}
              </span>
            </div>

            <div className="mb-4">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
              </span>
            </div>

            {/* Key Metrics */}
            

            {/* AI Insights */}
            {report.aiInsights && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-xs font-medium text-blue-800 mb-1">AI Insight</div>
                <div className="text-xs text-blue-700">{report.aiInsights}</div>
              </div>
            )}

            {/* Actions */}
<div className="flex space-x-2">
  {report.file_url && (
    <>
      <a>
        <SafeIcon icon={FiEye} className="mr-1" />
        View
      </a>
      <a
        download
        className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
      >
        <SafeIcon icon={FiDownload} />
      </a>
    </>
  )}
</div>

          </motion.div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiFileText} className="text-4xl text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">No reports found</h3>
          <p className="text-gray-400">Upload your first medical report to get started</p>
        </div>
      )}
    </div>
  );
};

export default ReportsList;
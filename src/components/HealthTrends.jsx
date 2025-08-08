import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const HealthTrends = ({ userProfile }) => {
  const healthData = [
    { month: 'Jan', healthScore: 68, bloodPressure: 128, cholesterol: 195, weight: 75 },
    { month: 'Feb', healthScore: 72, bloodPressure: 125, cholesterol: 190, weight: 74 },
    { month: 'Mar', healthScore: 75, bloodPressure: 122, cholesterol: 185, weight: 73 },
    { month: 'Apr', healthScore: 78, bloodPressure: 120, cholesterol: 180, weight: 72 },
    { month: 'May', healthScore: 82, bloodPressure: 118, cholesterol: 175, weight: 71 },
    { month: 'Jun', healthScore: 85, bloodPressure: 115, cholesterol: 170, weight: 70 },
  ];

  const biomarkerData = [
    { month: 'Jan', hemoglobin: 13.5, vitaminD: 25, glucose: 98 },
    { month: 'Feb', hemoglobin: 13.8, vitaminD: 28, glucose: 95 },
    { month: 'Mar', hemoglobin: 14.1, vitaminD: 32, glucose: 92 },
    { month: 'Apr', hemoglobin: 14.2, vitaminD: 35, glucose: 90 },
    { month: 'May', hemoglobin: 14.5, vitaminD: 38, glucose: 88 },
    { month: 'Jun', hemoglobin: 14.7, vitaminD: 42, glucose: 86 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-lg"
    >
      <h3 className="text-xl font-bold text-gray-800 mb-6">Health Trends</h3>
      
      <div className="space-y-8">
        {/* Health Score Trend */}
        <div>
          <h4 className="text-lg font-semibold text-gray-700 mb-4">Overall Health Score</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={healthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="healthScore" 
                  stroke="#3b82f6" 
                  fill="url(#healthGradient)"
                  strokeWidth={3}
                />
                <defs>
                  <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Biomarkers */}
        <div>
          <h4 className="text-lg font-semibold text-gray-700 mb-4">Key Biomarkers</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={biomarkerData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="hemoglobin" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Hemoglobin (g/dL)"
                />
                <Line 
                  type="monotone" 
                  dataKey="vitaminD" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="Vitamin D (ng/mL)"
                />
                <Line 
                  type="monotone" 
                  dataKey="glucose" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Glucose (mg/dL)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HealthTrends;

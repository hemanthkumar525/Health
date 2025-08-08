import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import supabase from '../../lib/supabase';

const { FiUpload, FiFile, FiCheck, FiX, FiAlertTriangle } = FiIcons;

const ReportUpload = ({ onReportAdd, userId }) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState('');

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    if (!userId) {
      setError('User not authenticated. Please log in to upload reports.');
      return;
    }

    setUploading(true);
    setError('');
    
    try {
      for (const file of files) {
        // First, upload the file to Supabase storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        
        // Upload to storage
        const { data: fileData, error: uploadError } = await supabase.storage
          .from('reports')
          .upload(fileName, file);
          
        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('reports')
          .getPublicUrl(fileName);
        
        // Simulate AI analysis (in production, you'd call your AI service here)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Create the report metadata - using userId directly as health_profile_id
        const reportData = {
          health_profile_id: userId, // Use userId directly instead of looking up health profile
          title: file.name,
          description: `Uploaded file: ${file.name}`,
          data: {
            type: getReportType(file.name),
            size: file.size,
            aiInsights: generateAIInsights(file.name),
            file_path: fileName,
            file_url: publicUrl,
            generatedData: generateMockData(file.name)
          }
        };

        console.log("Inserting report with health_profile_id:", userId);
        
        // Save to database
        const { data: savedReport, error: saveError } = await supabase
          .from('reports')
          .insert([reportData])
          .select()
          .single();
          
        if (saveError) {
          console.error("Save error:", saveError);
          throw saveError;
        }
        
        // Add to UI
        const analyzedReport = {
          ...reportData,
          id: savedReport.id,
          aiInsights: reportData.data.aiInsights
        };
        
        setUploadedFiles(prev => [...prev, analyzedReport]);
        onReportAdd(analyzedReport);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const getReportType = (filename) => {
    const lower = filename.toLowerCase();
    if (lower.includes('blood') || lower.includes('cbc')) return 'blood';
    if (lower.includes('lipid') || lower.includes('cholesterol')) return 'lipid';
    if (lower.includes('scan') || lower.includes('mri') || lower.includes('ct')) return 'imaging';
    if (lower.includes('urine')) return 'urine';
    return 'general';
  };

  const generateMockData = (filename) => {
    const type = getReportType(filename);
    switch (type) {
      case 'blood':
        return {
          hemoglobin: (12 + Math.random() * 4).toFixed(1),
          wbc: (4000 + Math.random() * 7000).toFixed(0),
          platelets: (150000 + Math.random() * 300000).toFixed(0),
          glucose: (80 + Math.random() * 40).toFixed(0)
        };
      case 'lipid':
        return {
          totalCholesterol: (150 + Math.random() * 100).toFixed(0),
          ldl: (70 + Math.random() * 80).toFixed(0),
          hdl: (40 + Math.random() * 40).toFixed(0),
          triglycerides: (80 + Math.random() * 120).toFixed(0)
        };
      default:
        return { status: 'normal', notes: 'All parameters within normal range' };
    }
  };

  const generateAIInsights = (filename) => {
    const insights = [
      'All values within normal range',
      'Slight improvement from previous report',
      'Recommend follow-up in 3 months',
      'Consider dietary modifications',
      'Exercise recommendations updated'
    ];
    return insights[Math.floor(Math.random() * insights.length)];
  };

  const removeFile = async (index) => {
    try {
      const fileToRemove = uploadedFiles[index];
      
      if (fileToRemove.id) {
        // Delete from database
        const { error: deleteError } = await supabase
          .from('reports')
          .delete()
          .eq('id', fileToRemove.id);
          
        if (deleteError) throw deleteError;
        
        // Delete from storage if needed
        if (fileToRemove.data?.file_path) {
          const { error: storageError } = await supabase.storage
            .from('reports')
            .remove([fileToRemove.data.file_path]);
            
          if (storageError) console.error('Storage delete error:', storageError);
        }
      }
      
      setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error('Remove file error:', err);
      setError(`Failed to remove file: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 p-4 rounded-lg border border-red-200 flex items-center space-x-3"
        >
          <SafeIcon icon={FiAlertTriangle} className="text-red-500 text-lg" />
          <span className="text-red-700">{error}</span>
          <button 
            onClick={() => setError('')}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <SafeIcon icon={FiX} />
          </button>
        </motion.div>
      )}
      
      {/* Upload Area */}
      <motion.div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className={`p-4 rounded-full ${dragOver ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <SafeIcon 
                icon={FiUpload} 
                className={`text-3xl ${dragOver ? 'text-blue-500' : 'text-gray-400'}`} 
              />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Upload Medical Reports
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your files here, or click to browse
            </p>
            
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
              id="fileInput"
              disabled={uploading || !userId}
            />
            
            <label
              htmlFor="fileInput"
              className={`inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer ${
                (uploading || !userId) ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <SafeIcon icon={FiFile} className="mr-2" />
              Choose Files
            </label>
          </div>
          
          <p className="text-sm text-gray-500">
            Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB each)
          </p>
        </div>
      </motion.div>

      {/* Upload Progress */}
      {uploading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 p-4 rounded-lg border border-blue-200"
        >
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"
            />
            <span className="text-blue-700">Uploading and analyzing your reports...</span>
          </div>
        </motion.div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800">Recently Uploaded</h4>
          {uploadedFiles.map((file, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between bg-green-50 p-4 rounded-lg border border-green-200"
            >
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiCheck} className="text-green-500" />
                <div>
                  <div className="font-medium text-gray-800">{file.title}</div>
                  <div className="text-sm text-green-600">{file.aiInsights}</div>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <SafeIcon icon={FiX} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportUpload;
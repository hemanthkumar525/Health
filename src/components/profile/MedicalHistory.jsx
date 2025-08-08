import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiPlus, FiX } = FiIcons;

// Memoized ItemList component to prevent unnecessary re-renders
const ItemList = React.memo(({ title, field, items, newValue, setNewValue, placeholder, addItem, removeItem }) => (
  <div className="space-y-3">
    <h4 className="font-semibold text-gray-800">{title}</h4>
    
    <div className="flex space-x-2">
      <input
        type="text"
        value={newValue}
        onChange={(e) => setNewValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addItem(field, newValue);
          }
        }}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => addItem(field, newValue)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        <SafeIcon icon={FiPlus} />
      </button>
    </div>

    <div className="space-y-2">
      {(Array.isArray(items) ? items : []).map((item, index) => (
        <motion.div
          key={`${field}-${index}-${item}`} // More stable key
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
        >
          <span className="text-gray-700">{item}</span>
          <button
            type="button"
            onClick={() => removeItem(field, index)}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            <SafeIcon icon={FiX} />
          </button>
        </motion.div>
      ))}
    </div>
  </div>
));

ItemList.displayName = 'ItemList';

const MedicalHistory = ({ data, updateData }) => {
  const [newCondition, setNewCondition] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [newFamilyHistory, setNewFamilyHistory] = useState('');

  // Memoized callbacks to prevent re-creation on every render
  const addItem = useCallback((field, value) => {
    const setValue = {
      existingConditions: setNewCondition,
      medications: setNewMedication,
      allergies: setNewAllergy,
      familyHistory: setNewFamilyHistory
    }[field];

    if (value && value.trim()) {
      const currentItems = Array.isArray(data[field]) ? data[field] : [];
      updateData(field, [...currentItems, value.trim()]);
      setValue('');
    }
  }, [data, updateData]);

  const removeItem = useCallback((field, index) => {
    const currentItems = Array.isArray(data[field]) ? data[field] : [];
    updateData(field, currentItems.filter((_, i) => i !== index));
  }, [data, updateData]);

  // Memoized data to prevent unnecessary re-renders
  const itemsData = useMemo(() => [
    {
      title: "Existing Medical Conditions",
      field: "existingConditions",
      items: data.existingConditions,
      newValue: newCondition,
      setNewValue: setNewCondition,
      placeholder: "e.g., Diabetes, Hypertension, Asthma"
    },
    {
      title: "Current Medications",
      field: "medications",
      items: data.medications,
      newValue: newMedication,
      setNewValue: setNewMedication,
      placeholder: "e.g., Metformin, Lisinopril"
    },
    {
      title: "Known Allergies",
      field: "allergies",
      items: data.allergies,
      newValue: newAllergy,
      setNewValue: setNewAllergy,
      placeholder: "e.g., Penicillin, Peanuts, Shellfish"
    },
    {
      title: "Family Medical History",
      field: "familyHistory",
      items: data.familyHistory,
      newValue: newFamilyHistory,
      setNewValue: setNewFamilyHistory,
      placeholder: "e.g., Heart disease (father), Diabetes (mother)"
    }
  ], [data, newCondition, newMedication, newAllergy, newFamilyHistory]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {itemsData.map((itemData) => (
        <ItemList
          key={itemData.field}
          {...itemData}
          addItem={addItem}
          removeItem={removeItem}
        />
      ))}
    </motion.div>
  );
};

export default React.memo(MedicalHistory);
import { useState, useEffect, useCallback } from 'react';
import { useSessionManager } from './useSessionManager';

/**
 * Form Persistence Hook
 * Automatically saves and restores form data across sessions
 */
export const useFormPersistence = (formId, initialData = {}) => {
  const { sessionData, updateSession } = useSessionManager();
  const [formData, setFormData] = useState(initialData);
  const [isDirty, setIsDirty] = useState(false);

  const FORM_STORAGE_KEY = `form_${formId}`;

  // Load saved form data
  useEffect(() => {
    try {
      // Check session storage first (temporary data)
      const sessionFormData = sessionStorage.getItem(FORM_STORAGE_KEY);
      if (sessionFormData) {
        const parsedData = JSON.parse(sessionFormData);
        setFormData({ ...initialData, ...parsedData });
        setIsDirty(true);
        return;
      }

      // Check if form data exists in session
      if (sessionData.formData && sessionData.formData[formId]) {
        setFormData({ ...initialData, ...sessionData.formData[formId] });
        setIsDirty(true);
      }
    } catch (error) {
      console.error('Failed to load form data:', error);
    }
  }, [formId, initialData, sessionData.formData]);

  // Save form data
  const saveFormData = useCallback((data, persistent = false) => {
    try {
      setFormData(data);
      setIsDirty(true);

      // Save to session storage for immediate persistence
      sessionStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data));

      // Save to session for cross-tab persistence if requested
      if (persistent && sessionData.isAuthenticated) {
        const updatedFormData = {
          ...sessionData.formData,
          [formId]: data
        };
        
        updateSession({ formData: updatedFormData });
      }
    } catch (error) {
      console.error('Failed to save form data:', error);
    }
  }, [formId, sessionData.formData, sessionData.isAuthenticated, updateSession]);

  // Update specific field
  const updateField = useCallback((fieldName, value, persistent = false) => {
    const updatedData = {
      ...formData,
      [fieldName]: value
    };
    saveFormData(updatedData, persistent);
  }, [formData, saveFormData]);

  // Clear form data
  const clearFormData = useCallback(() => {
    try {
      setFormData(initialData);
      setIsDirty(false);
      
      // Clear from session storage
      sessionStorage.removeItem(FORM_STORAGE_KEY);
      
      // Clear from session
      if (sessionData.formData && sessionData.formData[formId]) {
        const updatedFormData = { ...sessionData.formData };
        delete updatedFormData[formId];
        updateSession({ formData: updatedFormData });
      }
    } catch (error) {
      console.error('Failed to clear form data:', error);
    }
  }, [formId, initialData, sessionData.formData, updateSession]);

  // Reset to initial data
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setIsDirty(false);
    sessionStorage.removeItem(FORM_STORAGE_KEY);
  }, [initialData]);

  // Check if form has unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    return isDirty && JSON.stringify(formData) !== JSON.stringify(initialData);
  }, [formData, initialData, isDirty]);

  return {
    formData,
    updateField,
    saveFormData,
    clearFormData,
    resetForm,
    isDirty,
    hasUnsavedChanges
  };
};

export default useFormPersistence;
import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  AddActionService, 
  type ServiceDetails, 
  type AddActionFormData 
} from '../services/addActionService';

interface AddActionContextType {
  service: ServiceDetails | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  success: string | null;
  formData: AddActionFormData;

  fetchService: () => Promise<void>;
  updateFormData: (field: keyof AddActionFormData, value: string) => void;
  resetForm: () => void;
  submitAction: () => Promise<void>;
}

const AddActionContext = createContext<AddActionContextType | undefined>(undefined);

interface AddActionProviderProps {
  children: React.ReactNode;
}

const initialFormData: AddActionFormData = AddActionService.getDefaultFormData();

export const AddActionProvider: React.FC<AddActionProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const { serviceId } = useParams<{ serviceId: string }>();

  const [service, setService] = useState<ServiceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<AddActionFormData>(initialFormData);

  const fetchService = useCallback(async () => {
    if (!serviceId) {
      setError('No service ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const service = await AddActionService.getServiceById(serviceId);
      setService(service);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch service';
      setError(errorMessage);
      console.error('Error fetching service:', err);
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  const updateFormData = useCallback((field: keyof AddActionFormData, value: string) => {
    setFormData((prev: AddActionFormData) => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  }, [error]);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setError(null);
    setSuccess(null);
  }, []);

  const submitAction = useCallback(async () => {
    if (!serviceId) {
      setError('No service ID provided');
      return;
    }

    // Validate form data
    const validationError = AddActionService.validateFormData(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      await AddActionService.createAction(serviceId, formData, token);
      setSuccess('Action created successfully!');

      // Navigate after a short delay to show success message
      setTimeout(() => {
        navigate(`/services/${serviceId}`);
      }, 1500);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create action';
      setError(errorMessage);
      console.error('Error creating action:', err);
    } finally {
      setSubmitting(false);
    }
  }, [serviceId, formData, navigate]);

  const value: AddActionContextType = {
    service,
    loading,
    submitting,
    error,
    success,
    formData,
    fetchService,
    updateFormData,
    resetForm,
    submitAction,
  };

  return (
    <AddActionContext.Provider value={value}>
      {children}
    </AddActionContext.Provider>
  );
};

export const useAddAction = (): AddActionContextType => {
  const context = useContext(AddActionContext);
  if (context === undefined) {
    throw new Error('useAddAction must be used within an AddActionProvider');
  }
  return context;
};

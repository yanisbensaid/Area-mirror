import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AddReactionService,
  type ServiceDetails,
  type AddReactionFormData
} from '../services/addReactionService';

interface AddReactionContextType {
  service: ServiceDetails | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  success: string | null;
  formData: AddReactionFormData;

  fetchService: () => Promise<void>;
  updateFormData: (field: keyof AddReactionFormData, value: string) => void;
  resetForm: () => void;
  submitReaction: () => Promise<void>;
}

const AddReactionContext = createContext<AddReactionContextType | undefined>(undefined);

interface AddReactionProviderProps {
  children: React.ReactNode;
}

const initialFormData: AddReactionFormData = AddReactionService.getDefaultFormData();

export const AddReactionProvider: React.FC<AddReactionProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const { serviceId } = useParams<{ serviceId: string }>();

  const [service, setService] = useState<ServiceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<AddReactionFormData>(initialFormData);

  const fetchService = useCallback(async () => {
    if (!serviceId) {
      setError('No service ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const service = await AddReactionService.getServiceById(serviceId);
      setService(service);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch service';
      setError(errorMessage);
      console.error('Error fetching service:', err);
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  const updateFormData = useCallback((field: keyof AddReactionFormData, value: string) => {
    setFormData((prev: AddReactionFormData) => ({
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

  const submitReaction = useCallback(async () => {
    if (!serviceId) {
      setError('No service ID provided');
      return;
    }

    // Validate form data
    const validationError = AddReactionService.validateFormData(formData);
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

      await AddReactionService.createReaction(serviceId, formData, token);
      setSuccess('Reaction created successfully!');

      // Navigate after a short delay to show success message
      setTimeout(() => {
        navigate(`/services/${serviceId}`);
      }, 1500);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create reaction';
      setError(errorMessage);
      console.error('Error creating reaction:', err);
    } finally {
      setSubmitting(false);
    }
  }, [serviceId, formData, navigate]);

  const value: AddReactionContextType = {
    service,
    loading,
    submitting,
    error,
    success,
    formData,
    fetchService,
    updateFormData,
    resetForm,
    submitReaction,
  };

  return (
    <AddReactionContext.Provider value={value}>
      {children}
    </AddReactionContext.Provider>
  );
};

export const useAddReaction = (): AddReactionContextType => {
  const context = useContext(AddReactionContext);
  if (context === undefined) {
    throw new Error('useAddReaction must be used within an AddReactionProvider');
  }
  return context;
};

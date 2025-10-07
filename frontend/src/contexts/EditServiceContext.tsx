import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { DatabaseService } from '../services/serviceService';
import type { ServiceFormData } from '../services/editServiceService';
import { EditServiceService } from '../services/editServiceService';

interface EditServiceState {
  service: DatabaseService | null;
  formData: ServiceFormData;
  loading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  success: string | null;
}

interface EditServiceContextType extends EditServiceState {
  fetchService: (serviceId: string) => Promise<void>;
  updateFormData: (field: keyof ServiceFormData, value: string) => void;
  updateService: (serviceId: string, token: string) => Promise<void>;
  deleteService: (serviceId: string, serviceName: string, token: string) => Promise<void>;
  clearMessages: () => void;
  resetForm: () => void;
}

type EditServiceAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_UPDATING'; payload: boolean }
  | { type: 'SET_DELETING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SUCCESS'; payload: string | null }
  | { type: 'SET_SERVICE'; payload: DatabaseService }
  | { type: 'SET_FORM_DATA'; payload: ServiceFormData }
  | { type: 'UPDATE_FORM_FIELD'; payload: { field: keyof ServiceFormData; value: string } }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'RESET_FORM' };

const initialFormData: ServiceFormData = {
  name: '',
  description: '',
  status: 'active',
  auth_type: 'OAuth2',
  icon_url: ''
};

const initialState: EditServiceState = {
  service: null,
  formData: initialFormData,
  loading: true,
  isUpdating: false,
  isDeleting: false,
  error: null,
  success: null,
};

function editServiceReducer(state: EditServiceState, action: EditServiceAction): EditServiceState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_UPDATING':
      return { ...state, isUpdating: action.payload };
    case 'SET_DELETING':
      return { ...state, isDeleting: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SUCCESS':
      return { ...state, success: action.payload };
    case 'SET_SERVICE':
      return {
        ...state,
        service: action.payload,
        formData: EditServiceService.transformToFormData(action.payload),
        error: null
      };
    case 'SET_FORM_DATA':
      return { ...state, formData: action.payload };
    case 'UPDATE_FORM_FIELD':
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.field]: action.payload.value
        },
        // Clear success message when user starts editing again
        success: null
      };
    case 'CLEAR_MESSAGES':
      return { ...state, error: null, success: null };
    case 'RESET_FORM':
      return initialState;
    default:
      return state;
  }
}

const EditServiceContext = createContext<EditServiceContextType | undefined>(undefined);

export const EditServiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(editServiceReducer, initialState);

  const fetchService = useCallback(async (serviceId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_MESSAGES' });

    try {
      const service = await EditServiceService.getServiceById(serviceId);
      dispatch({ type: 'SET_SERVICE', payload: service });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch service' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const updateFormData = useCallback((field: keyof ServiceFormData, value: string) => {
    dispatch({ type: 'UPDATE_FORM_FIELD', payload: { field, value } });
  }, []);

  const updateService = useCallback(async (serviceId: string, token: string) => {
    dispatch({ type: 'SET_UPDATING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    dispatch({ type: 'SET_SUCCESS', payload: null });

    try {
      await EditServiceService.updateService(serviceId, state.formData, token);
      dispatch({ type: 'SET_SUCCESS', payload: 'Service updated successfully!' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update service' });
    } finally {
      dispatch({ type: 'SET_UPDATING', payload: false });
    }
  }, [state.formData]);

  const deleteService = useCallback(async (serviceId: string, serviceName: string, token: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${serviceName}"? This action cannot be undone and will also delete all associated actions and reactions.`
    );

    if (!confirmDelete) {
      return;
    }

    dispatch({ type: 'SET_DELETING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    dispatch({ type: 'SET_SUCCESS', payload: null });

    try {
      await EditServiceService.deleteService(serviceId, token);
      dispatch({ type: 'SET_SUCCESS', payload: 'Service deleted successfully!' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete service' });
    } finally {
      dispatch({ type: 'SET_DELETING', payload: false });
    }
  }, []);

  const clearMessages = useCallback(() => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  }, []);

  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
  }, []);

  const value: EditServiceContextType = {
    ...state,
    fetchService,
    updateFormData,
    updateService,
    deleteService,
    clearMessages,
    resetForm,
  };

  return (
    <EditServiceContext.Provider value={value}>
      {children}
    </EditServiceContext.Provider>
  );
};

export const useEditService = (): EditServiceContextType => {
  const context = useContext(EditServiceContext);
  if (context === undefined) {
    throw new Error('useEditService must be used within an EditServiceProvider');
  }
  return context;
};

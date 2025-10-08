import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { EditActionData, ActionFormData } from '../services/editActionService';
import { EditActionService } from '../services/editActionService';

interface EditActionsState {
  actions: EditActionData[];
  currentAction: EditActionData | null;
  formData: ActionFormData;
  loading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isCreating: boolean;
  error: string | null;
  success: string | null;
  serviceId: string | null;
}

interface EditActionsContextType extends EditActionsState {
  fetchActions: (serviceId: string) => Promise<void>;
  fetchAction: (actionId: string) => Promise<void>;
  updateFormData: (field: keyof ActionFormData, value: string) => void;
  setFormData: (data: ActionFormData) => void;
  updateAction: (actionId: string, token: string) => Promise<void>;
  deleteAction: (actionId: string, actionName: string, token: string) => Promise<void>;
  createAction: (serviceId: string, token: string) => Promise<void>;
  clearMessages: () => void;
  resetForm: () => void;
  setServiceId: (serviceId: string) => void;
}

type EditActionsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_UPDATING'; payload: boolean }
  | { type: 'SET_DELETING'; payload: boolean }
  | { type: 'SET_CREATING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SUCCESS'; payload: string | null }
  | { type: 'SET_ACTIONS'; payload: EditActionData[] }
  | { type: 'SET_CURRENT_ACTION'; payload: EditActionData }
  | { type: 'SET_FORM_DATA'; payload: ActionFormData }
  | { type: 'UPDATE_FORM_FIELD'; payload: { field: keyof ActionFormData; value: string } }
  | { type: 'ADD_ACTION'; payload: EditActionData }
  | { type: 'REMOVE_ACTION'; payload: string }
  | { type: 'UPDATE_ACTION_IN_LIST'; payload: EditActionData }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'RESET_FORM' }
  | { type: 'SET_SERVICE_ID'; payload: string };

const initialState: EditActionsState = {
  actions: [],
  currentAction: null,
  formData: EditActionService.getDefaultFormData(),
  loading: true,
  isUpdating: false,
  isDeleting: false,
  isCreating: false,
  error: null,
  success: null,
  serviceId: null,
};

function editActionsReducer(state: EditActionsState, action: EditActionsAction): EditActionsState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_UPDATING':
      return { ...state, isUpdating: action.payload };
    case 'SET_DELETING':
      return { ...state, isDeleting: action.payload };
    case 'SET_CREATING':
      return { ...state, isCreating: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SUCCESS':
      return { ...state, success: action.payload };
    case 'SET_ACTIONS':
      return { ...state, actions: action.payload, error: null };
    case 'SET_CURRENT_ACTION':
      return { 
        ...state, 
        currentAction: action.payload, 
        formData: EditActionService.transformToFormData(action.payload),
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
    case 'ADD_ACTION':
      return { 
        ...state, 
        actions: [...state.actions, action.payload]
      };
    case 'REMOVE_ACTION':
      return { 
        ...state, 
        actions: state.actions.filter(a => a.id.toString() !== action.payload)
      };
    case 'UPDATE_ACTION_IN_LIST':
      return {
        ...state,
        actions: state.actions.map(a => 
          a.id === action.payload.id ? action.payload : a
        )
      };
    case 'CLEAR_MESSAGES':
      return { ...state, error: null, success: null };
    case 'RESET_FORM':
      return { 
        ...initialState, 
        serviceId: state.serviceId 
      };
    case 'SET_SERVICE_ID':
      return { ...state, serviceId: action.payload };
    default:
      return state;
  }
}

const EditActionsContext = createContext<EditActionsContextType | undefined>(undefined);

export const EditActionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(editActionsReducer, initialState);

  const fetchActions = useCallback(async (serviceId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_MESSAGES' });
    dispatch({ type: 'SET_SERVICE_ID', payload: serviceId });

    try {
      const actions = await EditActionService.getActionsByServiceId(serviceId);
      dispatch({ type: 'SET_ACTIONS', payload: actions });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch actions' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const fetchAction = useCallback(async (actionId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_MESSAGES' });

    try {
      const action = await EditActionService.getActionById(actionId);
      dispatch({ type: 'SET_CURRENT_ACTION', payload: action });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch action' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const updateFormData = useCallback((field: keyof ActionFormData, value: string) => {
    dispatch({ type: 'UPDATE_FORM_FIELD', payload: { field, value } });
  }, []);

  const setFormData = useCallback((data: ActionFormData) => {
    dispatch({ type: 'SET_FORM_DATA', payload: data });
  }, []);

  const updateAction = useCallback(async (actionId: string, token: string) => {
    dispatch({ type: 'SET_UPDATING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    dispatch({ type: 'SET_SUCCESS', payload: null });

    try {
      await EditActionService.updateAction(actionId, state.formData, token);

      // Find the action in the current list and update it
      const actionToUpdate = state.actions.find(a => a.id.toString() === actionId);
      if (actionToUpdate) {
        const updatedAction = {
          ...actionToUpdate,
          name: state.formData.name,
          description: state.formData.description,
          trigger_type: state.formData.trigger_type
        };
        dispatch({ type: 'UPDATE_ACTION_IN_LIST', payload: updatedAction });
        dispatch({ type: 'SET_CURRENT_ACTION', payload: updatedAction });
      }

      dispatch({ type: 'SET_SUCCESS', payload: 'Action updated successfully!' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update action' });
    } finally {
      dispatch({ type: 'SET_UPDATING', payload: false });
    }
  }, [state.formData, state.actions]);

  const deleteAction = useCallback(async (actionId: string, actionName: string, token: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${actionName}"? This action cannot be undone.`
    );

    if (!confirmDelete) {
      return;
    }

    dispatch({ type: 'SET_DELETING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    dispatch({ type: 'SET_SUCCESS', payload: null });

    try {
      await EditActionService.deleteAction(actionId, token);
      dispatch({ type: 'REMOVE_ACTION', payload: actionId });
      dispatch({ type: 'SET_SUCCESS', payload: 'Action deleted successfully!' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete action' });
    } finally {
      dispatch({ type: 'SET_DELETING', payload: false });
    }
  }, []);

  const createAction = useCallback(async (serviceId: string, token: string) => {
    dispatch({ type: 'SET_CREATING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    dispatch({ type: 'SET_SUCCESS', payload: null });

    try {
      const newAction = await EditActionService.createAction(serviceId, state.formData, token);
      dispatch({ type: 'ADD_ACTION', payload: newAction });
      dispatch({ type: 'SET_SUCCESS', payload: 'Action created successfully!' });
      dispatch({ type: 'SET_FORM_DATA', payload: EditActionService.getDefaultFormData() });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create action' });
    } finally {
      dispatch({ type: 'SET_CREATING', payload: false });
    }
  }, [state.formData]);

  const clearMessages = useCallback(() => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  }, []);

  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
  }, []);

  const setServiceId = useCallback((serviceId: string) => {
    dispatch({ type: 'SET_SERVICE_ID', payload: serviceId });
  }, []);

  const value: EditActionsContextType = {
    ...state,
    fetchActions,
    fetchAction,
    updateFormData,
    setFormData,
    updateAction,
    deleteAction,
    createAction,
    clearMessages,
    resetForm,
    setServiceId,
  };

  return (
    <EditActionsContext.Provider value={value}>
      {children}
    </EditActionsContext.Provider>
  );
};

export const useEditActions = (): EditActionsContextType => {
  const context = useContext(EditActionsContext);
  if (context === undefined) {
    throw new Error('useEditActions must be used within an EditActionsProvider');
  }
  return context;
};

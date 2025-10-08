import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { EditReactionData, ReactionFormData } from '../services/editReactionService';
import { EditReactionService } from '../services/editReactionService';

interface EditReactionsState {
  reactions: EditReactionData[];
  currentReaction: EditReactionData | null;
  formData: ReactionFormData;
  loading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isCreating: boolean;
  error: string | null;
  success: string | null;
  serviceId: string | null;
}

interface EditReactionsContextType extends EditReactionsState {
  fetchReactions: (serviceId: string) => Promise<void>;
  fetchReaction: (reactionId: string) => Promise<void>;
  updateFormData: (field: keyof ReactionFormData, value: string) => void;
  setFormData: (data: ReactionFormData) => void;
  updateReaction: (reactionId: string, token: string) => Promise<void>;
  deleteReaction: (reactionId: string, reactionName: string, token: string) => Promise<void>;
  createReaction: (serviceId: string, token: string) => Promise<void>;
  clearMessages: () => void;
  resetForm: () => void;
  setServiceId: (serviceId: string) => void;
}

type EditReactionsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_UPDATING'; payload: boolean }
  | { type: 'SET_DELETING'; payload: boolean }
  | { type: 'SET_CREATING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SUCCESS'; payload: string | null }
  | { type: 'SET_REACTIONS'; payload: EditReactionData[] }
  | { type: 'SET_CURRENT_REACTION'; payload: EditReactionData }
  | { type: 'SET_FORM_DATA'; payload: ReactionFormData }
  | { type: 'UPDATE_FORM_FIELD'; payload: { field: keyof ReactionFormData; value: string } }
  | { type: 'ADD_REACTION'; payload: EditReactionData }
  | { type: 'REMOVE_REACTION'; payload: string }
  | { type: 'UPDATE_REACTION_IN_LIST'; payload: EditReactionData }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'RESET_FORM' }
  | { type: 'SET_SERVICE_ID'; payload: string };

const initialState: EditReactionsState = {
  reactions: [],
  currentReaction: null,
  formData: EditReactionService.getDefaultFormData(),
  loading: true,
  isUpdating: false,
  isDeleting: false,
  isCreating: false,
  error: null,
  success: null,
  serviceId: null,
};

function editReactionsReducer(state: EditReactionsState, action: EditReactionsAction): EditReactionsState {
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
    case 'SET_REACTIONS':
      return { ...state, reactions: action.payload, error: null };
    case 'SET_CURRENT_REACTION':
      return { 
        ...state, 
        currentReaction: action.payload, 
        formData: EditReactionService.transformToFormData(action.payload),
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
    case 'ADD_REACTION':
      return { 
        ...state, 
        reactions: [...state.reactions, action.payload]
      };
    case 'REMOVE_REACTION':
      return { 
        ...state, 
        reactions: state.reactions.filter(r => r.id.toString() !== action.payload)
      };
    case 'UPDATE_REACTION_IN_LIST':
      return {
        ...state,
        reactions: state.reactions.map(r => 
          r.id === action.payload.id ? action.payload : r
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

const EditReactionsContext = createContext<EditReactionsContextType | undefined>(undefined);

export const EditReactionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(editReactionsReducer, initialState);

  const fetchReactions = useCallback(async (serviceId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_MESSAGES' });
    dispatch({ type: 'SET_SERVICE_ID', payload: serviceId });

    try {
      const reactions = await EditReactionService.getReactionsByServiceId(serviceId);
      dispatch({ type: 'SET_REACTIONS', payload: reactions });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch reactions' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const fetchReaction = useCallback(async (reactionId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_MESSAGES' });

    try {
      const reaction = await EditReactionService.getReactionById(reactionId);
      dispatch({ type: 'SET_CURRENT_REACTION', payload: reaction });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch reaction' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const updateFormData = useCallback((field: keyof ReactionFormData, value: string) => {
    dispatch({ type: 'UPDATE_FORM_FIELD', payload: { field, value } });
  }, []);

  const setFormData = useCallback((data: ReactionFormData) => {
    dispatch({ type: 'SET_FORM_DATA', payload: data });
  }, []);

  const updateReaction = useCallback(async (reactionId: string, token: string) => {
    dispatch({ type: 'SET_UPDATING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    dispatch({ type: 'SET_SUCCESS', payload: null });

    try {
      await EditReactionService.updateReaction(reactionId, state.formData, token);
      
      // Find the reaction in the current list and update it
      const reactionToUpdate = state.reactions.find(r => r.id.toString() === reactionId);
      if (reactionToUpdate) {
        const updatedReaction = {
          ...reactionToUpdate,
          name: state.formData.name,
          description: state.formData.description,
          action_type: state.formData.reaction_type
        };
        dispatch({ type: 'UPDATE_REACTION_IN_LIST', payload: updatedReaction });
        dispatch({ type: 'SET_CURRENT_REACTION', payload: updatedReaction });
      }
      
      dispatch({ type: 'SET_SUCCESS', payload: 'Reaction updated successfully!' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update reaction' });
    } finally {
      dispatch({ type: 'SET_UPDATING', payload: false });
    }
  }, [state.formData, state.reactions]);

  const deleteReaction = useCallback(async (reactionId: string, reactionName: string, token: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${reactionName}"? This action cannot be undone.`
    );

    if (!confirmDelete) {
      return;
    }

    dispatch({ type: 'SET_DELETING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    dispatch({ type: 'SET_SUCCESS', payload: null });

    try {
      await EditReactionService.deleteReaction(reactionId, token);
      dispatch({ type: 'REMOVE_REACTION', payload: reactionId });
      dispatch({ type: 'SET_SUCCESS', payload: 'Reaction deleted successfully!' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete reaction' });
    } finally {
      dispatch({ type: 'SET_DELETING', payload: false });
    }
  }, []);

  const createReaction = useCallback(async (serviceId: string, token: string) => {
    dispatch({ type: 'SET_CREATING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    dispatch({ type: 'SET_SUCCESS', payload: null });

    try {
      const newReaction = await EditReactionService.createReaction(serviceId, state.formData, token);
      dispatch({ type: 'ADD_REACTION', payload: newReaction });
      dispatch({ type: 'SET_SUCCESS', payload: 'Reaction created successfully!' });
      dispatch({ type: 'SET_FORM_DATA', payload: EditReactionService.getDefaultFormData() });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create reaction' });
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

  const value: EditReactionsContextType = {
    ...state,
    fetchReactions,
    fetchReaction,
    updateFormData,
    setFormData,
    updateReaction,
    deleteReaction,
    createReaction,
    clearMessages,
    resetForm,
    setServiceId,
  };

  return (
    <EditReactionsContext.Provider value={value}>
      {children}
    </EditReactionsContext.Provider>
  );
};

export const useEditReactions = (): EditReactionsContextType => {
  const context = useContext(EditReactionsContext);
  if (context === undefined) {
    throw new Error('useEditReactions must be used within an EditReactionsProvider');
  }
  return context;
};

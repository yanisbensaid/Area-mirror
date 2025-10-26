import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { DatabaseService, Automation } from '../services/serviceService';
import { ServiceService } from '../services/serviceService';

interface ServiceState {
  currentService: DatabaseService | null;
  automations: Automation[];
  loading: boolean;
  error: string | null;
  telegramStatus: any | null;
  loadingTelegramStatus: boolean;
}

interface ServiceContextType extends ServiceState {
  fetchService: (serviceId: string) => Promise<void>;
  fetchAutomations: (serviceId: string) => Promise<void>;
  fetchTelegramStatus: (token?: string) => Promise<void>;
  clearError: () => void;
  clearService: () => void;
}

type ServiceAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SERVICE'; payload: DatabaseService }
  | { type: 'SET_AUTOMATIONS'; payload: Automation[] }
  | { type: 'SET_TELEGRAM_STATUS'; payload: any }
  | { type: 'SET_TELEGRAM_LOADING'; payload: boolean }
  | { type: 'CLEAR_SERVICE' };

const initialState: ServiceState = {
  currentService: null,
  automations: [],
  loading: false,
  error: null,
  telegramStatus: null,
  loadingTelegramStatus: false,
};

function serviceReducer(state: ServiceState, action: ServiceAction): ServiceState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_SERVICE':
      return { ...state, currentService: action.payload, error: null };
    case 'SET_AUTOMATIONS':
      return { ...state, automations: action.payload };
    case 'SET_TELEGRAM_STATUS':
      return { ...state, telegramStatus: action.payload, loadingTelegramStatus: false };
    case 'SET_TELEGRAM_LOADING':
      return { ...state, loadingTelegramStatus: action.payload };
    case 'CLEAR_SERVICE':
      return initialState;
    default:
      return state;
  }
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const ServiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(serviceReducer, initialState);

  const fetchService = useCallback(async (serviceId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const service = await ServiceService.getServiceById(serviceId);
      dispatch({ type: 'SET_SERVICE', payload: service });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch service' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const fetchAutomations = useCallback(async (serviceId: string) => {
    try {
      const automations = await ServiceService.getServiceAutomations(serviceId);
      dispatch({ type: 'SET_AUTOMATIONS', payload: automations });
    } catch (error) {
      console.error('Failed to fetch automations:', error);
      dispatch({ type: 'SET_AUTOMATIONS', payload: [] });
    }
  }, []);

  const fetchTelegramStatus = useCallback(async (token?: string) => {
    dispatch({ type: 'SET_TELEGRAM_LOADING', payload: true });
    try {
      const response = await ServiceService.getTelegramStatus(token);
      dispatch({ type: 'SET_TELEGRAM_STATUS', payload: response.data.data });
    } catch (error) {
      console.error('Failed to fetch Telegram status:', error);
      dispatch({ type: 'SET_TELEGRAM_LOADING', payload: false });
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const clearService = useCallback(() => {
    dispatch({ type: 'CLEAR_SERVICE' });
  }, []);

  const value: ServiceContextType = {
    ...state,
    fetchService,
    fetchAutomations,
    fetchTelegramStatus,
    clearError,
    clearService,
  };

  return (
    <ServiceContext.Provider value={value}>
      {children}
    </ServiceContext.Provider>
  );
};

export const useService = (): ServiceContextType => {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error('useService must be used within a ServiceProvider');
  }
  return context;
};

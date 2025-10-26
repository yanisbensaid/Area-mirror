import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { Service, AREATemplate } from '../services/servicesPageService';
import { ServicesPageService } from '../services/servicesPageService';

interface ServicesPageState {
  services: Service[];
  areaTemplates: AREATemplate[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string;
  showPopularOnly: boolean;
  currentPage: number;
}

interface ServicesPageContextType extends ServicesPageState {
  fetchServices: () => Promise<void>;
  fetchAREATemplates: (token?: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setShowPopularOnly: (show: boolean) => void;
  setCurrentPage: (page: number) => void;
  clearFilters: () => void;
  clearError: () => void;
}

type ServicesPageAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SERVICES'; payload: Service[] }
  | { type: 'SET_AREA_TEMPLATES'; payload: AREATemplate[] }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SELECTED_CATEGORY'; payload: string }
  | { type: 'SET_SHOW_POPULAR_ONLY'; payload: boolean }
  | { type: 'SET_CURRENT_PAGE'; payload: number }
  | { type: 'CLEAR_FILTERS' };

const initialState: ServicesPageState = {
  services: [],
  areaTemplates: [],
  loading: true,
  error: null,
  searchQuery: '',
  selectedCategory: 'All',
  showPopularOnly: false,
  currentPage: 1,
};

function servicesPageReducer(state: ServicesPageState, action: ServicesPageAction): ServicesPageState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_SERVICES':
      return { ...state, services: action.payload, error: null };
    case 'SET_AREA_TEMPLATES':
      return { ...state, areaTemplates: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload, currentPage: 1 };
    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.payload, currentPage: 1 };
    case 'SET_SHOW_POPULAR_ONLY':
      return { ...state, showPopularOnly: action.payload, currentPage: 1 };
    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload };
    case 'CLEAR_FILTERS':
      return { 
        ...state, 
        searchQuery: '', 
        selectedCategory: 'All', 
        showPopularOnly: false, 
        currentPage: 1 
      };
    default:
      return state;
  }
}

const ServicesPageContext = createContext<ServicesPageContextType | undefined>(undefined);

export const ServicesPageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(servicesPageReducer, initialState);

  const fetchServices = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const services = await ServicesPageService.getAllServices();
      dispatch({ type: 'SET_SERVICES', payload: services });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch services' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const fetchAREATemplates = useCallback(async (token?: string) => {
    try {
      const templates = await ServicesPageService.getAREATemplates(token);
      dispatch({ type: 'SET_AREA_TEMPLATES', payload: templates });
    } catch (error) {
      console.error('Failed to fetch AREA templates:', error);
      dispatch({ type: 'SET_AREA_TEMPLATES', payload: [] });
    }
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, []);

  const setSelectedCategory = useCallback((category: string) => {
    dispatch({ type: 'SET_SELECTED_CATEGORY', payload: category });
  }, []);

  const setShowPopularOnly = useCallback((show: boolean) => {
    dispatch({ type: 'SET_SHOW_POPULAR_ONLY', payload: show });
  }, []);

  const setCurrentPage = useCallback((page: number) => {
    dispatch({ type: 'SET_CURRENT_PAGE', payload: page });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const value: ServicesPageContextType = {
    ...state,
    fetchServices,
    fetchAREATemplates,
    setSearchQuery,
    setSelectedCategory,
    setShowPopularOnly,
    setCurrentPage,
    clearFilters,
    clearError,
  };

  return (
    <ServicesPageContext.Provider value={value}>
      {children}
    </ServicesPageContext.Provider>
  );
};

export const useServicesPage = (): ServicesPageContextType => {
  const context = useContext(ServicesPageContext);
  if (context === undefined) {
    throw new Error('useServicesPage must be used within a ServicesPageProvider');
  }
  return context;
};

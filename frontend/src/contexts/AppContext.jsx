/**
 * App Context - Global state management
 */
import { createContext, useContext, useReducer, useEffect } from 'react';
import apiService from '../services/api';

// Initial state
const initialState = {
  // Authentication
  isAuthenticated: false,
  username: '',
  token: null,
  
  // Projects
  projects: [],
  currentProject: null,
  
  // Analysis
  latestReport: null,
  analysisHistory: [],
  loading: false,
  error: null,
  
  // UI State
  activeTab: 'analysis',
  sidebarOpen: true,
  theme: 'dark'
};

// Action types
export const ACTIONS = {
  // Auth
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  AUTH_ERROR: 'AUTH_ERROR',
  
  // Projects
  SET_PROJECTS: 'SET_PROJECTS',
  SET_CURRENT_PROJECT: 'SET_CURRENT_PROJECT',
  ADD_PROJECT: 'ADD_PROJECT',
  
  // Analysis
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LATEST_REPORT: 'SET_LATEST_REPORT',
  ADD_TO_HISTORY: 'ADD_TO_HISTORY',
  CLEAR_HISTORY: 'CLEAR_HISTORY',
  
  // UI
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_THEME: 'SET_THEME'
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        username: action.payload.username,
        token: action.payload.token,
        error: null
      };
      
    case ACTIONS.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        username: '',
        token: null,
        projects: [],
        currentProject: null,
        latestReport: null,
        analysisHistory: []
      };
      
    case ACTIONS.AUTH_ERROR:
      return {
        ...state,
        isAuthenticated: false,
        username: '',
        token: null,
        error: action.payload
      };
      
    case ACTIONS.SET_PROJECTS:
      return {
        ...state,
        projects: action.payload
      };
      
    case ACTIONS.SET_CURRENT_PROJECT:
      return {
        ...state,
        currentProject: action.payload
      };
      
    case ACTIONS.ADD_PROJECT:
      return {
        ...state,
        projects: [...state.projects, action.payload]
      };
      
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
      
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
      
    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
      
    case ACTIONS.SET_LATEST_REPORT:
      return {
        ...state,
        latestReport: action.payload,
        loading: false,
        error: null
      };
      
    case ACTIONS.ADD_TO_HISTORY:
      return {
        ...state,
        analysisHistory: [action.payload, ...state.analysisHistory]
      };
      
    case ACTIONS.CLEAR_HISTORY:
      return {
        ...state,
        analysisHistory: []
      };
      
    case ACTIONS.SET_ACTIVE_TAB:
      return {
        ...state,
        activeTab: action.payload
      };
      
    case ACTIONS.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen
      };
      
    case ACTIONS.SET_THEME:
      return {
        ...state,
        theme: action.payload
      };
      
    default:
      return state;
  }
}

// Context
const AppContext = createContext();

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize app state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const history = localStorage.getItem('report_history');
    const theme = localStorage.getItem('theme') || 'dark';

    if (token && username) {
      dispatch({
        type: ACTIONS.LOGIN_SUCCESS,
        payload: { username, token }
      });
    }

    if (history) {
      try {
        const parsedHistory = JSON.parse(history);
        dispatch({
          type: ACTIONS.SET_ANALYSIS_HISTORY,
          payload: parsedHistory
        });
      } catch (error) {
        console.error('Error parsing history from localStorage:', error);
      }
    }

    dispatch({
      type: ACTIONS.SET_THEME,
      payload: theme
    });
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (state.isAuthenticated) {
      localStorage.setItem('token', state.token);
      localStorage.setItem('username', state.username);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
    }
  }, [state.isAuthenticated, state.token, state.username]);

  useEffect(() => {
    localStorage.setItem('report_history', JSON.stringify(state.analysisHistory));
  }, [state.analysisHistory]);

  useEffect(() => {
    localStorage.setItem('theme', state.theme);
  }, [state.theme]);

  // Action creators
  const actions = {
    // Auth actions
    login: async (username, password) => {
      try {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });
        const response = await apiService.login(username, password);
        
        dispatch({
          type: ACTIONS.LOGIN_SUCCESS,
          payload: { username, token: response.access_token }
        });
        
        return response;
      } catch (error) {
        dispatch({
          type: ACTIONS.AUTH_ERROR,
          payload: error.message
        });
        throw error;
      }
    },

    register: async (username, password) => {
      try {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });
        const response = await apiService.register(username, password);
        
        dispatch({
          type: ACTIONS.LOGIN_SUCCESS,
          payload: { username, token: response.access_token }
        });
        
        return response;
      } catch (error) {
        dispatch({
          type: ACTIONS.AUTH_ERROR,
          payload: error.message
        });
        throw error;
      }
    },

    logout: () => {
      dispatch({ type: ACTIONS.LOGOUT });
    },

    // Project actions
    loadProjects: async () => {
      try {
        const projects = await apiService.getProjects();
        dispatch({ type: ACTIONS.SET_PROJECTS, payload: projects });
        return projects;
      } catch (error) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    createProject: async (name, description) => {
      try {
        const project = await apiService.createProject(name, description);
        dispatch({ type: ACTIONS.ADD_PROJECT, payload: project });
        return project;
      } catch (error) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    setCurrentProject: (project) => {
      dispatch({ type: ACTIONS.SET_CURRENT_PROJECT, payload: project });
    },

    // Analysis actions
    analyzeThreePoint: async (points, projectId = 'default') => {
      try {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });
        dispatch({ type: ACTIONS.CLEAR_ERROR });
        
        const result = await apiService.analyzeThreePoint(projectId, points);
        
        dispatch({ type: ACTIONS.SET_LATEST_REPORT, payload: result });
        dispatch({ type: ACTIONS.ADD_TO_HISTORY, payload: result });
        
        return result;
      } catch (error) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    uploadCSV: async (file, projectId = 'default') => {
      try {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });
        dispatch({ type: ACTIONS.CLEAR_ERROR });
        
        const result = await apiService.uploadCSV(file, projectId);
        
        // CSV upload natijasini history ga qo'shish
        if (result.results && result.results.length > 0) {
          result.results.forEach(report => {
            dispatch({ type: ACTIONS.ADD_TO_HISTORY, payload: report });
          });
        }
        
        return result;
      } catch (error) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    // UI actions
    setActiveTab: (tab) => {
      dispatch({ type: ACTIONS.SET_ACTIVE_TAB, payload: tab });
    },

    toggleSidebar: () => {
      dispatch({ type: ACTIONS.TOGGLE_SIDEBAR });
    },

    setTheme: (theme) => {
      dispatch({ type: ACTIONS.SET_THEME, payload: theme });
    },

    clearError: () => {
      dispatch({ type: ACTIONS.CLEAR_ERROR });
    }
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook to use context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;


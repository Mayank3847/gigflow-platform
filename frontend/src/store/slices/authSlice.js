import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { sessionManager } from '../../utils/sessionManager';
import { clearNotifications } from './notificationSlice';

// ✅ FIXED: Proper API URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Log configuration for debugging
console.log('🔧 API Configuration:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  API_BASE_URL: API_BASE_URL,
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD
});

// Set axios defaults
axios.defaults.withCredentials = true;

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor - Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🔵 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
      
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        console.log('🔴 Unauthorized - Clearing session');
        sessionManager.clearSession();
        
        // Don't redirect if we're already on auth routes
        const isAuthRoute = error.config?.url?.includes('/login') || 
                           error.config?.url?.includes('/register');
        
        if (!isAuthRoute && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      console.error('❌ No response received:', error.request);
      console.error('This usually means the backend is not running or CORS is blocking the request');
    } else {
      console.error('❌ Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

// ============================================
// ASYNC THUNKS
// ============================================

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('📝 Registering user:', userData.email);
      
      const response = await api.post('/api/auth/register', {
        name: userData.name?.trim(),
        email: userData.email?.toLowerCase().trim(),
        password: userData.password,
      });
      
      console.log('✅ Registration successful:', response.data);
      
      const responseData = response.data || {};
      const token = responseData.token;
      const user = responseData.user || responseData;
      
      // Store token if received
      if (token) {
        sessionManager.setSession(token, user);
        localStorage.setItem('token', token);
        sessionStorage.setItem('token', token);
        console.log('🔑 Token stored successfully');
      }
      
      return responseData;
    } catch (error) {
      console.error('❌ Registration failed:', error.response?.data || error.message);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Registration failed. Please try again.';
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('🔐 Logging in user:', userData.email);
      
      const response = await api.post('/api/auth/login', {
        email: userData.email?.toLowerCase().trim(),
        password: userData.password,
      });
      
      console.log('✅ Login successful:', response.data);
      
      const responseData = response.data || {};
      const token = responseData.token;
      const user = responseData.user || responseData;
      
      // Store token if received
      if (token) {
        sessionManager.setSession(token, user);
        localStorage.setItem('token', token);
        sessionStorage.setItem('token', token);
        console.log('🔑 Token stored successfully');
      }
      
      return responseData;
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Login failed. Please check your credentials.';
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      console.log('👋 Logging out user...');
      
      // Call backend logout endpoint
      await api.post('/api/auth/logout');
      
      console.log('✅ Logout successful');
      
      // Clear session data
      sessionManager.clearSession();
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      
      // Clear notifications
      dispatch(clearNotifications());
      
      return null;
    } catch (error) {
      console.error('❌ Logout error:', error);
      
      // Clear session even if API call fails
      sessionManager.clearSession();
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      dispatch(clearNotifications());
      
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      // Check if session is active before making request
      if (!sessionManager.isSessionActive()) {
        console.log('❌ No active session - skipping getMe');
        return rejectWithValue('No active session');
      }
      
      console.log('👤 Fetching current user...');
      
      const response = await api.get('/api/auth/me');
      
      console.log('✅ User fetched successfully:', response.data);
      
      return response.data || {};
    } catch (error) {
      console.error('❌ Get me failed:', error.response?.data || error.message);
      
      // Clear session on 401
      if (error.response?.status === 401) {
        sessionManager.clearSession();
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
      }
      
      return rejectWithValue(error.response?.data?.message || 'Not authenticated');
    }
  }
);

// ============================================
// SLICE
// ============================================

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: '',
    isAuthenticated: false,
  },
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    clearUser: (state) => {
      state.user = null;
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
      state.isAuthenticated = false;
      sessionManager.clearSession();
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      console.log('🧹 User cleared from state');
    },
    setUserFromSession: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      console.log('♻️ User restored from session');
    },
  },
  extraReducers: (builder) => {
    builder
      // ===== REGISTER =====
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = '';
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isAuthenticated = true;
        state.user = action.payload?.user || action.payload || null;
        state.message = 'Registration successful!';
        state.isError = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.isAuthenticated = false;
        state.message = action.payload || 'Registration failed';
        state.user = null;
      })
      
      // ===== LOGIN =====
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = '';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isAuthenticated = true;
        state.user = action.payload?.user || action.payload || null;
        state.message = 'Login successful!';
        state.isError = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.isAuthenticated = false;
        state.message = action.payload || 'Login failed';
        state.user = null;
      })
      
      // ===== LOGOUT =====
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isSuccess = false;
        state.isError = false;
        state.isAuthenticated = false;
        state.message = '';
        state.isLoading = false;
      })
      .addCase(logout.rejected, (state) => {
        state.user = null;
        state.isSuccess = false;
        state.isError = false;
        state.isAuthenticated = false;
        state.message = '';
        state.isLoading = false;
      })
      
      // ===== GET ME =====
      .addCase(getMe.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload?.user || action.payload || null;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.isError = false;
      })
      .addCase(getMe.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      });
  },
});

export const { reset, clearUser, setUserFromSession } = authSlice.actions;
export default authSlice.reducer;
export { api };
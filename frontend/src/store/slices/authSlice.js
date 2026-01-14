// src/redux/slices/authSlice.js - Complete Redux Auth Slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { sessionManager } from '../../utils/sessionManager';

// ============================================
// API Configuration
// ============================================
const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth`;

// ✅ CRITICAL: Enable credentials for cross-origin requests
axios.defaults.withCredentials = true;

// Create axios instance with interceptors
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to headers if available
api.interceptors.request.use(
  (config) => {
    // Get token from sessionStorage/localStorage as backup
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
        
        // Don't redirect on login/register routes
        const isAuthRoute = error.config.url?.includes('/login') || 
                          error.config.url?.includes('/register');
        
        if (!isAuthRoute && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      console.error('❌ No response received:', error.request);
    } else {
      console.error('❌ Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// Async Thunks
// ============================================

/**
 * Register new user
 */
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

      // Store token if provided
      if (response.data.token) {
        sessionManager.setSession(response.data.token, response.data.user || response.data);
        localStorage.setItem('token', response.data.token);
        sessionStorage.setItem('token', response.data.token);
      }

      return response.data;
    } catch (error) {
      console.error('❌ Registration failed:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Registration failed. Please try again.'
      );
    }
  }
);

/**
 * Login user
 */
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

      // Store token if provided
      if (response.data.token) {
        sessionManager.setSession(response.data.token, response.data.user || response.data);
        localStorage.setItem('token', response.data.token);
        sessionStorage.setItem('token', response.data.token);
      }

      return response.data;
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Login failed. Please check your credentials.'
      );
    }
  }
);

/**
 * Logout user
 */
export const logout = createAsyncThunk(
  'auth/logout', 
  async (_, { rejectWithValue }) => {
    try {
      console.log('👋 Logging out user...');
      
      await api.post('/api/auth/logout');
      
      console.log('✅ Logout successful');
      sessionManager.clearSession();
      
      return null;
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Clear session anyway even if API call fails
      sessionManager.clearSession();
      return rejectWithValue(
        error.response?.data?.message || 
        'Logout failed'
      );
    }
  }
);

/**
 * Get current user (verify authentication)
 */
export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      // Only check if session is active
      if (!sessionManager.isSessionActive()) {
        console.log('❌ No active session - skipping getMe');
        return rejectWithValue('No active session');
      }
      
      console.log('👤 Fetching current user...');
      
      const response = await api.get('/api/auth/me');
      
      console.log('✅ User fetched successfully:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Get me failed:', error.response?.data);
      
      // Clear session if not authenticated
      if (error.response?.status === 401) {
        sessionManager.clearSession();
      }
      
      return rejectWithValue(
        error.response?.data?.message || 
        'Not authenticated'
      );
    }
  }
);

// ============================================
// Auth Slice
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
    /**
     * Reset state flags (not user data)
     */
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    
    /**
     * Clear user and reset entire auth state
     */
    clearUser: (state) => {
      state.user = null;
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
      state.isAuthenticated = false;
      sessionManager.clearSession();
      console.log('🧹 User cleared from state');
    },
    
    /**
     * Set user from session (for page refresh)
     */
    setUserFromSession: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      console.log('♻️ User restored from session');
    },
  },
  extraReducers: (builder) => {
    builder
      // ============================================
      // REGISTER
      // ============================================
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
        state.user = action.payload.user || action.payload;
        state.message = 'Registration successful!';
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isAuthenticated = false;
        state.message = action.payload;
        state.user = null;
      })
      
      // ============================================
      // LOGIN
      // ============================================
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
        state.user = action.payload.user || action.payload;
        state.message = 'Login successful!';
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isAuthenticated = false;
        state.message = action.payload;
        state.user = null;
      })
      
      // ============================================
      // LOGOUT
      // ============================================
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
        // Clear anyway even if logout fails
        state.user = null;
        state.isSuccess = false;
        state.isError = false;
        state.isAuthenticated = false;
        state.message = '';
        state.isLoading = false;
      })
      
      // ============================================
      // GET ME
      // ============================================
      .addCase(getMe.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload.user || action.payload;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(getMe.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      });
  },
});

// ============================================
// Export actions and reducer
// ============================================
export const { reset, clearUser, setUserFromSession } = authSlice.actions;
export default authSlice.reducer;

// ============================================
// Export configured axios instance for use in other slices
// ============================================
export { api };
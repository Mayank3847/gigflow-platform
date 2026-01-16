import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { sessionManager } from '../../utils/sessionManager';
import { clearNotifications } from './notificationSlice';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth`;
axios.defaults.withCredentials = true;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    console.log('🔵 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
      if (error.response.status === 401) {
        console.log('🔴 Unauthorized - Clearing session');
        sessionManager.clearSession();
        const isAuthRoute = error.config.url?.includes('/login') || error.config.url?.includes('/register');
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
      if (token) {
        sessionManager.setSession(token, user);
        localStorage.setItem('token', token);
        sessionStorage.setItem('token', token);
      }
      return responseData;
    } catch (error) {
      console.error('❌ Registration failed:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || error.message || 'Registration failed. Please try again.');
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
      if (token) {
        sessionManager.setSession(token, user);
        localStorage.setItem('token', token);
        sessionStorage.setItem('token', token);
      }
      return responseData;
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || error.message || 'Login failed. Please check your credentials.');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      console.log('👋 Logging out user...');
      await api.post('/api/auth/logout');
      console.log('✅ Logout successful');
      sessionManager.clearSession();
      dispatch(clearNotifications());
      return null;
    } catch (error) {
      console.error('❌ Logout error:', error);
      sessionManager.clearSession();
      dispatch(clearNotifications());
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      if (!sessionManager.isSessionActive()) {
        console.log('❌ No active session - skipping getMe');
        return rejectWithValue('No active session');
      }
      console.log('👤 Fetching current user...');
      const response = await api.get('/api/auth/me');
      console.log('✅ User fetched successfully:', response.data);
      return response.data || {};
    } catch (error) {
      console.error('❌ Get me failed:', error.response?.data);
      if (error.response?.status === 401) {
        sessionManager.clearSession();
      }
      return rejectWithValue(error.response?.data?.message || 'Not authenticated');
    }
  }
);

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
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isAuthenticated = false;
        state.message = action.payload || 'Registration failed';
        state.user = null;
      })
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
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isAuthenticated = false;
        state.message = action.payload || 'Login failed';
        state.user = null;
      })
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
      .addCase(getMe.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload?.user || action.payload || null;
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

export const { reset, clearUser, setUserFromSession } = authSlice.actions;
export default authSlice.reducer;
export { api };
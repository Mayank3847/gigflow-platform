import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { sessionManager } from '../../utils/sessionManager';

const API_URL = 'http://localhost:5000/api/auth';

axios.defaults.withCredentials = true;

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/login`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await axios.post(`${API_URL}/logout`);
    sessionManager.clearSession();
  } catch (error) {
    console.error('Logout error:', error);
    sessionManager.clearSession();
  }
});

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      // Only check if session is active
      if (!sessionManager.isSessionActive()) {
        console.log('❌ No active session - skipping getMe');
        return rejectWithValue('No active session');
      }
      
      const response = await axios.get(`${API_URL}/me`);
      return response.data;
    } catch (error) {
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
      sessionManager.clearSession();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isSuccess = false;
        state.isError = false;
        state.message = '';
        state.isLoading = false;
      })
      .addCase(getMe.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(getMe.rejected, (state) => {
        state.user = null;
        state.isLoading = false;
      });
  },
});

export const { reset, clearUser } = authSlice.actions;
export default authSlice.reducer;
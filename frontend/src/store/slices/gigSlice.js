import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/gigs`;

axios.defaults.withCredentials = true;

export const fetchGigs = createAsyncThunk(
  'gigs/fetchAll',
  async (search = '', { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}${search ? `?search=${search}` : ''}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch gigs');
    }
  }
);

export const fetchMyGigs = createAsyncThunk(
  'gigs/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/my/posted`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch your gigs');
    }
  }
);

export const createGig = createAsyncThunk(
  'gigs/create',
  async (gigData, { rejectWithValue }) => {
    try {
      console.log('🚀 Sending gig to API:', gigData);
      const response = await axios.post(API_URL, gigData);
      console.log('✅ Gig API response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Gig API error:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to create gig');
    }
  }
);

const gigSlice = createSlice({
  name: 'gigs',
  initialState: {
    gigs: [],
    myGigs: [],
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
  },
  extraReducers: (builder) => {
    builder
      // Fetch Gigs
      .addCase(fetchGigs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchGigs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.gigs = action.payload;
      })
      .addCase(fetchGigs.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Fetch My Gigs
      .addCase(fetchMyGigs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMyGigs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myGigs = action.payload;
      })
      .addCase(fetchMyGigs.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create Gig
      .addCase(createGig.pending, (state) => {
        console.log('⏳ Gig creation pending...');
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = '';
      })
      .addCase(createGig.fulfilled, (state, action) => {
        console.log('✅ Gig creation fulfilled');
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = 'Gig posted successfully!';
        state.gigs.unshift(action.payload);
        state.myGigs.unshift(action.payload);
      })
      .addCase(createGig.rejected, (state, action) => {
        console.log('❌ Gig creation rejected');
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload;
      });
  },
});

export const { reset } = gigSlice.actions;
export default gigSlice.reducer;
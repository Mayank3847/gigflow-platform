import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from './authSlice';

export const getAllGigs = createAsyncThunk(
  'gigs/getAll',
  async ({ search = '' } = {}, { rejectWithValue }) => {
    try {
      console.log('📥 Fetching all gigs...');
      const url = search ? `/api/gigs?search=${encodeURIComponent(search)}` : '/api/gigs';
      const response = await api.get(url);
      const gigs = Array.isArray(response.data) ? response.data : Array.isArray(response.data?.gigs) ? response.data.gigs : [];
      console.log('✅ Gigs fetched successfully:', gigs.length, 'gigs');
      return gigs;
    } catch (error) {
      console.error('❌ Failed to fetch gigs:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to load gigs');
    }
  }
);

export const getMyGigs = createAsyncThunk(
  'gigs/getMy',
  async (_, { rejectWithValue }) => {
    try {
      console.log('📥 Fetching my gigs...');
      const response = await api.get('/api/gigs/my-gigs');
      const gigs = Array.isArray(response.data) ? response.data : Array.isArray(response.data?.gigs) ? response.data.gigs : [];
      console.log('✅ My gigs fetched successfully:', gigs.length, 'gigs');
      return gigs;
    } catch (error) {
      console.error('❌ Failed to fetch my gigs:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to load your gigs');
    }
  }
);

export const getGigById = createAsyncThunk(
  'gigs/getById',
  async (gigId, { rejectWithValue }) => {
    try {
      console.log('📥 Fetching gig:', gigId);
      const response = await api.get(`/api/gigs/${gigId}`);
      const gig = response.data?.gig || response.data || null;
      console.log('✅ Gig fetched successfully:', gig?.title || 'Unknown');
      return gig;
    } catch (error) {
      console.error('❌ Failed to fetch gig:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to load gig details');
    }
  }
);

export const createGig = createAsyncThunk(
  'gigs/create',
  async (gigData, { rejectWithValue }) => {
    try {
      console.log('📝 Creating new gig:', gigData.title);
      const response = await api.post('/api/gigs', {
        title: gigData.title?.trim(),
        description: gigData.description?.trim(),
        budget: parseFloat(gigData.budget),
      });
      const gig = response.data?.gig || response.data || null;
      console.log('✅ Gig created successfully:', gig);
      return gig;
    } catch (error) {
      console.error('❌ Failed to create gig:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to create gig. Please try again.');
    }
  }
);

export const updateGig = createAsyncThunk(
  'gigs/update',
  async ({ gigId, gigData }, { rejectWithValue }) => {
    try {
      console.log('🔄 Updating gig:', gigId);
      const response = await api.put(`/api/gigs/${gigId}`, {
        title: gigData.title?.trim(),
        description: gigData.description?.trim(),
        budget: parseFloat(gigData.budget),
      });
      const gig = response.data?.gig || response.data || null;
      console.log('✅ Gig updated successfully:', gig);
      return gig;
    } catch (error) {
      console.error('❌ Failed to update gig:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to update gig');
    }
  }
);

export const deleteGig = createAsyncThunk(
  'gigs/delete',
  async (gigId, { rejectWithValue }) => {
    try {
      console.log('🗑️ Deleting gig:', gigId);
      await api.delete(`/api/gigs/${gigId}`);
      console.log('✅ Gig deleted successfully');
      return gigId;
    } catch (error) {
      console.error('❌ Failed to delete gig:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to delete gig');
    }
  }
);

const gigSlice = createSlice({
  name: 'gigs',
  initialState: {
    gigs: [],
    myGigs: [],
    currentGig: null,
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: '',
    searchQuery: '',
  },
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    clearGigs: (state) => {
      state.gigs = [];
      state.myGigs = [];
      state.currentGig = null;
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload || '';
    },
    clearCurrentGig: (state) => {
      state.currentGig = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllGigs.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(getAllGigs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.gigs = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getAllGigs.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Failed to load gigs';
        state.gigs = [];
      })
      .addCase(getMyGigs.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(getMyGigs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.myGigs = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getMyGigs.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Failed to load your gigs';
        state.myGigs = [];
      })
      .addCase(getGigById.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(getGigById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentGig = action.payload || null;
      })
      .addCase(getGigById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Failed to load gig';
        state.currentGig = null;
      })
      .addCase(createGig.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = '';
      })
      .addCase(createGig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (action.payload && action.payload._id) {
          state.gigs.unshift(action.payload);
          state.myGigs.unshift(action.payload);
        }
        state.message = 'Gig created successfully!';
      })
      .addCase(createGig.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload || 'Failed to create gig';
      })
      .addCase(updateGig.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = '';
      })
      .addCase(updateGig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (action.payload && action.payload._id) {
          const update = action.payload;
          const gIdx = state.gigs.findIndex(g => g._id === update._id);
          if (gIdx !== -1) state.gigs[gIdx] = update;
          const mIdx = state.myGigs.findIndex(g => g._id === update._id);
          if (mIdx !== -1) state.myGigs[mIdx] = update;
          if (state.currentGig?._id === update._id) {
            state.currentGig = update;
          }
        }
        state.message = 'Gig updated successfully!';
      })
      .addCase(updateGig.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Failed to update gig';
      })
      .addCase(deleteGig.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(deleteGig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (action.payload) {
          const id = action.payload;
          state.gigs = state.gigs.filter(g => g._id !== id);
          state.myGigs = state.myGigs.filter(g => g._id !== id);
          if (state.currentGig?._id === id) {
            state.currentGig = null;
          }
        }
        state.message = 'Gig deleted successfully!';
      })
      .addCase(deleteGig.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Failed to delete gig';
      });
  },
});

export const { reset, clearGigs, setSearchQuery, clearCurrentGig } = gigSlice.actions;
export default gigSlice.reducer;
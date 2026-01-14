// src/redux/slices/gigSlice.js - Complete Gig Management Slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from './authSlice'; // ✅ shared authenticated axios instance

// ============================================
// Async Thunks for Gig Operations
// ============================================

/**
 * Fetch all gigs (public)
 */
export const getAllGigs = createAsyncThunk(
  'gigs/getAll',
  async ({ search = '' } = {}, { rejectWithValue }) => {
    try {
      console.log('📥 Fetching all gigs...');

      const url = search
        ? `/api/gigs?search=${encodeURIComponent(search)}`
        : '/api/gigs';

      const response = await api.get(url);

      console.log(
        '✅ Gigs fetched successfully:',
        Array.isArray(response.data) ? response.data.length : 0,
        'gigs'
      );

      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch gigs:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load gigs'
      );
    }
  }
);

/**
 * Fetch user's own gigs (requires auth)
 */
export const getMyGigs = createAsyncThunk(
  'gigs/getMy',
  async (_, { rejectWithValue }) => {
    try {
      console.log('📥 Fetching my gigs...');

      // ✅ SINGLE CANONICAL ROUTE (backend supports both, but UI uses one)
      const response = await api.get('/api/gigs/my-gigs');

      console.log(
        '✅ My gigs fetched successfully:',
        Array.isArray(response.data) ? response.data.length : 0,
        'gigs'
      );

      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch my gigs:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load your gigs'
      );
    }
  }
);

/**
 * Fetch single gig by ID
 */
export const getGigById = createAsyncThunk(
  'gigs/getById',
  async (gigId, { rejectWithValue }) => {
    try {
      console.log('📥 Fetching gig:', gigId);

      const response = await api.get(`/api/gigs/${gigId}`);

      console.log('✅ Gig fetched successfully:', response.data?.title);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch gig:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load gig details'
      );
    }
  }
);

/**
 * Create new gig (requires auth)
 */
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

      console.log('✅ Gig created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create gig:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to create gig. Please try again.'
      );
    }
  }
);

/**
 * Update existing gig (requires auth + ownership)
 * ⚠️ Backend route may or may not exist — kept for future use (NO REMOVAL)
 */
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

      console.log('✅ Gig updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update gig:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update gig'
      );
    }
  }
);

/**
 * Delete gig (requires auth + ownership)
 * ⚠️ Backend route may or may not exist — kept intentionally
 */
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
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete gig'
      );
    }
  }
);

// ============================================
// Gig Slice
// ============================================

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
    /**
     * Reset async flags
     */
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },

    /**
     * Clear all gig-related state
     */
    clearGigs: (state) => {
      state.gigs = [];
      state.myGigs = [];
      state.currentGig = null;
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },

    /**
     * Store search query
     */
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },

    /**
     * Clear selected gig
     */
    clearCurrentGig: (state) => {
      state.currentGig = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ===============================
      // GET ALL GIGS
      // ===============================
      .addCase(getAllGigs.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(getAllGigs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.gigs = action.payload;
      })
      .addCase(getAllGigs.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.gigs = [];
      })

      // ===============================
      // GET MY GIGS
      // ===============================
      .addCase(getMyGigs.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(getMyGigs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.myGigs = action.payload;
      })
      .addCase(getMyGigs.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.myGigs = [];
      })

      // ===============================
      // GET GIG BY ID
      // ===============================
      .addCase(getGigById.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(getGigById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentGig = action.payload;
      })
      .addCase(getGigById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.currentGig = null;
      })

      // ===============================
      // CREATE GIG
      // ===============================
      .addCase(createGig.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = '';
      })
      .addCase(createGig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.gigs.unshift(action.payload);
        state.myGigs.unshift(action.payload);
        state.message = 'Gig created successfully!';
      })
      .addCase(createGig.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload;
      })

      // ===============================
      // UPDATE GIG
      // ===============================
      .addCase(updateGig.fulfilled, (state, action) => {
        const update = action.payload;

        const gIdx = state.gigs.findIndex(g => g._id === update._id);
        if (gIdx !== -1) state.gigs[gIdx] = update;

        const mIdx = state.myGigs.findIndex(g => g._id === update._id);
        if (mIdx !== -1) state.myGigs[mIdx] = update;

        if (state.currentGig?._id === update._id) {
          state.currentGig = update;
        }

        state.message = 'Gig updated successfully!';
        state.isSuccess = true;
        state.isLoading = false;
      })

      // ===============================
      // DELETE GIG
      // ===============================
      .addCase(deleteGig.fulfilled, (state, action) => {
        const id = action.payload;

        state.gigs = state.gigs.filter(g => g._id !== id);
        state.myGigs = state.myGigs.filter(g => g._id !== id);

        if (state.currentGig?._id === id) {
          state.currentGig = null;
        }

        state.message = 'Gig deleted successfully!';
        state.isSuccess = true;
        state.isLoading = false;
      });
  },
});

// ============================================
// Export actions and reducer
// ============================================
export const {
  reset,
  clearGigs,
  setSearchQuery,
  clearCurrentGig,
} = gigSlice.actions;

export default gigSlice.reducer;

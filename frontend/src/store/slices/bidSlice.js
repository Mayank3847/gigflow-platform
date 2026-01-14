import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from './authSlice'; // ✅ USE SAME AUTHENTICATED AXIOS INSTANCE

// ============================================
// Async Thunks
// ============================================

export const createBid = createAsyncThunk(
  'bids/create',
  async (bidData, { rejectWithValue }) => {
    try {
      console.log('🚀 Sending bid to API:', bidData);
      const response = await api.post('/api/bids', bidData);
      console.log('✅ API response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ API error:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create bid'
      );
    }
  }
);

export const fetchBidsByGig = createAsyncThunk(
  'bids/fetchByGig',
  async (gigId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/bids/${gigId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch bids'
      );
    }
  }
);

export const fetchMyBids = createAsyncThunk(
  'bids/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/bids/my/bids');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch bids'
      );
    }
  }
);

export const hireBid = createAsyncThunk(
  'bids/hire',
  async (bidId, { rejectWithValue }) => {
    try {
      console.log('💼 Hiring bid:', bidId);
      const response = await api.patch(`/api/bids/${bidId}/hire`);
      console.log('✅ Hire response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Hire error:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to hire freelancer'
      );
    }
  }
);

export const rejectBid = createAsyncThunk(
  'bids/reject',
  async (bidId, { rejectWithValue }) => {
    try {
      console.log('❌ Rejecting bid:', bidId);
      const response = await api.patch(`/api/bids/${bidId}/reject`);
      console.log('✅ Reject response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Reject error:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to reject bid'
      );
    }
  }
);

export const updateBid = createAsyncThunk(
  'bids/update',
  async ({ bidId, price, message }, { rejectWithValue }) => {
    try {
      console.log('📝 Updating bid:', bidId);
      const response = await api.patch(`/api/bids/${bidId}/update`, {
        price,
        message,
      });
      console.log('✅ Update response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Update error:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update bid'
      );
    }
  }
);

// ============================================
// Slice
// ============================================

const bidSlice = createSlice({
  name: 'bids',
  initialState: {
    bids: [],
    myBids: [],
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
      // Create Bid
      .addCase(createBid.pending, (state) => {
        console.log('⏳ Bid creation pending...');
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = '';
      })
      .addCase(createBid.fulfilled, (state, action) => {
        console.log('✅ Bid creation fulfilled');
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = 'Bid submitted successfully!';
        state.myBids.unshift(action.payload);
      })
      .addCase(createBid.rejected, (state, action) => {
        console.log('❌ Bid creation rejected');
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload;
      })

      // Fetch Bids by Gig
      .addCase(fetchBidsByGig.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBidsByGig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bids = action.payload;
      })
      .addCase(fetchBidsByGig.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Fetch My Bids
      .addCase(fetchMyBids.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMyBids.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myBids = action.payload;
      })
      .addCase(fetchMyBids.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Hire Bid
      .addCase(hireBid.pending, (state) => {
        console.log('⏳ Hiring pending...');
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = '';
      })
      .addCase(hireBid.fulfilled, (state) => {
        console.log('✅ Hiring fulfilled');
        state.isLoading = false;
        state.isSuccess = true;
        state.message = 'Freelancer hired successfully!';
      })
      .addCase(hireBid.rejected, (state, action) => {
        console.log('❌ Hiring rejected');
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Reject Bid
      .addCase(rejectBid.pending, (state) => {
        console.log('⏳ Rejecting bid...');
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(rejectBid.fulfilled, (state) => {
        console.log('✅ Bid rejected');
        state.isLoading = false;
        state.isSuccess = true;
        state.message = 'Bid rejected successfully';
      })
      .addCase(rejectBid.rejected, (state, action) => {
        console.log('❌ Reject failed');
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Update Bid
      .addCase(updateBid.pending, (state) => {
        console.log('⏳ Updating bid...');
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(updateBid.fulfilled, (state, action) => {
        console.log('✅ Bid updated');
        state.isLoading = false;
        state.isSuccess = true;
        state.message = 'Bid updated successfully!';
        const index = state.myBids.findIndex(
          (bid) => bid._id === action.payload.bid._id
        );
        if (index !== -1) {
          state.myBids[index] = action.payload.bid;
        }
      })
      .addCase(updateBid.rejected, (state, action) => {
        console.log('❌ Update failed');
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = bidSlice.actions;
export default bidSlice.reducer;

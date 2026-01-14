import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import gigReducer from './slices/gigSlice';
import bidReducer from './slices/bidSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    gigs: gigReducer,
    bids: bidReducer,
    notifications: notificationReducer,
  },
});

// Clear state when window/tab is closed
window.addEventListener('beforeunload', () => {
  // This will trigger the state to reset
  sessionStorage.clear();
  localStorage.clear();
});
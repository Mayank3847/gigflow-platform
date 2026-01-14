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

/**
 * ❌ REMOVED:
 * window.beforeunload clearing storage
 *
 * WHY:
 * - Breaks auth persistence
 * - Breaks cookies
 * - Breaks sockets
 * - Causes random 401s
 *
 * Session lifecycle MUST be controlled by sessionManager only
 */

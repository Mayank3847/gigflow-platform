// src/redux/store.js - FINAL COMPLETE VERSION
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
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for non-serializable values
        ignoredActions: [
          'socket/connect',
          'socket/disconnect',
          'notifications/addNotification',
        ],
        // Ignore these paths in state
        ignoredPaths: ['socket.connection'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

/**
 * ❌ REMOVED:
 * window.beforeunload clearing storage
 *
 * WHY:
 * - Breaks auth persistence across page refreshes
 * - Breaks HttpOnly cookie authentication
 * - Breaks Socket.io connections
 * - Causes random 401 errors
 * - Forces users to re-login unnecessarily
 *
 * ✅ CORRECT APPROACH:
 * Session lifecycle is managed by:
 * 1. sessionManager utility (handles token expiry)
 * 2. Backend JWT expiration (7 days)
 * 3. User explicit logout action
 * 
 * DO NOT clear storage on page refresh/reload
 */

// ✅ Optional: Add state logging for development
if (process.env.NODE_ENV === 'development') {
  store.subscribe(() => {
    const state = store.getState();
    
    console.log('📊 Redux State Update:', {
      auth: {
        isAuthenticated: state.auth?.isAuthenticated || false,
        hasUser: !!state.auth?.user,
        userName: state.auth?.user?.name || 'N/A',
      },
      gigs: {
        totalGigs: state.gigs?.gigs?.length || 0,
        myGigs: state.gigs?.myGigs?.length || 0,
        isLoading: state.gigs?.isLoading || false,
      },
      bids: {
        totalBids: state.bids?.bids?.length || 0,
        myBids: state.bids?.myBids?.length || 0,
      },
      notifications: {
        count: state.notifications?.notifications?.length || 0,
        unread: state.notifications?.unreadCount || 0,
      },
    });
  });
}

export default store;
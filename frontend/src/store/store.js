// src/store/store.js - FINAL FIXED VERSION
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import gigReducer from './slices/gigSlice';
import bidReducer from './slices/bidSlice';
import notificationReducer from './slices/notificationSlice';

// ============================================
// CONFIGURE STORE
// ============================================
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
  devTools: true, // ✅ ALWAYS enable (will only work in dev anyway)
});

// ============================================
// EXPOSE STORE TO WINDOW FOR DEBUGGING
// ============================================
if (typeof window !== 'undefined') {
  window.store = store;
  window.getReduxState = () => store.getState();
  console.log('🔍 Debug helpers available:');
  console.log('  - window.store (full Redux store)');
  console.log('  - window.getReduxState() (current state)');
}

// ============================================
// STATE VALIDATION (runs on every state change)
// ============================================
store.subscribe(() => {
  const state = store.getState();
  
  // ✅ DEFENSIVE: Validate that all state slices exist
  if (!state.auth) {
    console.error('❌ CRITICAL: auth state is undefined!');
  }
  if (!state.gigs) {
    console.error('❌ CRITICAL: gigs state is undefined!');
  }
  if (!state.bids) {
    console.error('❌ CRITICAL: bids state is undefined!');
  }
  if (!state.notifications) {
    console.error('❌ CRITICAL: notifications state is undefined!');
  }

  // ✅ DEFENSIVE: Validate arrays in state
  if (state.gigs && !Array.isArray(state.gigs.gigs)) {
    console.error('❌ CRITICAL: state.gigs.gigs is not an array:', state.gigs.gigs);
  }
  if (state.gigs && !Array.isArray(state.gigs.myGigs)) {
    console.error('❌ CRITICAL: state.gigs.myGigs is not an array:', state.gigs.myGigs);
  }
  if (state.bids && !Array.isArray(state.bids.bids)) {
    console.error('❌ CRITICAL: state.bids.bids is not an array:', state.bids.bids);
  }
  if (state.bids && !Array.isArray(state.bids.myBids)) {
    console.error('❌ CRITICAL: state.bids.myBids is not an array:', state.bids.myBids);
  }
  if (state.notifications && !Array.isArray(state.notifications.notifications)) {
    console.error('❌ CRITICAL: state.notifications.notifications is not an array:', state.notifications.notifications);
  }

  // ✅ Log state updates in development
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Redux State Update:', {
      auth: {
        isAuthenticated: state.auth?.isAuthenticated || false,
        hasUser: !!state.auth?.user,
        userName: state.auth?.user?.name || 'N/A',
      },
      gigs: {
        totalGigs: Array.isArray(state.gigs?.gigs) ? state.gigs.gigs.length : 'NOT AN ARRAY',
        myGigs: Array.isArray(state.gigs?.myGigs) ? state.gigs.myGigs.length : 'NOT AN ARRAY',
        isLoading: state.gigs?.isLoading || false,
      },
      bids: {
        totalBids: Array.isArray(state.bids?.bids) ? state.bids.bids.length : 'NOT AN ARRAY',
        myBids: Array.isArray(state.bids?.myBids) ? state.bids.myBids.length : 'NOT AN ARRAY',
      },
      notifications: {
        count: Array.isArray(state.notifications?.notifications) ? state.notifications.notifications.length : 'NOT AN ARRAY',
        unread: state.notifications?.unreadCount || 0,
      },
    });
  }
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

export default store;
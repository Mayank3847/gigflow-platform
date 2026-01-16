// src/store/store.js - ABSOLUTE FINAL VERSION
import { configureStore } from '@reduxjs/toolkit';

// ============================================
// Import reducers - CHECK YOUR ACTUAL PATH!
// ============================================
// If your files are in src/redux/slices/, change './slices/' to '../redux/slices/'
// If your files are in src/store/slices/, use './slices/'

// ✅ TRY THIS PATH FIRST (most common):
import authReducer from './slices/authSlice';
import gigReducer from './slices/gigSlice';
import bidReducer from './slices/bidSlice';
import notificationReducer from './slices/notificationSlice';

// ❌ IF ABOVE DOESN'T WORK, COMMENT IT OUT AND TRY THIS:
// import authReducer from '../redux/slices/authSlice';
// import gigReducer from '../redux/slices/gigSlice';
// import bidReducer from '../redux/slices/bidSlice';
// import notificationReducer from '../redux/slices/notificationSlice';

// ============================================
// VALIDATE IMPORTS
// ============================================
console.log('🔍 Validating reducers...');
console.log('authReducer type:', typeof authReducer);
console.log('gigReducer type:', typeof gigReducer);
console.log('bidReducer type:', typeof bidReducer);
console.log('notificationReducer type:', typeof notificationReducer);

// Check if any are undefined
if (typeof authReducer !== 'function') {
  console.error('❌ CRITICAL: authReducer is not a function! Check import path.');
}
if (typeof gigReducer !== 'function') {
  console.error('❌ CRITICAL: gigReducer is not a function! Check import path.');
}
if (typeof bidReducer !== 'function') {
  console.error('❌ CRITICAL: bidReducer is not a function! Check import path.');
}
if (typeof notificationReducer !== 'function') {
  console.error('❌ CRITICAL: notificationReducer is not a function! Check import path.');
}

// ============================================
// CREATE STORE
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
        ignoredActions: [
          'socket/connect',
          'socket/disconnect',
          'notifications/addNotification',
        ],
        ignoredPaths: ['socket.connection'],
      },
    }),
  devTools: true,
});

// ============================================
// VALIDATE INITIAL STATE
// ============================================
try {
  const initialState = store.getState();
  console.log('✅ Redux store created successfully');
  console.log('📊 Initial state:', initialState);

  // Validate each slice
  if (!initialState.auth) {
    console.error('❌ CRITICAL: auth state is undefined!');
  } else {
    console.log('✅ auth state initialized:', Object.keys(initialState.auth));
  }

  if (!initialState.gigs) {
    console.error('❌ CRITICAL: gigs state is undefined!');
  } else {
    console.log('✅ gigs state initialized:', Object.keys(initialState.gigs));
  }

  if (!initialState.bids) {
    console.error('❌ CRITICAL: bids state is undefined!');
  } else {
    console.log('✅ bids state initialized:', Object.keys(initialState.bids));
  }

  if (!initialState.notifications) {
    console.error('❌ CRITICAL: notifications state is undefined!');
  } else {
    console.log('✅ notifications state initialized:', Object.keys(initialState.notifications));
  }

  // Validate arrays
  if (!Array.isArray(initialState.gigs?.gigs)) {
    console.error('❌ state.gigs.gigs is not an array!');
  }
  if (!Array.isArray(initialState.gigs?.myGigs)) {
    console.error('❌ state.gigs.myGigs is not an array!');
  }
  if (!Array.isArray(initialState.bids?.bids)) {
    console.error('❌ state.bids.bids is not an array!');
  }
  if (!Array.isArray(initialState.bids?.myBids)) {
    console.error('❌ state.bids.myBids is not an array!');
  }
  if (!Array.isArray(initialState.notifications?.notifications)) {
    console.error('❌ state.notifications.notifications is not an array!');
  }

} catch (error) {
  console.error('❌ CRITICAL ERROR creating store:', error);
}

// ============================================
// EXPOSE TO WINDOW
// ============================================
if (typeof window !== 'undefined') {
  window.store = store;
  window.getReduxState = () => store.getState();
  console.log('✅ Redux store exposed on window.store');
  console.log('✅ window.getReduxState() available');
}

// ============================================
// STATE CHANGE MONITORING
// ============================================
store.subscribe(() => {
  const state = store.getState();
  
  // Validate on every change
  if (!Array.isArray(state.gigs?.gigs)) {
    console.error('❌ RUNTIME ERROR: gigs.gigs became non-array!', state.gigs?.gigs);
  }
  if (!Array.isArray(state.gigs?.myGigs)) {
    console.error('❌ RUNTIME ERROR: gigs.myGigs became non-array!', state.gigs?.myGigs);
  }
  if (!Array.isArray(state.bids?.bids)) {
    console.error('❌ RUNTIME ERROR: bids.bids became non-array!', state.bids?.bids);
  }
  if (!Array.isArray(state.bids?.myBids)) {
    console.error('❌ RUNTIME ERROR: bids.myBids became non-array!', state.bids?.myBids);
  }
  if (!Array.isArray(state.notifications?.notifications)) {
    console.error('❌ RUNTIME ERROR: notifications.notifications became non-array!', state.notifications?.notifications);
  }
});

export default store;
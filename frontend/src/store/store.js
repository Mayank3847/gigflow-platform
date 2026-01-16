import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import gigReducer from './slices/gigSlice';
import bidReducer from './slices/bidSlice';
import notificationReducer from './slices/notificationSlice';

// Validate that all reducers are functions
const validateReducer = (reducer, name) => {
  if (typeof reducer !== 'function') {
    console.error(`❌ CRITICAL: ${name} is not a function!`);
    throw new Error(`${name} must be a reducer function`);
  }
  return reducer;
};

// Create store with validated reducers
export const store = configureStore({
  reducer: {
    auth: validateReducer(authReducer, 'authReducer'),
    gigs: validateReducer(gigReducer, 'gigReducer'),
    bids: validateReducer(bidReducer, 'bidReducer'),
    notifications: validateReducer(notificationReducer, 'notificationReducer'),
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
  devTools: process.env.NODE_ENV !== 'production',
});

// Log initial state only in development
if (process.env.NODE_ENV === 'development') {
  try {
    const initialState = store.getState();
    console.log('✅ Redux store created successfully');
    console.log('📊 Initial state structure:', {
      auth: initialState.auth ? '✓' : '✗',
      gigs: initialState.gigs ? '✓' : '✗',
      bids: initialState.bids ? '✓' : '✗',
      notifications: initialState.notifications ? '✓' : '✗',
    });

    // Validate arrays exist
    const validations = [
      { path: 'gigs.gigs', value: initialState.gigs?.gigs },
      { path: 'gigs.myGigs', value: initialState.gigs?.myGigs },
      { path: 'bids.bids', value: initialState.bids?.bids },
      { path: 'bids.myBids', value: initialState.bids?.myBids },
      { path: 'notifications.notifications', value: initialState.notifications?.notifications },
    ];

    validations.forEach(({ path, value }) => {
      if (!Array.isArray(value)) {
        console.error(`❌ state.${path} is not an array:`, value);
      } else {
        console.log(`✅ state.${path} initialized (${value.length} items)`);
      }
    });
  } catch (error) {
    console.error('❌ CRITICAL ERROR creating store:', error);
  }

  // Expose to window for debugging
  if (typeof window !== 'undefined') {
    window.store = store;
    window.getReduxState = () => store.getState();
    console.log('✅ Debug: window.store and window.getReduxState() available');
  }
}

export default store;
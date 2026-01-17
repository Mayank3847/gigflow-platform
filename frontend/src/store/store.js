import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import gigReducer from './slices/gigSlice';
import bidReducer from './slices/bidSlice';
import notificationReducer from './slices/notificationSlice';

// Validate reducers are functions
const validateReducer = (reducer, name) => {
  if (typeof reducer !== 'function') {
    throw new Error(`${name} must be a reducer function`);
  }
  return reducer;
};

// Create store
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
        ignoredActions: ['socket/connect', 'socket/disconnect', 'notifications/addNotification'],
        ignoredPaths: ['socket.connection'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Validate initial state AFTER store creation
const validateInitialState = () => {
  try {
    const state = store.getState();
    
    console.log('✅ Redux Store Created');
    console.log('📊 State Structure:', {
      auth: !!state.auth,
      gigs: !!state.gigs,
      bids: !!state.bids,
      notifications: !!state.notifications,
    });

    // Validate arrays
    const validations = [
      { path: 'gigs.gigs', value: state.gigs?.gigs },
      { path: 'gigs.myGigs', value: state.gigs?.myGigs },
      { path: 'bids.bids', value: state.bids?.bids },
      { path: 'bids.myBids', value: state.bids?.myBids },
      { path: 'notifications.notifications', value: state.notifications?.notifications },
    ];

    let hasErrors = false;
    validations.forEach(({ path, value }) => {
      if (!Array.isArray(value)) {
        console.error(`❌ state.${path} is NOT an array:`, typeof value, value);
        hasErrors = true;
      } else {
        console.log(`✅ state.${path} is array (${value.length} items)`);
      }
    });

    if (hasErrors) {
      console.error('❌ CRITICAL: Store has initialization errors!');
      console.error('Full state:', state);
    }
  } catch (error) {
    console.error('❌ Error validating store:', error);
  }
};

// Run validation
validateInitialState();

// Expose to window for debugging (development only)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  window.store = store;
  window.getReduxState = () => store.getState();
  console.log('🔧 Debug: window.store available');
}

export default store;
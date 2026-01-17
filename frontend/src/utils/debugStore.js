// Debug utility to check Redux state
export const debugStore = (store) => {
  const state = store.getState();
  
  console.log('🔍 DEBUGGING REDUX STATE:');
  console.log('=' .repeat(50));
  
  // Check auth
  console.log('AUTH:', {
    exists: !!state.auth,
    user: state.auth?.user,
    isAuthenticated: state.auth?.isAuthenticated,
  });
  
  // Check gigs
  console.log('GIGS:', {
    exists: !!state.gigs,
    gigs: Array.isArray(state.gigs?.gigs) ? `Array(${state.gigs.gigs.length})` : state.gigs?.gigs,
    myGigs: Array.isArray(state.gigs?.myGigs) ? `Array(${state.gigs.myGigs.length})` : state.gigs?.myGigs,
    currentGig: state.gigs?.currentGig,
  });
  
  // Check bids
  console.log('BIDS:', {
    exists: !!state.bids,
    bids: Array.isArray(state.bids?.bids) ? `Array(${state.bids.bids.length})` : state.bids?.bids,
    myBids: Array.isArray(state.bids?.myBids) ? `Array(${state.bids.myBids.length})` : state.bids?.myBids,
  });
  
  // Check notifications
  console.log('NOTIFICATIONS:', {
    exists: !!state.notifications,
    notifications: Array.isArray(state.notifications?.notifications) 
      ? `Array(${state.notifications.notifications.length})` 
      : state.notifications?.notifications,
  });
  
  console.log('=' .repeat(50));
  
  // Find undefined arrays
  const issues = [];
  if (!Array.isArray(state.gigs?.gigs)) issues.push('gigs.gigs is not an array');
  if (!Array.isArray(state.gigs?.myGigs)) issues.push('gigs.myGigs is not an array');
  if (!Array.isArray(state.bids?.bids)) issues.push('bids.bids is not an array');
  if (!Array.isArray(state.bids?.myBids)) issues.push('bids.myBids is not an array');
  if (!Array.isArray(state.notifications?.notifications)) issues.push('notifications.notifications is not an array');
  
  if (issues.length > 0) {
    console.error('❌ ISSUES FOUND:', issues);
  } else {
    console.log('✅ All arrays properly initialized');
  }
  
  return state;
};
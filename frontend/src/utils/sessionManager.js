// Session manager to detect browser close vs tab close

const SESSION_KEY = 'gigflow_session_active';
const USER_KEY = 'gigflow_user_persist';

export const sessionManager = {
  // Initialize session on app start
  initSession: () => {
    // Check if this is a new browser session
    const wasSessionActive = sessionStorage.getItem(SESSION_KEY);
    
    if (!wasSessionActive) {
      // New browser session - clear any persisted auth
      console.log('🔄 New browser session detected - clearing auth');
      localStorage.removeItem(USER_KEY);
      sessionStorage.setItem(SESSION_KEY, 'true');
      return false; // Not authenticated
    }
    
    console.log('✅ Continuing existing session');
    return true; // Existing session
  },

  // Mark session as active (call after login)
  markActive: () => {
    sessionStorage.setItem(SESSION_KEY, 'true');
    console.log('✅ Session marked as active');
  },

  // Clear session (call on logout)
  clearSession: () => {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(USER_KEY);
    console.log('🧹 Session cleared');
  },

  // Check if session is active
  isSessionActive: () => {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  }
};
// frontend/src/utils/sessionManager.js - COMPLETE FIXED VERSION
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const ACTIVITY_KEY = 'last_activity';
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const sessionManager = {
  /**
   * Set session - ONLY use sessionStorage (clears on browser close)
   */
  setSession: (token, user) => {
    // ❌ REMOVE localStorage - only use sessionStorage
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    sessionStorage.setItem(ACTIVITY_KEY, Date.now().toString());
    console.log('✅ Session set (will clear on browser close)');
  },

  /**
   * Get token
   */
  getToken: () => {
    // ❌ ONLY check sessionStorage
    return sessionStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get user
   */
  getUser: () => {
    // ❌ ONLY check sessionStorage
    const userStr = sessionStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  },

  /**
   * Check if session is active
   */
  isSessionActive: () => {
    const token = sessionStorage.getItem(TOKEN_KEY);
    const lastActivity = sessionStorage.getItem(ACTIVITY_KEY);

    if (!token || !lastActivity) {
      return false;
    }

    const timeSinceActivity = Date.now() - parseInt(lastActivity);
    if (timeSinceActivity > SESSION_DURATION) {
      sessionManager.clearSession();
      return false;
    }

    return true;
  },

  /**
   * Mark activity
   */
  markActive: () => {
    if (sessionStorage.getItem(TOKEN_KEY)) {
      sessionStorage.setItem(ACTIVITY_KEY, Date.now().toString());
    }
  },

  /**
   * Clear session - clears BOTH localStorage and sessionStorage
   */
  clearSession: () => {
    // Clear sessionStorage
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(ACTIVITY_KEY);
    
    // ✅ ALSO clear localStorage (for old sessions)
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ACTIVITY_KEY);
    
    console.log('🧹 Session cleared completely');
  },

  /**
   * Refresh session
   */
  refreshSession: () => {
    const token = sessionManager.getToken();
    const user = sessionManager.getUser();

    if (token && user && sessionManager.isSessionActive()) {
      sessionManager.markActive();
      return true;
    }

    sessionManager.clearSession();
    return false;
  }
};

// Check session on page load
if (typeof window !== 'undefined') {
  // Clear any old localStorage sessions
  if (localStorage.getItem(TOKEN_KEY) && !sessionStorage.getItem(TOKEN_KEY)) {
    console.log('🧹 Clearing old localStorage session');
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ACTIVITY_KEY);
  }

  // Refresh session on load
  window.addEventListener('load', () => {
    if (!sessionManager.refreshSession()) {
      console.log('ℹ️ No valid session found');
    }
  });

  // Mark activity on user interaction
  ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
    window.addEventListener(event, () => {
      sessionManager.markActive();
    }, { passive: true });
  });
}
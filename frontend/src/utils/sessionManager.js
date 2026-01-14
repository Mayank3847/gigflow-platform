// src/utils/sessionManager.js - Session Management Utility
/**
 * Session Manager
 * Handles token and user session management in localStorage/sessionStorage
 */

const SESSION_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  SESSION_EXPIRY: 'sessionExpiry',
};

class SessionManager {
  /**
   * Set user session (token + user data)
   */
  setSession(token, user) {
    try {
      if (!token) {
        console.error('❌ SessionManager: No token provided');
        return false;
      }

      // Store token in both storages for redundancy
      localStorage.setItem(SESSION_KEYS.TOKEN, token);
      sessionStorage.setItem(SESSION_KEYS.TOKEN, token);

      // Store user data if provided
      if (user) {
        const userData = typeof user === 'string' ? user : JSON.stringify(user);
        localStorage.setItem(SESSION_KEYS.USER, userData);
        sessionStorage.setItem(SESSION_KEYS.USER, userData);
      }

      // Set expiry (7 days from now - matching JWT expiry)
      const expiryTime = Date.now() + (7 * 24 * 60 * 60 * 1000);
      localStorage.setItem(SESSION_KEYS.SESSION_EXPIRY, expiryTime.toString());
      sessionStorage.setItem(SESSION_KEYS.SESSION_EXPIRY, expiryTime.toString());

      console.log('✅ SessionManager: Session saved successfully');
      return true;
    } catch (error) {
      console.error('❌ SessionManager: Error setting session:', error);
      return false;
    }
  }

  /**
   * Get token from storage
   */
  getToken() {
    try {
      // Try sessionStorage first (more secure)
      let token = sessionStorage.getItem(SESSION_KEYS.TOKEN);
      
      // Fallback to localStorage
      if (!token) {
        token = localStorage.getItem(SESSION_KEYS.TOKEN);
        
        // If found in localStorage, copy to sessionStorage
        if (token) {
          sessionStorage.setItem(SESSION_KEYS.TOKEN, token);
        }
      }

      return token;
    } catch (error) {
      console.error('❌ SessionManager: Error getting token:', error);
      return null;
    }
  }

  /**
   * Get user data from storage
   */
  getUser() {
    try {
      // Try sessionStorage first
      let userData = sessionStorage.getItem(SESSION_KEYS.USER);
      
      // Fallback to localStorage
      if (!userData) {
        userData = localStorage.getItem(SESSION_KEYS.USER);
        
        // If found in localStorage, copy to sessionStorage
        if (userData) {
          sessionStorage.setItem(SESSION_KEYS.USER, userData);
        }
      }

      if (!userData) {
        return null;
      }

      // Parse if it's a JSON string
      try {
        return JSON.parse(userData);
      } catch {
        return userData;
      }
    } catch (error) {
      console.error('❌ SessionManager: Error getting user:', error);
      return null;
    }
  }

  /**
   * Check if session is active and not expired
   */
  isSessionActive() {
    try {
      const token = this.getToken();
      
      if (!token) {
        console.log('ℹ️ SessionManager: No token found');
        return false;
      }

      // Check expiry
      const expiryTime = localStorage.getItem(SESSION_KEYS.SESSION_EXPIRY) ||
                        sessionStorage.getItem(SESSION_KEYS.SESSION_EXPIRY);
      
      if (expiryTime) {
        const expiry = parseInt(expiryTime, 10);
        const now = Date.now();
        
        if (now > expiry) {
          console.log('⏰ SessionManager: Session expired');
          this.clearSession();
          return false;
        }
      }

      console.log('✅ SessionManager: Session is active');
      return true;
    } catch (error) {
      console.error('❌ SessionManager: Error checking session:', error);
      return false;
    }
  }

  /**
   * Clear entire session
   */
  clearSession() {
    try {
      // Clear from both storages
      Object.values(SESSION_KEYS).forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      console.log('🧹 SessionManager: Session cleared');
      return true;
    } catch (error) {
      console.error('❌ SessionManager: Error clearing session:', error);
      return false;
    }
  }

  /**
   * Update user data only (keep token)
   */
  updateUser(user) {
    try {
      if (!user) {
        console.error('❌ SessionManager: No user data provided');
        return false;
      }

      const userData = typeof user === 'string' ? user : JSON.stringify(user);
      localStorage.setItem(SESSION_KEYS.USER, userData);
      sessionStorage.setItem(SESSION_KEYS.USER, userData);

      console.log('✅ SessionManager: User data updated');
      return true;
    } catch (error) {
      console.error('❌ SessionManager: Error updating user:', error);
      return false;
    }
  }

  /**
   * Refresh session expiry (extend by 7 days)
   */
  refreshSession() {
    try {
      if (!this.isSessionActive()) {
        console.log('❌ SessionManager: Cannot refresh - no active session');
        return false;
      }

      const expiryTime = Date.now() + (7 * 24 * 60 * 60 * 1000);
      localStorage.setItem(SESSION_KEYS.SESSION_EXPIRY, expiryTime.toString());
      sessionStorage.setItem(SESSION_KEYS.SESSION_EXPIRY, expiryTime.toString());

      console.log('♻️ SessionManager: Session refreshed');
      return true;
    } catch (error) {
      console.error('❌ SessionManager: Error refreshing session:', error);
      return false;
    }
  }

  /**
   * Get session info for debugging
   */
  getSessionInfo() {
    return {
      hasToken: !!this.getToken(),
      hasUser: !!this.getUser(),
      isActive: this.isSessionActive(),
      user: this.getUser(),
      expiryTime: localStorage.getItem(SESSION_KEYS.SESSION_EXPIRY) ||
                  sessionStorage.getItem(SESSION_KEYS.SESSION_EXPIRY),
    };
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();

// Export class for testing
export default SessionManager;
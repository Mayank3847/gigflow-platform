// src/utils/sessionManager.js - Session Management Utility (FIXED)

const SESSION_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  SESSION_EXPIRY: 'sessionExpiry',
  BROWSER_SESSION: 'browserSession', // ✅ NEW
};

class SessionManager {
  /**
   * ✅ INIT SESSION (USED BY App.jsx)
   * ❗ FIXED:
   * - Forces login on browser restart
   * - Allows same-tab refresh
   * - NO feature loss
   */
  initSession() {
    try {
      const hasBrowserSession = sessionStorage.getItem(
        SESSION_KEYS.BROWSER_SESSION
      );

      // 🔴 Browser was fully restarted → force logout
      if (!hasBrowserSession) {
        console.log('🚪 New browser session detected - forcing logout');
        this.clearSession();

        // Mark fresh browser session
        sessionStorage.setItem(
          SESSION_KEYS.BROWSER_SESSION,
          'active'
        );

        return false;
      }

      // 🟡 Same browser session → check expiry
      const isActive = this.isSessionActive();

      if (!isActive) {
        console.log('⏰ Session expired - clearing auth');
        this.clearSession();
        return false;
      }

      console.log('♻️ Existing in-tab session restored');
      return true;
    } catch (error) {
      console.error('❌ SessionManager: initSession failed', error);
      this.clearSession();
      return false;
    }
  }

  /**
   * ✅ MARK SESSION ACTIVE (USED AFTER LOGIN / GETME)
   */
  markActive() {
    try {
      if (!this.getToken()) return false;

      const expiryTime = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days

      localStorage.setItem(
        SESSION_KEYS.SESSION_EXPIRY,
        expiryTime.toString()
      );
      sessionStorage.setItem(
        SESSION_KEYS.SESSION_EXPIRY,
        expiryTime.toString()
      );

      // ✅ Ensure browser session marker exists
      sessionStorage.setItem(
        SESSION_KEYS.BROWSER_SESSION,
        'active'
      );

      console.log('✅ Session marked as active');
      return true;
    } catch (error) {
      console.error('❌ SessionManager: markActive failed', error);
      return false;
    }
  }

  // ================= EXISTING CODE (UNCHANGED LOGIC) =================

  setSession(token, user) {
    try {
      if (!token) return false;

      localStorage.setItem(SESSION_KEYS.TOKEN, token);
      sessionStorage.setItem(SESSION_KEYS.TOKEN, token);

      if (user) {
        const userData =
          typeof user === 'string' ? user : JSON.stringify(user);

        localStorage.setItem(SESSION_KEYS.USER, userData);
        sessionStorage.setItem(SESSION_KEYS.USER, userData);
      }

      this.markActive();
      return true;
    } catch {
      return false;
    }
  }

  getToken() {
    return (
      sessionStorage.getItem(SESSION_KEYS.TOKEN) ||
      localStorage.getItem(SESSION_KEYS.TOKEN)
    );
  }

  getUser() {
    const user =
      sessionStorage.getItem(SESSION_KEYS.USER) ||
      localStorage.getItem(SESSION_KEYS.USER);

    if (!user) return null;

    try {
      return JSON.parse(user);
    } catch {
      return user;
    }
  }

  isSessionActive() {
    const token = this.getToken();
    if (!token) return false;

    const expiry =
      localStorage.getItem(SESSION_KEYS.SESSION_EXPIRY) ||
      sessionStorage.getItem(SESSION_KEYS.SESSION_EXPIRY);

    if (!expiry) return false;

    return Date.now() < parseInt(expiry, 10);
  }

  clearSession() {
    Object.values(SESSION_KEYS).forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    return true;
  }

  updateUser(user) {
    if (!user) return false;

    const data =
      typeof user === 'string' ? user : JSON.stringify(user);

    localStorage.setItem(SESSION_KEYS.USER, data);
    sessionStorage.setItem(SESSION_KEYS.USER, data);
    return true;
  }

  getSessionInfo() {
    return {
      token: this.getToken(),
      user: this.getUser(),
      active: this.isSessionActive(),
    };
  }
}

export const sessionManager = new SessionManager();
export default SessionManager;

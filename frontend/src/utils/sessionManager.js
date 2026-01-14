// src/utils/sessionManager.js - Session Management Utility

const SESSION_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  SESSION_EXPIRY: 'sessionExpiry',
};

class SessionManager {
  /**
   * ✅ INIT SESSION (USED BY App.jsx)
   * Checks whether an existing valid session exists
   */
  initSession() {
    try {
      const isActive = this.isSessionActive();

      if (!isActive) {
        console.log('🔄 New browser session detected - clearing auth');
        this.clearSession();
        return false;
      }

      console.log('✅ Existing session restored');
      return true;
    } catch (error) {
      console.error('❌ SessionManager: initSession failed', error);
      return false;
    }
  }

  /**
   * ✅ MARK SESSION ACTIVE (USED AFTER LOGIN / GETME)
   */
  markActive() {
    try {
      if (!this.getToken()) return false;

      const expiryTime = Date.now() + (7 * 24 * 60 * 60 * 1000);
      localStorage.setItem(SESSION_KEYS.SESSION_EXPIRY, expiryTime.toString());
      sessionStorage.setItem(SESSION_KEYS.SESSION_EXPIRY, expiryTime.toString());

      console.log('✅ Session marked as active');
      return true;
    } catch (error) {
      console.error('❌ SessionManager: markActive failed', error);
      return false;
    }
  }

  // ================= EXISTING CODE (UNCHANGED) =================

  setSession(token, user) {
    try {
      if (!token) return false;

      localStorage.setItem(SESSION_KEYS.TOKEN, token);
      sessionStorage.setItem(SESSION_KEYS.TOKEN, token);

      if (user) {
        const userData = typeof user === 'string' ? user : JSON.stringify(user);
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
    return sessionStorage.getItem(SESSION_KEYS.TOKEN)
      || localStorage.getItem(SESSION_KEYS.TOKEN);
  }

  getUser() {
    const user =
      sessionStorage.getItem(SESSION_KEYS.USER)
      || localStorage.getItem(SESSION_KEYS.USER);

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
      localStorage.getItem(SESSION_KEYS.SESSION_EXPIRY)
      || sessionStorage.getItem(SESSION_KEYS.SESSION_EXPIRY);

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

    const data = typeof user === 'string' ? user : JSON.stringify(user);
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

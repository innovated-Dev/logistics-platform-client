// ==================== AUTH.JS ====================
// Handles JWT storage, silent refresh, session persistence.
// Works underground — customer never sees this running.

const TOKEN_KEY   = 'os_token';
const USER_KEY    = 'os_user';
const REFRESH_KEY = 'os_refresh_at'; // timestamp of last refresh

let _refreshTimer = null;

// ──────────────────────────────────────────────────────────────
// ── SESSION CONFIGURATION ──
// ──────────────────────────────────────────────────────────────
// Centralized timeouts and settings for all auth/session/payment flows

export const SESSION_CONFIG = {
  timeout: 7 * 24 * 60 * 60 * 1000,            // Session expires after 7 days
  inactivityTimeout: 30 * 24 * 60 * 60 * 1000, // Auto-logout after 30 days inactive
  paymentTimeout: 30000,                       // Payment modal timeout: 30 seconds
  requireReAuthOnPayment: true,                // Require PIN before Paystack charge (future)
  paymentRetryLimit: 3,                        // Max payment retry attempts (future)
};

export const Auth = {

  // ── Store token + user after login/signup ──
  setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(REFRESH_KEY, Date.now().toString());
    // Sync to global state
    if (window.OS) {
      OS.token       = token;
      OS.currentUser = user;
    }
    this._scheduleRefresh(token);
  },

  // ── Get stored token ──
  getToken() {
    return localStorage.getItem(TOKEN_KEY) || null;
  },

  // ── Get stored user ──
  getUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  // ── Check if session exists ──
  isLoggedIn() {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch { return false; }
  },

  // ── Clear everything on logout ──
  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REFRESH_KEY);
    if (_refreshTimer) clearTimeout(_refreshTimer);
    if (window.OS) {
      OS.token       = null;
      OS.currentUser = null;
    }
  },

  // ── Restore session on page load ──
  restoreSession() {
    const token = this.getToken();
    const user  = this.getUser();
    if (!token || !user) return false;

    // Check token not expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        this.clearSession();
        return false;
      }
      // Restore to global state
      if (window.OS) {
        OS.token       = token;
        OS.currentUser = user;
      }
      this._scheduleRefresh(token);
      return true;
    } catch {
      this.clearSession();
      return false;
    }
  },

  // ── Schedule silent token refresh ──
  // Refreshes when 80% of token lifetime has elapsed
  _scheduleRefresh(token) {
    if (_refreshTimer) clearTimeout(_refreshTimer);
    try {
      const payload  = JSON.parse(atob(token.split('.')[1]));
      const issuedAt = payload.iat * 1000;
      const expiresAt= payload.exp * 1000;
      const lifetime = expiresAt - issuedAt;
      const refreshIn= lifetime * 0.8 - (Date.now() - issuedAt);

      if (refreshIn > 0) {
        _refreshTimer = setTimeout(() => this._doRefresh(), refreshIn);
      } else if (expiresAt > Date.now()) {
        // Token still valid but past 80% — refresh immediately
        this._doRefresh();
      }
    } catch { /* token malformed — session will expire naturally */ }
  },

  // ── Silent background refresh ──
  async _doRefresh() {
    const token = this.getToken();
    if (!token) return;
    try {
      const res = await fetch(`${window.OS?.BASE_URL || ''}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        // Refresh failed — force logout
        this.clearSession();
        if (window.OS?.logout) OS.logout();
        return;
      }
      const data = await res.json();
      const newToken = data.data?.token || data.token;
      if (newToken) {
        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem(REFRESH_KEY, Date.now().toString());
        if (window.OS) OS.token = newToken;
        this._scheduleRefresh(newToken);
      }
    } catch {
      // Network error — keep existing token, retry in 60s
      _refreshTimer = setTimeout(() => this._doRefresh(), 60 * 1000);
    }
  },

  // ── Decode token payload (no verification) ──
  decodeToken(token) {
    try {
      return JSON.parse(atob((token || this.getToken()).split('.')[1]));
    } catch { return null; }
  },
};


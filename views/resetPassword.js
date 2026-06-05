// ==================== RESET PASSWORD VIEW ====================
// Reads ?token= from URL, validates it, then lets user set new password.
// Three visual states: loading (validating token), form, success.
import { Auth } from '../api.js';

export const ResetPasswordView = {
  render(container, context = {}) {
    // Extract token from query string
    const params = new URLSearchParams(context.search || location.search);
    const token  = params.get('token');

    container.innerHTML = `
      <div class="auth-container">
        <div class="auth-left">
          <div class="auth-brand-logo">Off<span>Scape</span></div>
          <h1>Set a new <em>password.</em></h1>
          <p>Choose a strong password you haven't used before. Your new password will apply immediately after you save it.</p>
          <ul class="auth-feature-list">
            <li><div class="dot"></div> At least 8 characters long</li>
            <li><div class="dot"></div> Mix uppercase, numbers, and symbols</li>
            <li><div class="dot"></div> Do not reuse old passwords</li>
            <li><div class="dot"></div> This link expires 15 minutes after it was sent</li>
          </ul>
        </div>

        <div class="auth-right">

          <!-- State: loading / verifying token -->
          <div id="rpLoading" style="text-align:center;padding:60px 0">
            <div class="auth-spinner" style="display:block;margin:0 auto 16px;width:32px;height:32px;border-width:3px"></div>
            <div style="font-size:14px;color:var(--text2)">Validating your reset link…</div>
          </div>

          <!-- State: invalid/expired token -->
          <div id="rpInvalid" style="display:none;text-align:center;padding:40px 0">
            <div style="font-size:56px;margin-bottom:20px">⛔</div>
            <h2 style="font-family:'Switzer',sans-serif;font-size:22px;font-weight:800;margin-bottom:10px;color:var(--red)">
              Link invalid or expired
            </h2>
            <p style="color:var(--text2);font-size:14px;line-height:1.7;margin-bottom:24px">
              This password reset link has expired or already been used. Reset links are valid for 15 minutes only.
            </p>
            <a href="#" data-page="forgot-password" class="auth-submit"
               style="display:inline-block;text-decoration:none;width:auto;padding:12px 32px">
              Request a new link →
            </a>
          </div>

          <!-- State: reset form -->
          <div id="rpForm" style="display:none">
            <div class="auth-form-header">
              <h2>Set new password 🔒</h2>
              <p>This link is single-use and expires in 15 minutes.</p>
            </div>
            <div class="auth-error" id="rpError"></div>
            <form onsubmit="handleResetSubmit(event)" novalidate>
              <div class="form-group">
                <label>New Password</label>
                <div class="password-wrap">
                  <input class="form-input" type="password" id="rpNewPw"
                    placeholder="At least 8 characters" autocomplete="new-password"
                    oninput="checkPwStrength(this.value)">
                  <button type="button" class="toggle-pw"
                    onclick="togglePw('rpNewPw',this)">👁️</button>
                </div>
                <div class="pw-strength-bar"><div class="pw-strength-fill" id="pwStrengthFill"></div></div>
                <div class="pw-strength-label" id="pwStrengthLabel"></div>
              </div>
              <div class="form-group">
                <label>Confirm New Password</label>
                <div class="password-wrap">
                  <input class="form-input" type="password" id="rpConfirmPw"
                    placeholder="Repeat password" autocomplete="new-password">
                  <button type="button" class="toggle-pw"
                    onclick="togglePw('rpConfirmPw',this)">👁️</button>
                </div>
              </div>
              <button type="submit" class="auth-submit" id="rpBtn">
                <div class="auth-spinner" id="rpSpinner"></div>
                <span id="rpBtnText">Save New Password →</span>
              </button>
            </form>
          </div>

          <!-- State: success -->
          <div id="rpSuccess" style="display:none;text-align:center;padding:40px 0">
            <div style="font-size:56px;margin-bottom:20px">✅</div>
            <h2 style="font-family:'Switzer',sans-serif;font-size:22px;font-weight:800;margin-bottom:10px">
              Password updated!
            </h2>
            <p style="color:var(--text2);font-size:14px;line-height:1.7;margin-bottom:24px">
              Your OffScape password has been changed. You can now sign in with your new password.
            </p>
            <a href="#" data-page="signin" class="auth-submit"
               style="display:inline-block;text-decoration:none;width:auto;padding:12px 32px">
              Sign In →
            </a>
          </div>

        </div>
      </div>`;

    // ── Validate token on mount ──
    async function validateToken() {
      if (!token) { show('rpInvalid'); return; }
      // The backend verifies the token. We just show the form if token param exists
      // and let the submit reveal if it's truly invalid. This avoids an extra round-trip.
      // Alternatively call a /auth/validate-reset-token endpoint here.
      show('rpForm');
    }

    function show(id) {
      ['rpLoading','rpInvalid','rpForm','rpSuccess'].forEach(i => {
        const el = document.getElementById(i);
        if (el) el.style.display = i === id ? 'block' : 'none';
      });
    }

    // ── Submit handler ──
    window.handleResetSubmit = async function(e) {
      e.preventDefault();
      const newPw    = document.getElementById('rpNewPw')?.value;
      const confirm  = document.getElementById('rpConfirmPw')?.value;
      const errEl    = document.getElementById('rpError');
      const btn      = document.getElementById('rpBtn');
      const spin     = document.getElementById('rpSpinner');
      const btnTxt   = document.getElementById('rpBtnText');

      errEl.textContent = ''; errEl.classList.remove('show');
      if (!newPw || newPw.length < 8) {
        errEl.textContent = 'Password must be at least 8 characters.';
        errEl.classList.add('show'); return;
      }
      if (newPw !== confirm) {
        errEl.textContent = 'Passwords do not match.';
        errEl.classList.add('show'); return;
      }

      btn.disabled = true; spin.style.display = 'block'; btnTxt.textContent = 'Saving...';

      try {
        await Auth.resetPassword(token, newPw);
        show('rpSuccess');
      } catch(err) {
        // If token is expired/invalid, show the invalid state
        if (err.message?.toLowerCase().includes('expired') || err.message?.toLowerCase().includes('invalid')) {
          show('rpInvalid');
        } else {
          errEl.textContent = err.message || 'Could not reset password. Please try again.';
          errEl.classList.add('show');
          btn.disabled = false; spin.style.display = 'none'; btnTxt.textContent = 'Save New Password →';
        }
      }
    };

    // ── Shared password strength (also used by signup) ──
    window.checkPwStrength = function(pw) {
      const fill  = document.getElementById('pwStrengthFill');
      const label = document.getElementById('pwStrengthLabel');
      if (!fill) return;
      let score = 0;
      if (pw.length >= 8) score++;
      if (/[A-Z]/.test(pw)) score++;
      if (/[0-9]/.test(pw)) score++;
      if (/[^A-Za-z0-9]/.test(pw)) score++;
      const levels = [
        {w:'25%',bg:'#ef4444',text:'Weak'},
        {w:'50%',bg:'#f59e0b',text:'Fair'},
        {w:'75%',bg:'#3b82f6',text:'Good'},
        {w:'100%',bg:'#10b981',text:'Strong ✓'},
      ];
      const l = levels[Math.max(0,score-1)];
      fill.style.width = l.w; fill.style.background = l.bg;
      if (label) { label.textContent = l.text; label.style.color = l.bg; }
    };

    window.togglePw = function(id, btn) {
      const inp = document.getElementById(id);
      if (!inp) return;
      inp.type = inp.type === 'password' ? 'text' : 'password';
      btn.textContent = inp.type === 'password' ? '👁️' : '🙈';
    };

    validateToken();
  }
};

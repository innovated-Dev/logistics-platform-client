// ==================== FORGOT PASSWORD VIEW ====================
// Two-stage: (1) enter email → (2) success message with instructions.
// The backend sends a reset link to the email; this view handles the UI.

import { Auth } from '../api.js';

export const ForgotPasswordView = {
  render(container) {
    container.innerHTML = `
      <div class="auth-container">
        <div class="auth-left">
          <div class="auth-brand-logo">Off<span>Scape</span></div>
          <h1>Reset your <em>password.</em></h1>
          <p>Enter the email address linked to your OffScape account. We'll send you a secure link to set a new password.</p>
          <ul class="auth-feature-list">
            <li><div class="dot"></div> Link expires in 15 minutes for security</li>
            <li><div class="dot"></div> Check your spam folder if not received</li>
            <li><div class="dot"></div> Contact support if you no longer have email access</li>
          </ul>
        </div>

        <div class="auth-right">
          <!-- Stage 1: Email input -->
          <div id="fpStage1">
            <div class="auth-form-header">
              <h2>Forgot password? 🔑</h2>
              <p>Remember it? <a href="#" data-page="signin">Sign in instead</a></p>
            </div>
            <div class="auth-error" id="fpError"></div>
            <form id="fpForm" onsubmit="handleForgotSubmit(event)">
              <div class="form-group">
                <label>Email Address</label>
                <input class="form-input" type="email" id="fpEmail" 
                  placeholder="you@example.com" autocomplete="email" required>
              </div>
              <button type="submit" class="auth-submit" id="fpBtn">
                <div class="auth-spinner" id="fpSpinner"></div>
                <span id="fpBtnText">Send Reset Link →</span>
              </button>
            </form>
            <div class="auth-switch-link" style="margin-top:20px">
              <a href="#" data-page="signin">← Back to Sign In</a>
            </div>
          </div>

          <!-- Stage 2: Success screen -->
          <div id="fpStage2" style="display:none;text-align:center;padding:20px 0">
            <div style="font-size:56px;margin-bottom:20px">📬</div>
            <h2 style="font-family:'Switzer',sans-serif;font-size:22px;font-weight:800;margin-bottom:10px">
              Check your inbox
            </h2>
            <p style="color:var(--text2);font-size:14px;line-height:1.7;margin-bottom:24px">
              We sent a password reset link to <strong id="fpEmailDisplay"></strong>.
              The link expires in <strong>15 minutes</strong>.
            </p>
            <div style="background:rgba(245,158,11,.06);border:1px solid rgba(245,158,11,.2);border-radius:10px;padding:14px;font-size:13px;color:#92400e;margin-bottom:24px;text-align:left">
              💡 <strong>Didn't get it?</strong> Check your spam/junk folder. 
              If it's not there after 2 minutes, click below to resend.
            </div>
            <button class="btn btn-outline btn-full" id="fpResendBtn" onclick="handleResend()">
              Resend Email
            </button>
            <div style="margin-top:16px">
              <a href="#" data-page="signin" style="font-size:13px;color:var(--red);font-weight:700">
                ← Back to Sign In
              </a>
            </div>
          </div>
        </div>
      </div>`;

    // ── Form submit ──
    window.handleForgotSubmit = async function(e) {
      e.preventDefault();
      const email  = document.getElementById('fpEmail')?.value.trim();
      const errEl  = document.getElementById('fpError');
      const btn    = document.getElementById('fpBtn');
      const spin   = document.getElementById('fpSpinner');
      const btnTxt = document.getElementById('fpBtnText');

      errEl.classList.remove('show');
      if (!email) { errEl.textContent = 'Please enter your email address.'; errEl.classList.add('show'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errEl.textContent = 'Please enter a valid email address.'; errEl.classList.add('show'); return;
      }

      btn.disabled = true; spin.style.display = 'block'; btnTxt.textContent = 'Sending...';
      try {
        await Auth.forgotPassword(email);
        // Show success regardless of whether email exists (security: don't reveal if email is registered)
        document.getElementById('fpEmailDisplay').textContent = email;
        document.getElementById('fpStage1').style.display = 'none';
        document.getElementById('fpStage2').style.display = 'block';
      } catch(err) {
        errEl.textContent = err.message || 'Something went wrong. Please try again.';
        errEl.classList.add('show');
        btn.disabled = false; spin.style.display = 'none'; btnTxt.textContent = 'Send Reset Link →';
      }
    };

    // ── Resend with cooldown ──
    let resendCooldown = false;
    window.handleResend = async function() {
      if (resendCooldown) return;
      const email = document.getElementById('fpEmail')?.value.trim()
                 || document.getElementById('fpEmailDisplay')?.textContent;
      if (!email) return;
      const btn = document.getElementById('fpResendBtn');
      resendCooldown = true;
      btn.disabled = true; btn.textContent = 'Sending...';
      try {
        await Auth.forgotPassword(email);
        showToast('Reset link resent! Check your inbox.', 'success');
        btn.textContent = 'Resent ✓';
        // 60-second cooldown before allowing another resend
        setTimeout(() => {
          resendCooldown = false; btn.disabled = false; btn.textContent = 'Resend Email';
        }, 60000);
      } catch(err) {
        showToast(err.message, 'error');
        resendCooldown = false; btn.disabled = false; btn.textContent = 'Resend Email';
      }
    };
  }
};

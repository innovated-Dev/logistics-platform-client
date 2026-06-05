// ==================== SIGN IN VIEW — Fixed ====================
// Changes:
// 1. Email field (was already correct UI — backend controllers now also use email)
// 2. Role-specific login calls: AuthAPI.loginCustomer, loginMerchant, loginRider
// 3. Admin/support roles hidden from public role selector (separate login)

import { AuthAPI } from '../js/api.js';
import { Auth }    from '../js/auth.js';

export const SignInView = {
  render(container) {
    let selectedRole = 'customer';

    container.innerHTML = `
      <div class="auth-container">
        <div class="auth-left">
          <div class="auth-brand-logo">Off<span>Scape</span></div>
          <h1>Delivery, <em>done right.</em></h1>
          <p>Book in minutes, track in real time. Built for Ibadan and beyond.</p>
          <ul class="auth-feature-list">
            <li><div class="dot"></div> Real-time GPS tracking on every order</li>
            <li><div class="dot"></div> Verified, background-checked riders</li>
            <li><div class="dot"></div> Secure Paystack payments or wallet</li>
            <li><div class="dot"></div> Airtime &amp; data → instant wallet cash</li>
          </ul>
        </div>

        <div class="auth-right">
          <div class="auth-form-header">
            <h2>Welcome back</h2>
            <p>Don't have an account? <a href="#" data-page="signup">Sign up free</a></p>
          </div>

          <!-- ROLE SELECTOR — only 3 public roles -->
          <div style="margin-bottom:20px">
            <div class="field-label">Sign in as</div>
            <div class="role-selector" id="roleSelector" style="grid-template-columns:repeat(3,1fr)">
              ${[
                ['customer', '<i class="fa-regular fa-user"></i>',       'Customer', 'Track orders'],
                ['merchant', '<i class="fa-solid fa-store"></i>',      'Merchant', 'Ship goods'],
                ['rider',    '<i class="fa-solid fa-motorcycle"></i>', 'Rider',    'Accept jobs'],
              ].map(([r, icon, name, desc], i) => `
              <div class="role-card${i === 0 ? ' active' : ''}" onclick="siSelectRole(this,'${r}')">
                <div class="role-card-icon">${icon}</div>
                <div class="role-card-name">${name}</div>
                <div class="role-card-desc">${desc}</div>
              </div>`).join('')}
            </div>
          </div>

          <div class="auth-error" id="siError"></div>

          <form id="signinForm" onsubmit="handleSignIn(event)" novalidate>
            <div class="form-group">
              <label>Email Address</label>
              <input class="form-input" type="email" id="siEmail"
                placeholder="you@example.com"
                autocomplete="email"
                oninput="siValidateEmail(this)"
                onblur="siValidateEmail(this)">
              <div class="field-error" id="siEmailError" style="display:none;color:var(--danger);font-size:12px;margin-top:4px"></div>
            </div>

            <div class="form-group">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                <label style="margin-bottom:0">Password</label>
                <a href="#" data-page="forgot-password"
                   style="font-size:12px;color:var(--red);font-weight:700;text-decoration:none">
                  Forgot password?
                </a>
              </div>
              <div class="password-wrap">
                <input class="form-input" type="password" id="siPassword"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  oninput="siValidatePassword(this)">
                <button type="button" class="toggle-pw"
                  onclick="togglePw('siPassword',this)"><i class="fa-regular fa-eye"></i></button>
              </div>
              <div class="field-error" id="siPasswordError" style="display:none;color:var(--danger);font-size:12px;margin-top:4px"></div>
            </div>

            <div style="display:flex;align-items:center;gap:8px;margin-bottom:18px">
              <input type="checkbox" id="rememberMe" style="accent-color:var(--red);width:16px;height:16px;cursor:pointer">
              <label for="rememberMe" style="font-size:13px;color:var(--text2);cursor:pointer;text-transform:none;letter-spacing:0">
                Keep me signed in
              </label>
            </div>

            <button type="submit" class="auth-submit" id="siBtn">
              <div class="auth-spinner" id="siSpinner"></div>
              <span id="siBtnText">Sign In →</span>
            </button>
          </form>

          <div class="auth-divider">or</div>
          <a href="https://wa.me/2349110339553" class="btn-whatsapp" target="_blank" rel="noopener">
            <i class="fa-brands fa-whatsapp"></i>Get help on WhatsApp
          </a>
          <div class="auth-switch-link">
            New to OffScape? <a href="#" data-page="signup">Create an account</a>
          </div>
        </div>
      </div>`;

    // ── Role picker ──
    window.siSelectRole = function(el, role) {
      selectedRole = role;
      document.querySelectorAll('#roleSelector .role-card').forEach(c => c.classList.remove('active'));
      el.classList.add('active');
    };

    // ── Inline field validation (debounced) ──
    let emailTimer, passTimer;

    window.siValidateEmail = function(input) {
      clearTimeout(emailTimer);
      emailTimer = setTimeout(() => {
        const errEl = document.getElementById('siEmailError');
        const val   = input.value.trim();
        if (!val) {
          showFieldError(input, errEl, 'Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          showFieldError(input, errEl, 'Enter a valid email address');
        } else {
          clearFieldError(input, errEl);
        }
      }, 400);
    };

    window.siValidatePassword = function(input) {
      clearTimeout(passTimer);
      passTimer = setTimeout(() => {
        const errEl = document.getElementById('siPasswordError');
        if (!input.value) {
          showFieldError(input, errEl, 'Password is required');
        } else if (input.value.length < 8) {
          showFieldError(input, errEl, 'Password must be at least 8 characters');
        } else {
          clearFieldError(input, errEl);
        }
      }, 400);
    };

    function showFieldError(input, errEl, msg) {
      input.style.borderColor = 'var(--danger)';
      errEl.textContent = msg;
      errEl.style.display = 'block';
    }

    function clearFieldError(input, errEl) {
      input.style.borderColor = '';
      errEl.style.display = 'none';
    }

    // ── Password visibility toggle ──
    window.togglePw = function(id, btn) {
      const inp = document.getElementById(id);
      if (!inp) return;
      inp.type = inp.type === 'password' ? 'text' : 'password';
      btn.innerHTML = inp.type === 'password'
                          ? '<i class="fa-regular fa-eye"></i>'
                          : '<i class="fa-regular fa-eye-slash"></i>';
    };

    // ── Main submit — uses role-specific login endpoint ──
    window.handleSignIn = async function(e) {
      e.preventDefault();
      const email  = document.getElementById('siEmail')?.value.trim();
      const pass   = document.getElementById('siPassword')?.value;
      const errEl  = document.getElementById('siError');
      const btn    = document.getElementById('siBtn');
      const spin   = document.getElementById('siSpinner');
      const btnTxt = document.getElementById('siBtnText');

      errEl.textContent = '';
      errEl.classList.remove('show');

      // Client-side validation before hitting the server
      if (!email || !pass) {
        errEl.textContent = 'Please enter both your email and password.';
        errEl.classList.add('show');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errEl.textContent = 'Please enter a valid email address.';
        errEl.classList.add('show');
        return;
      }
      if (pass.length < 8) {
        errEl.textContent = 'Password must be at least 8 characters.';
        errEl.classList.add('show');
        return;
      }

      btn.disabled = true;
      spin.style.display = 'block';
      btnTxt.textContent = 'Signing in...';

     try {
          const loginFn = {
            customer: AuthAPI.loginCustomer,
            merchant: AuthAPI.loginMerchant,
            pickman: AuthAPI.loginPickman,
          }[selectedRole];

          const response = await loginFn(email, pass);
          const jwt = response.accessToken || response.token;
          
          Auth.setSession(jwt, response.user);
          showToast(`Welcome back, ${response.user.firstName || response.user.name}! 🎉`, 'success');

          // only pickman
          if (response.user.role === 'pickman' && response.user.kycStatus === 'pending_kyc') {
            setTimeout(() => Router.go('/kyc-pending'), 400);
          } else {
            setTimeout(() => OS.enterDashboard(response.user.role), 400);  // ← Keep this
          }
          

        } catch (err) {
          if (err.emailUnverified) {
            sessionStorage.setItem('pendingVerifyEmail', err.email || email);
            showToast('Please verify your email to continue.', 'warning');
            setTimeout(() => Router.go('/verify-pending'), 800);
            btn.disabled = false;
            spin.style.display = 'none';
            btnTxt.textContent = 'Sign In →';
            return;
          }

          errEl.textContent = err.message || 'Incorrect email or password. Please try again.';
          errEl.classList.add('show');
          btn.disabled = false;
          spin.style.display = 'none';
          btnTxt.textContent = 'Sign In →';
        }
    };

    

    // ── Resend Verification ──
    window.resendVerificationEmail = async function() {
      const email = sessionStorage.getItem('pendingVerifyEmail');
      if (!email) {
        showToast('Could not find your email. Please sign in again.', 'error');
        return;
      }
      try {
        await AuthAPI.resendVerification(email);
        showToast('Verification email sent! Check your inbox.', 'success');
      } catch (err) {
        if (err.message?.includes('Please wait')) {
          showToast('Check your inbox — we already sent a verification email recently.', 'info');
        } else {
          showToast(err.message || 'Could not resend. Try again.', 'error');
        }
      }
    };
  
  }
};
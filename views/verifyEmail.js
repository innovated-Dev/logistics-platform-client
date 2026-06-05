// ==================== EMAIL VERIFICATION VIEW ====================
// Reads ?token= from URL, auto-calls the verify endpoint, shows result.
// No user input needed — it's a landing page for the email link.
import { AuthAPI } from '../js/api.js';
import { Auth } from '../js/auth.js';

export const VerifyEmailView = {
  render(container, context = {}) {
    const params = new URLSearchParams(context.search || location.search);
    const token  = params.get('token');

    container.innerHTML = `
      <div class="auth-container" style="min-height:100vh">
        <div class="auth-left">
          <div class="auth-brand-logo">Off<span>Scape</span></div>
          <h1>Verifying your <em>email.</em></h1>
          <p>Just a moment while we confirm your email address and activate your account.</p>
        </div>
        <div class="auth-right" style="display:flex;align-items:center;justify-content:center">

          <!-- Loading -->
          <div id="veLoading" style="text-align:center">
            <div class="auth-spinner" style="display:block;margin:0 auto 20px;width:40px;height:40px;border-width:4px"></div>
            <div style="font-size:15px;font-weight:600;margin-bottom:6px">Verifying your email…</div>
            <div style="font-size:13px;color:var(--text2)">This takes just a second.</div>
          </div>

          <!-- Success -->
          <div id="veSuccess" style="display:none;text-align:center;max-width:340px">
            <div style="width:72px;height:72px;background:rgba(16,185,129,.1);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 20px">✅</div>
            <h2 style="font-family:'Switzer',sans-serif;font-size:24px;font-weight:800;margin-bottom:10px">
              Email verified!
            </h2>
            <p style="color:var(--text2);font-size:14px;line-height:1.7;margin-bottom:28px">
              Your email address has been confirmed. Your OffScape account is now fully active.
            </p>
            <a href="#" data-page="signin" class="auth-submit"
               style="display:inline-block;text-decoration:none;width:auto;padding:13px 36px">
              Sign In to Your Account →
            </a>
          </div>

          <!-- Error -->
          <div id="veError" style="display:none;text-align:center;max-width:340px">
            <div style="width:72px;height:72px;background:rgba(239,68,68,.1);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 20px">⛔</div>
            <h2 style="font-family:'Switzer',sans-serif;font-size:24px;font-weight:800;margin-bottom:10px;color:var(--red)">
              Verification failed
            </h2>
            <p id="veErrorMsg" style="color:var(--text2);font-size:14px;line-height:1.7;margin-bottom:24px">
              This verification link has expired or is invalid.
            </p>
            <button class="auth-submit" style="margin-bottom:12px" onclick="resendVerification()">
              <div class="auth-spinner" id="veResendSpinner"></div>
              <span id="veResendText">Resend Verification Email</span>
            </button>
            <div><a href="#" data-page="signin" style="font-size:13px;color:var(--text2)">← Back to Sign In</a></div>
          </div>

        </div>
      </div>`;

    function show(id) {
      ['veLoading','veSuccess','veError'].forEach(i => {
        const el = document.getElementById(i);
        if (el) el.style.display = i === id ? (id === 'veLoading' ? 'block' : 'block') : 'none';
      });
    }

    // ── Auto-verify on mount direct login ──
    async function verify() {
      if (!token) {
        document.getElementById('veErrorMsg').textContent =
          'No verification token found. Please click the link from your email.';
        show('veError'); return;
      }
      try {
        // ✅ Capture JWT and user for auto-login
        const { token: jwt, user } = await AuthAPI.verifyEmail(token);
        
        //Save session - user is now logged in
        Auth.setSession(jwt, user);

        // const signInBtn = document.querySelector('.auth-submit');
        // signInBtn.addEventListener('submit', ()=>{
        //   setTimeout(()=>{
        //     signInBtn.textContent = "Email verified! Taking you to your dashboard..."
        //   }, 500);
        // });

        console.log('🔍 OS.token after setSession:', OS.token);

        show('veSuccess');

        //Auto redirect after 2 seconds 
        setTimeout(()=> {

          if(user.role === 'pickman' && user.kycStatus === 'pending_kyc') {
            Router.go('/kyc-pending');
          } else {
            console.log('🔍 Calling OS.enterDashboard with role:', user.role);
            OS.enterDashboard(user.role);
          }
        }, 2000);

      } catch(err) {
        console.error('🔍 Verify error:', err);
        document.getElementById('veErrorMsg').textContent =
          err.message || 'This verification link is invalid or has expired.';
        show('veError');
      }
    }

    // ── Resend if they're logged in ──
    window.resendVerification = async function() {
      const btn  = document.getElementById('veResendSpinner');
      const txt  = document.getElementById('veResendText');
      if (btn) btn.style.display = 'block';
      if (txt) txt.textContent = 'Sending...';

      // Try to get email from sessionStorage (set at signup)
      // or from an input field on the error screen
      const email = sessionStorage.getItem('pendingVerifyEmail') || 
                    document.getElementById('veEmailInput')?.value;
      if (!email) {
        showToast('Please enter your email address.', 'error');
        return;
      }
      try {
        await AuthAPI.resendVerification(email); // pass email in body
        showToast('Verification email resent! Check your inbox.', 'success');
      } catch(err) {
        showToast(err.message || 'Something went wrong.', 'error');
      }
    };

    // Small delay so loading state renders visibly before the API call
    setTimeout(verify, 400);
  }
};

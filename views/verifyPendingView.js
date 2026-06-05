import { AuthAPI } from '../js/api.js';

export const VerifyPendingView = {
  render(container) {
    // ← fixed key to match what signup and signin both set
    const email = sessionStorage.getItem('pendingVerifyEmail') || 'your email address';

    container.innerHTML = `
      <div class="verify-pending-page">
        <div class="verify-pending-card">

          <div class="vp-brand">Off<span>Scape</span></div>

          <div class="vp-icon-wrap">
            <i class="fa-regular fa-envelope-open"></i>
          </div>

          <h2 class="vp-title">Check your inbox</h2>

          <p class="vp-sub">
            We sent a verification link to <br>
            <strong>${email}</strong>
          </p>

          <p class="vp-hint">
            Click the link in the email to activate your account.
            The link expires in <strong>24 hours.</strong>
          </p>

          <div class="vp-divider"></div>

          <div class="vp-steps">
            <div class="vp-step">
              <div class="vp-step-icon"><i class="fa-solid fa-inbox"></i></div>
              <span>Open your email app</span>
            </div>
            <div class="vp-step-arrow"><i class="fa-solid fa-arrow-right"></i></div>
            <div class="vp-step">
              <div class="vp-step-icon"><i class="fa-solid fa-envelope-circle-check"></i></div>
              <span>Find the OffScape email</span>
            </div>
            <div class="vp-step-arrow"><i class="fa-solid fa-arrow-right"></i></div>
            <div class="vp-step">
              <div class="vp-step-icon"><i class="fa-regular fa-circle-check"></i></div>
              <span>Click verify link</span>
            </div>
          </div>

          <div class="vp-divider"></div>

          <p class="vp-resend-label">Didn't receive it?</p>
          <button class="vp-resend-btn" id="vpResendBtn" onclick="vpResend()">
            <i class="fa-solid fa-rotate-right"></i>
            <span id="vpResendTxt">Resend verification email</span>
          </button>

          <!-- Fixed: data-page navigates via Router correctly -->
          <a href="#" data-page="signin" class="vp-back">
            <i class="fa-solid fa-arrow-left"></i>
            Back to sign in
          </a>

        </div>
      </div>`;

    window.vpResend = async function() {
      const btn = document.getElementById('vpResendBtn');
      const txt = document.getElementById('vpResendTxt');

      // Read email fresh in case sessionStorage was updated
      const userEmail = sessionStorage.getItem('pendingVerifyEmail');

      if (!userEmail || userEmail === 'your email address') {
        showToast('Could not find your email. Please sign in again.', 'error');
        Router.go('/signin');
        return;
      }

      btn.disabled = true;
      txt.textContent = 'Sending…';

      try {
        // ← now passes email in the body
        await AuthAPI.resendVerification(userEmail);
        txt.textContent = 'Email sent! Check your inbox.';
        showToast('Verification email resent!', 'success');

        setTimeout(() => {
          txt.textContent = 'Resend verification email';
          btn.disabled = false; // ← fixed typo: was btn.disbaled
        }, 4000);

      } catch (err) {
          // 429 means cooldown — tell them exactly how long to wait
          if (err.message?.includes('Please wait')) {
            showToast(err.message, 'warning');
            txt.textContent = 'Please wait before resending';
          } else {
            txt.textContent = 'Could not resend. Try again.';
            showToast(err.message || 'Resend failed.', 'error');
          }
        btn.disabled = false;
      }
    };

    // If the email is verified on other dievices the same device naviaget the user from the verify pending view tothe next phase 

    const eventSource = new EventSource(`/api/auth/sse/verify-status?email=${email}`);
     eventSource.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);
        if(data.verified  === true){
          Router.go('/kyc-pending');
        }
    });

    
  }

};
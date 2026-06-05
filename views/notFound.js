// ==================== 404 NOT FOUND VIEW ====================
// Shown when a route doesn't match any known page.
// Mirrors the auth-container split layout used across the app.

export const NotFoundView = {
  render(container, context = {}) {
    container.innerHTML = `
      <div class="auth-container" style="min-height:100vh">

        <!-- Left branding panel -->
        <div class="auth-left">
          <div class="auth-brand-logo">Off<span>Scape</span></div>
          <h1>Looks like you've <em>gone off route.</em></h1>
          <p>The page you're looking for doesn't exist or may have been moved. Let's get you back on track.</p>
        </div>

        <!-- Right content panel -->
        <div class="auth-right" style="display:flex;align-items:center;justify-content:center">
          <div style="text-align:center;max-width:360px">

            <!-- 404 Illustration -->
            <div style="
              font-family:'Switzer',sans-serif;
              font-size:96px;
              font-weight:800;
              line-height:1;
              letter-spacing:-4px;
              color:var(--red, #ef4444);
              opacity:0.15;
              margin-bottom:8px;
              user-select:none
            ">404</div>

            <!-- Icon -->
            <div style="
              width:72px;height:72px;
              background:rgba(239,68,68,.1);
              border-radius:50%;
              display:flex;align-items:center;justify-content:center;
              font-size:32px;
              margin:0 auto 20px
            ">🗺️</div>

            <!-- Heading -->
            <h2 style="
              font-family:'Switzer',sans-serif;
              font-size:24px;
              font-weight:800;
              margin-bottom:10px
            ">Page Not Found</h2>

            <!-- Description -->
            <p style="
              color:var(--text2);
              font-size:14px;
              line-height:1.7;
              margin-bottom:28px
            ">
              We couldn't find what you were looking for. The link may be broken,
              or the page may have been removed.
            </p>

            <!-- Primary CTA -->
            <a
              href="#"
              data-page="home"
              class="auth-submit"
              style="display:inline-block;text-decoration:none;width:auto;padding:13px 36px;margin-bottom:14px"
            >
              ← Go to Homepage
            </a>

            <!-- Secondary links -->
            <div style="display:flex;justify-content:center;gap:20px;margin-top:4px">
              <a href="#" data-page="signin"
                 style="font-size:13px;color:var(--text2);text-decoration:none">
                Sign In
              </a>
              <span style="color:var(--text2);font-size:13px">·</span>
              <a href="#" data-page="signup"
                 style="font-size:13px;color:var(--text2);text-decoration:none">
                Create Account
              </a>
              <span style="color:var(--text2);font-size:13px">·</span>
              <a href="#" data-page="support"
                 style="font-size:13px;color:var(--text2);text-decoration:none">
                Support
              </a>
            </div>

          </div>
        </div>

      </div>`;
  }
};
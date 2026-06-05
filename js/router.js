import { SignInView }  from '../views/signin.js';
import { SignUpView }  from '../views/signup.js';


export const Router = {
  routes: {
          '/home': () => null,
          '/signin': () => SignInView,
          '/signup': () => SignUpView,
          '/verify-pending': () => import('../views/verifyPendingView.js').then(m => m.VerifyPendingView),
          '/kyc-pending': () => import('../views/kycPending.js').then(m => m.KycPendingView),
          '/verify-email': () => import('../views/verifyEmail.js').then(m => m.VerifyEmailView),
          '/customer': () => import('../views/dashCustomer.js').then(m => m.CustomerDashView),
          '/merchant': () => import('../views/dashMerchant.js').then(m => m.MerchantDashView),
          '/rider':    () => import('../views/dashPickman.js').then(m => m.RiderDashView),
          '/admin':    () => import('../views/dashAdmin.js').then(m => m.AdminDashView),
          '/support':  () => import('../views/dashSupport.js').then(m => m.SupportDashView),
          '/forgot-password': () => import('../views/forgotPassword.js').then(m => m.ForgotPasswordView),
          '/not-found': () => import('../views/notFound.js').then(m => m.NotFoundView),
  },
  

  go(path, push = true) {
    if (push) history.pushState({}, '', path);
    this._render(path);
  },

  // ── Handle browser back/forward buttons ──
  init() {
    window.addEventListener('popstate', () => {
      this._render(window.location.pathname);
    });
  },
  
  async _render(path) {
  
    // 1. IDENTIFY THE PATH
    const cleanPath = path.split('?')[0];
    console.log('Attempting to route to:', cleanPath);

    // If navigating back to home, hand off immediately
    if (cleanPath === '/' || cleanPath === '/home') {
      document.getElementById('app').style.display = '';
      document.getElementById('app-container').style.display = 'none';
      document.getElementById('siteHeader').style.display = '';
      document.getElementById('mainFooter').style.display = '';
      window.scrollTo(0, 0);
      return;
    }
    const routeLoader = this.routes[cleanPath] || this.routes['/not-found'];
    if (!routeLoader) {
      console.error(`No route found for path: ${cleanPath}`);
      return;
    }

    const authPaths    = ['/signin', '/signup', '/forgot-password', '/verify-pending', '/verify-email', '/kyc-pending'];
    const dashPaths    = ['/customer', '/merchant', '/rider', '/admin', '/support'];
    const isAuth       = authPaths.includes(cleanPath);
    const isDash       = dashPaths.includes(cleanPath);
    const isHome       = cleanPath === '/home';

     // Body class hygiene
    document.body.classList.toggle('auth-page', isAuth);
    document.body.classList.toggle('dash-page', isDash);

    // Header / footer visibility
    const hdr = document.getElementById('siteHeader');
    const ftr = document.getElementById('mainFooter');
    if (!hdr || !ftr) console.warn('Header or footer element not found.');
    if (hdr) hdr.style.display = (isAuth || isDash) ? 'none' : '';
    if (ftr) ftr.style.display = isDash ? 'none' : '';
    
    const appContainer = document.getElementById('app-container');

    // Toggle landing vs app-container
    const appEl = document.getElementById('app');
    if (appEl) appEl.style.display = 'none';
    if (appContainer) appContainer.style.display = '';

    // Home is static — already in the DOM
    if (isHome) {
        const appEl = document.getElementById('app');
        if (appEl) appEl.style.display = '';
            const ac = document.getElementById('app-container');
        if (ac) ac.style.display = 'none';
        if (hdr) hdr.style.display = '';
        if (ftr) ftr.style.display = '';
            window.scrollTo(0, 0);
        return;
      }
      

    // 2. DETERMINE IF THE PATH IS A RESTRICTED DASHBOARD ROUTE
    // 3. AUTH CHECK — redirect before any loading begins
    if (isDash && !OS.currentUser) {
      this.go('/signin');
      return;
    }
   
  // 4. SHOW LOADING UI
    if (appContainer) {
      appContainer.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:12px">
          <div style="width:32px;height:32px;border:3px solid #e74c3c;border-top-color:transparent;border-radius:50%;animation:spin .7s linear infinite"></div>
          <div style="font-size:13px;color:#64748b">Loading...</div>
        </div>
        <style>@keyframes spin{to{transform:rotate(360deg)}}</style>`;
    }

    window.scrollTo(0, 0);

    // 5. LOAD AND RENDER THE VIEW
    try {
      const view = await routeLoader();
      if (appContainer) {
        appContainer.innerHTML = '';
        if (view && typeof view.render === 'function') {
          view.render(appContainer);       // for object views like CustomerDashView
        } else if (view instanceof Node) {
          appContainer.appendChild(view);  // for views that return DOM nodes
        }
      }
    } catch (e) {
      console.error(`Error loading route ${cleanPath}:`, e);
    if (appContainer) {
        appContainer.innerHTML = `
          <div style="padding:60px;text-align:center">
            <div style="font-size:40px;margin-bottom:16px">⚠️</div>
            <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;margin-bottom:8px;color:#e74c3c">
              Failed to load page
            </div>
            <div style="font-size:13px;color:#64748b;margin-bottom:20px">${e.message}</div>
            <button onclick="location.reload()" style="padding:10px 24px;background:#e74c3c;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer">
              Reload
            </button>
          </div>`;
    }
  }
  }
};

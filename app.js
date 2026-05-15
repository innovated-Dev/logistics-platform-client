// ==================== OFFSCAPE SPA — app.js ====================
import { SignInView }  from './views/signin.js';
import { SignUpView }  from './views/signup.js';
import { VerifyPendingView } from './views/verifyPendingView.js';
import { VerifyEmailView }   from './views/verifyEmail.js';
import { KycPendingView } from './views/kycPending.js';
// LandingView removed — landing is now baked into index.html

const DashCache = {};

window.OS = {
  currentUser: null,
  logout() {
    this.currentUser = null;
    Router.go('/');
  },
  enterDashboard(role) {
    Router.go(`/dashboard/${role}`);
  }
};

window.showToast = function(msg, type = 'success') {
  const c = document.getElementById('toast-wrap');
  if (!c) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const icons = {
  success: '<i class="fa-solid fa-circle-check"></i>',
  error:   '<i class="fa-solid fa-circle-xmark"></i>',
  info:    '<i class="fa-solid fa-circle-info"></i>',
  warning: '<i class="fa-solid fa-triangle-exclamation"></i>',
};
t.innerHTML = `<span>${icons[type] || icons.info}</span><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => {
    t.style.transition = 'opacity .3s, transform .3s';
    t.style.opacity = '0';
    t.style.transform = 'translateX(20px)';
    setTimeout(() => t.remove(), 320);
  }, 3500);
};

const Router = {
  routes: {
    '/':                   'home',
    '/home':               'home',
    '/signin':             'signin',
    '/signup':             'signup',
    '/verify-pending':     'verify-pending',
    '/verify-email':       'verify:email',
    '/kyc-pending':        'kyc-pending',
    '/dashboard/customer': 'dash:customer',
    '/dashboard/merchant': 'dash:merchant',
    '/dashboard/rider':    'dash:rider',
    '/dashboard/admin':    'dash:admin',
    '/dashboard/support':  'dash:support',
  },

  go(path, push = true) {
    if (push) history.pushState({}, '', path);
    this._render(path);
  },

  _render(path) {
    const cleanPath = path.split('?')[0];
    const route = this.routes[cleanPath] || 'home';
    const isHome = route === 'home';
    const isAuth = route === 'signin' || route === 'signup' || route === 'verify-pending' || route === 'verify:email' || route === 'kyc-pending';
    const isDash = route.startsWith('dash:');

    // Toggle baked-in landing vs SPA container
    const appDiv       = document.getElementById('app');
    const appContainer = document.getElementById('app-container');
    if (appDiv)       appDiv.style.display       = isHome ? 'block' : 'none';
    if (appContainer) appContainer.style.display = isHome ? 'none'  : 'block';

    // Body classes
    document.body.classList.toggle('auth-page', isAuth);
    document.body.classList.toggle('dash-page', isDash);

    // Header + footer — use the IDs that exist in index.html
    const hdr = document.getElementById('siteHeader');   // was 'mainHeader'
    const ftr = document.getElementById('mainFooter');
    if (hdr) hdr.style.display = (isAuth || isDash) ? 'none' : '';
    if (ftr) ftr.style.display = isDash ? 'none' : '';

    if (isHome) {
      window.scrollTo(0, 0);
      return; // landing is already in the DOM, nothing to render
    }

    if (route === 'signin') return SignInView.render(appContainer);
    if (route === 'signup') return SignUpView.render(appContainer);
    if (route === 'verify-pending') return VerifyPendingView.render(appContainer);
    if (route === 'verify:email') return VerifyEmailView.render(appContainer, { search: location.search });
    if(route === 'kyc-pending') return KycPendingView.render(appContainer);

    if (isDash) {
      const role = route.split(':')[1];
      this._loadDash(role, appContainer);
    }

    window.scrollTo(0, 0);
  },

  async _loadDash(role, container) {
    if (!OS.currentUser) {
      this.go('/signin');
      return;
    }

    container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:12px">
        <div style="width:32px;height:32px;border:3px solid #e74c3c;border-top-color:transparent;border-radius:50%;animation:spin .7s linear infinite"></div>
        <div style="font-size:13px;color:#64748b">Loading dashboard...</div>
      </div>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>`;

    try {
      if (!DashCache[role]) {
        const loaders = {
          customer: () => import('./views/dashCustomer.js').then(m => m.CustomerDashView),
          merchant: () => import('./views/dashMerchant.js').then(m => m.MerchantDashView),
          rider:    () => import('./views/dashRider.js').then(m => m.RiderDashView),
          admin:    () => import('./views/dashAdmin.js').then(m => m.AdminDashView),
          support:  () => import('./views/dashSupport.js').then(m => m.SupportDashView),
        };
        DashCache[role] = await loaders[role]();
      }
      DashCache[role].render(container);
    } catch(e) {
      // console.error(`[OffScape] Failed to load ${role} dashboard:` e);
      container.innerHTML = `
        <div style="padding:60px;text-align:center">
          <div style="font-size:40px;margin-bottom:16px">⚠️</div>
          <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;margin-bottom:8px;color:#e74c3c">Dashboard failed to load</div>
          <div style="font-size:13px;color:#64748b;margin-bottom:20px">${e.message}</div>
          <button onclick="location.reload()" style="padding:10px 24px;background:#e74c3c;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer">Reload</button>
        </div>`;
    }
  }
};

// Global click handler for [data-nav] links
document.addEventListener('click', e => {
  const el = e.target.closest('[data-nav]');
  if (el) { e.preventDefault(); Router.go(el.dataset.nav); }
});

// Mobile drawer — use the IDs that exist in index.html
const ham     = document.getElementById('hamburger');        // was 'hamburgerBtn'
const drawer  = document.getElementById('drawer');           // was 'mobileDrawer'
const overlay = document.getElementById('drawerOverlay');
const closeBtn = document.getElementById('drawerClose');
const openDrawer  = () => { drawer?.classList.add('open'); overlay?.classList.add('open'); document.body.style.overflow='hidden'; };
const closeDrawer = () => { drawer?.classList.remove('open'); overlay?.classList.remove('open'); document.body.style.overflow=''; };
ham?.addEventListener('click', openDrawer);
closeBtn?.addEventListener('click', closeDrawer);
overlay?.addEventListener('click', closeDrawer);

// Browser back/forward
window.addEventListener('popstate', () => Router._render(location.pathname));

// Expose globally (index.html's nav() function calls window.Router.go)
window.Router = Router;

// Boot
Router._render(location.pathname || '/');
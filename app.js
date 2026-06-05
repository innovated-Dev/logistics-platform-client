// ==================== OFFSCAPE SPA — app.js ====================
import { Auth } from './js/auth.js';
import { Router } from './js/router.js';

const DashCache = {};

window.OS = {
  currentUser: null,
  logout() {
    this.currentUser = null;
    Router.go('/');
  },
  enterDashboard(role) {
    Router.go(`/${role}`);
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



// Global click handler for links
document.addEventListener('click', e => {
  const el = e.target.closest('[data-page]');
  if (el) {
    e.preventDefault();
    const page = el.dataset.page;
    // Landing pages handled by switchPage, auth/dash by Router
    const routerPages = ['signin','signup','verify-pending','kyc-pending','dashboard'];
    if(routerPages.some(r => page.startsWith(r))){
      Router.go('/' + page);
    } else {
      switchPage(page);
    }
  }
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



const isLoggedInPersistent = Auth.restoreSession();
//console.log('Session restored:', isLoggedInPersistent ? '✓ User authenticated' : '✗ No session');

window.Router = Router;
Router.init();                                    // ← FIRST
const startPath = window.location.pathname === '/' ? '/home' : window.location.pathname;
Router.go(startPath, false);                      // ← SECOND
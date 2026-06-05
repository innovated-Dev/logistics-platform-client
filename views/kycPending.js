// ==================== KYC PENDING VIEW — Dynamic & Config-Driven ====================
//
// ARCHITECTURE:
//  1. On mount → GET /api/kyc/requirements  (returns doc list for rider's vehicle type)
//  2. Renders doc cards dynamically — required vs optional separated
//  3. Submit gates on required-only count (optional docs are a bonus)
//  4. kycSubmitAll() → POST /api/kyc/submit
//  5. kycCheckStatus() → GET /api/kyc/status → redirects if approved
//
// DEPENDENCIES:
//  - Tabler Icons webfont (load in <head>):
//    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.19.0/dist/tabler-icons.min.css">
//  - Pickmen.uploadKycDoc(docKey, file)  → POST /api/kyc/upload
//  - Pickmen.submitKyc()                → POST /api/kyc/submit
//  - Pickmen.getKycStatus()             → GET  /api/kyc/status
//  - Pickmen.getKycRequirements()       → GET  /api/kyc/requirements
//  - OS.currentUser  — { firstName, initials, vehicleType }
//  - OS.logout(), OS.enterDashboard(role)
//  - AuthState.updateUser({ ... })
//  - showToast(msg, type, duration?)
//  - Router.go(path)

import { Pickmen } from '../js/api.js';

// ── Icon helper (Tabler webfont)
const icon = (name, extra = '') =>
  `<i class="ti ti-${name}" aria-hidden="true" ${extra}></i>`;

// ── Vehicle type display labels
const VEHICLE_LABELS = {
  motorcycle: 'Motorcycle (Okada)',
  bicycle:    'Bicycle',
  car:        'Car',
  van:        'Van / Mini-truck',
};

// ── Stepper config — always the same regardless of vehicle type
const STEPS = [
  { label: 'Account Created',    state: 'done'   },
  { label: 'Documents Uploaded', state: 'active' },
  { label: 'Admin Review',       state: 'idle'   },
  { label: 'Account Active',     state: 'idle'   },
];

// ── Build the progress stepper HTML
function buildStepper() {
  return STEPS.map((s, i) => {
    const circleBg  = s.state === 'done'   ? 'background:var(--success)'
                    : s.state === 'active' ? 'background:rgba(245,158,11,.12)'
                    :                        'background:transparent';
    const circleBdr = s.state === 'done'   ? 'border-color:var(--success)'
                    : s.state === 'active' ? 'border-color:var(--warning)'
                    :                        'border-color:var(--border)';
    const labelCol  = s.state === 'done'   ? 'color:var(--success)'
                    : s.state === 'active' ? 'color:var(--warning)'
                    :                        'color:var(--text3)';
    const iconColor = s.state === 'done'   ? '#fff'
                    : s.state === 'active' ? 'var(--warning)'
                    :                        'var(--text3)';
    const lineColor = s.state === 'done'   ? 'var(--success)' : 'var(--border)';
    const inner     = s.state === 'done'
      ? icon('check')
      : `<span style="font-size:12px;font-weight:700">${i + 1}</span>`;

    return `
      <div style="flex:1;text-align:center;position:relative">
        <div style="width:32px;height:32px;border-radius:50%;border:2px solid;
             ${circleBg};${circleBdr};
             display:flex;align-items:center;justify-content:center;margin:0 auto 8px;
             color:${iconColor}">
          ${inner}
        </div>
        <div style="font-size:11px;font-weight:700;${labelCol}">${s.label}</div>
        ${i < STEPS.length - 1
          ? `<div style="position:absolute;top:15px;left:calc(50% + 16px);right:calc(-50% + 16px);
                 height:1.5px;background:${lineColor}"></div>`
          : ''}
      </div>`;
  }).join('');
}

// ── Build a single document upload card
// doc: { key, label, hint, icon, accept, maxSizeMB, required }
function buildDocCard(doc) {
  const badge = doc.required
    ? `<span style="font-size:10px;font-weight:700;background:rgba(239,68,68,.1);
         color:#dc2626;padding:2px 7px;border-radius:4px;margin-left:6px;
         vertical-align:middle">Required</span>`
    : `<span style="font-size:10px;font-weight:700;background:rgba(100,116,139,.1);
         color:var(--text3);padding:2px 7px;border-radius:4px;margin-left:6px;
         vertical-align:middle">Optional</span>`;

  return `
    <div class="dash-card kyc-doc-card" id="kycCard-${doc.key}"
         style="transition:border-color .2s,background .2s">

      <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">

        <!-- Icon box -->
        <div id="kycIconBox-${doc.key}"
             style="width:44px;height:44px;border-radius:10px;flex-shrink:0;
                    background:var(--surface2);border:1.5px solid var(--border);
                    display:flex;align-items:center;justify-content:center;
                    color:var(--text2);font-size:22px;transition:all .2s">
          ${icon(doc.icon || 'file')}
        </div>

        <!-- Label + hint -->
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;font-weight:700;margin-bottom:2px">
            ${doc.label}${badge}
          </div>
          <div style="font-size:12px;color:var(--text2)">${doc.hint}</div>
          <div style="font-size:11px;color:var(--text3);margin-top:3px">
            ${icon('paperclip', 'style="font-size:11px;vertical-align:-1px;margin-right:3px"')}
            ${doc.accept.includes('pdf') ? 'JPG, PNG, PDF' : 'JPG, PNG'}
            &middot; max ${doc.maxSizeMB} MB
          </div>
        </div>

        <!-- Status + upload trigger -->
        <div style="flex-shrink:0;text-align:right">
          <div id="kycStatus-${doc.key}">
            <span class="badge badge-gray" style="display:inline-flex;align-items:center;gap:5px">
              ${icon('minus', 'style="font-size:12px"')} Not uploaded
            </span>
          </div>
          <input type="file" id="kycFile-${doc.key}"
            accept="${doc.accept}"
            style="display:none"
            onchange="kycUploadFile('${doc.key}', this, ${doc.maxSizeMB}, ${doc.required})">
          <button class="btn btn-ghost btn-sm"
            id="kycBtn-${doc.key}"
            style="margin-top:8px;display:inline-flex;align-items:center;gap:6px"
            onclick="document.getElementById('kycFile-${doc.key}').click()">
            ${icon('upload')} Choose file
          </button>
        </div>
      </div>

      <!-- Progress bar (hidden until upload starts) -->
      <div id="kycProgress-${doc.key}" style="display:none;margin-top:12px">
        <div style="background:var(--border);border-radius:4px;height:5px;overflow:hidden">
          <div id="kycFill-${doc.key}"
               style="width:0%;height:5px;background:var(--success);
                      border-radius:4px;transition:width .3s"></div>
        </div>
        <div id="kycProgLabel-${doc.key}"
             style="font-size:11px;color:var(--text2);margin-top:5px;
                    display:flex;align-items:center;gap:5px">
          ${icon('loader-2', 'style="font-size:13px"')} Uploading…
        </div>
      </div>
    </div>`;
}

// ──────────────────────────────────────────────────────────────
// LOADING SKELETON (shown while fetching requirements)
// ──────────────────────────────────────────────────────────────
function buildSkeleton() {
  return Array.from({ length: 4 }, () => `
    <div class="dash-card" style="animation:kycPulse 1.5s ease-in-out infinite">
      <div style="display:flex;align-items:center;gap:16px">
        <div style="width:44px;height:44px;border-radius:10px;background:var(--border)"></div>
        <div style="flex:1">
          <div style="height:14px;width:60%;background:var(--border);border-radius:4px;margin-bottom:8px"></div>
          <div style="height:11px;width:80%;background:var(--border);border-radius:4px"></div>
        </div>
        <div style="width:90px;height:32px;background:var(--border);border-radius:6px"></div>
      </div>
    </div>`).join('');
}

// ──────────────────────────────────────────────────────────────
// EXPORT
// ──────────────────────────────────────────────────────────────
export const KycPendingView = {

  async render(container) {
    const user = OS.currentUser || {};

    // ── Step 1: Render shell immediately (topbar + hero + skeleton)
    container.innerHTML = `
      <style>
        @keyframes kycPulse {
          0%,100% { opacity:1 } 50% { opacity:.5 }
        }
      </style>

      <div class="dash-wrapper" style="background:#f8fafc;min-height:100vh">

        <!-- Top bar -->
        <div class="dash-topbar">
          <div class="dtb-logo">Off<span>Scape</span></div>
          <div style="flex:1;text-align:center">
            <span class="badge badge-amber"
                  style="font-size:12px;padding:5px 14px;
                         display:inline-flex;align-items:center;gap:6px">
              ${icon('clock-hour-4')} KYC Verification Pending
            </span>
          </div>
          <div class="dtb-right">
            <div class="dtb-avatar" style="background:#10b981">
              ${user.initials || '??'}
            </div>
            <button class="btn btn-ghost btn-sm"
                    style="display:inline-flex;align-items:center;gap:6px"
                    onclick="OS.logout()">
              ${icon('logout')} Logout
            </button>
          </div>
        </div>

        <!-- Body -->
        <div style="max-width:760px;margin:0 auto;padding:32px 20px 80px">

          <!-- Hero banner -->
          <div style="background:linear-gradient(135deg,#1e3a5f,#0f2744);
                      border-radius:16px;padding:28px;color:#fff;margin-bottom:28px">
            <div style="display:flex;align-items:flex-start;gap:18px;flex-wrap:wrap">
              <div style="width:52px;height:52px;border-radius:14px;
                          background:rgba(255,255,255,.1);
                          display:flex;align-items:center;justify-content:center;
                          flex-shrink:0;font-size:28px">
                ${icon('motorbike', 'style="font-size:28px"')}
              </div>
              <div style="flex:1">
                <div style="font-family:'Switzer',sans-serif;font-size:20px;
                            font-weight:800;margin-bottom:6px">
                  Almost there, ${user.firstName || 'Pickman'}!
                </div>
                <div style="font-size:13px;color:rgba(255,255,255,.72);
                            line-height:1.75;max-width:500px">
                  Upload your verification documents below. Once submitted, our team
                  reviews within <strong style="color:#fff">24–48 hours</strong>.
                  You'll receive an SMS when approved.
                </div>
                <div style="display:flex;gap:24px;margin-top:18px;flex-wrap:wrap">
                  <div>
                    <div style="font-size:22px;font-weight:800" id="docsCount">— / —</div>
                    <div style="font-size:11px;color:rgba(255,255,255,.5)">Required uploaded</div>
                  </div>
                  <div>
                    <div style="font-size:22px;font-weight:800">24–48h</div>
                    <div style="font-size:11px;color:rgba(255,255,255,.5)">Review time</div>
                  </div>
                  <div>
                    <div style="font-size:22px;font-weight:800" id="vehicleLabel">
                      ${VEHICLE_LABELS[user.vehicleType] || 'Vehicle'}
                    </div>
                    <div style="font-size:11px;color:rgba(255,255,255,.5)">Your vehicle type</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Stepper -->
          <div style="display:flex;align-items:flex-start;margin-bottom:28px">
            ${buildStepper()}
          </div>

          <!-- Required documents section -->
          <div style="font-size:11px;font-weight:700;color:var(--text3);
                      text-transform:uppercase;letter-spacing:.6px;
                      margin-bottom:12px">
            ${icon('circle-dot', 'style="font-size:13px;vertical-align:-1px;margin-right:4px;color:#dc2626"')}
            Required documents
          </div>
          <div id="kycRequiredCards"
               style="display:flex;flex-direction:column;gap:12px;margin-bottom:20px">
            ${buildSkeleton()}
          </div>

          <!-- Optional documents section (hidden until loaded) -->
          <div id="kycOptionalSection" style="display:none">
            <div style="font-size:11px;font-weight:700;color:var(--text3);
                        text-transform:uppercase;letter-spacing:.6px;
                        margin-bottom:12px">
              ${icon('circle-dashed', 'style="font-size:13px;vertical-align:-1px;margin-right:4px"')}
              Optional documents
              <span style="font-size:10px;font-weight:400;margin-left:6px;color:var(--text3)">
                (not required, but help speed up approval)
              </span>
            </div>
            <div id="kycOptionalCards"
                 style="display:flex;flex-direction:column;gap:12px;margin-bottom:20px">
            </div>
          </div>

          <!-- Requirements load error -->
          <div id="kycLoadError" style="display:none;text-align:center;padding:32px;
               background:var(--white);border:1.5px solid var(--border);border-radius:12px">
            ${icon('alert-circle', 'style="font-size:32px;color:var(--danger);display:block;margin:0 auto 12px"')}
            <div style="font-size:14px;font-weight:700;margin-bottom:6px">
              Couldn't load your document requirements
            </div>
            <div style="font-size:13px;color:var(--text2);margin-bottom:16px">
              Please check your connection and try again.
            </div>
            <button class="btn btn-ghost btn-sm"
                    style="display:inline-flex;align-items:center;gap:6px"
                    onclick="kycReloadRequirements()">
              ${icon('refresh')} Retry
            </button>
          </div>

          <!-- Submit section (visible once all required docs uploaded) -->
          <div id="kycSubmitSection" style="display:none;text-align:center">
            <div style="background:rgba(16,185,129,.07);border:1px solid rgba(16,185,129,.22);
                        border-radius:12px;padding:16px 20px;margin-bottom:16px;
                        font-size:13px;color:#065f46;line-height:1.7;
                        display:flex;align-items:flex-start;gap:10px">
              ${icon('circle-check', 'style="font-size:18px;flex-shrink:0;margin-top:1px"')}
              <span>
                All required documents uploaded. Click below to submit for review.
                Our team will contact you within 24–48 hours.
              </span>
            </div>
            <button class="btn btn-primary"
                    style="font-size:14px;padding:13px 40px;background:var(--success);
                           border-color:var(--success);
                           display:inline-flex;align-items:center;gap:8px"
                    onclick="kycSubmitAll()">
              ${icon('send')} Submit for review ${icon('arrow-right')}
            </button>
          </div>

          <!-- Post-submission state -->
          <div id="kycReviewPending" style="display:none;text-align:center;padding:24px">
            <div style="width:64px;height:64px;border-radius:50%;
                        background:rgba(245,158,11,.1);
                        display:flex;align-items:center;justify-content:center;
                        margin:0 auto 16px;font-size:28px;color:var(--warning)">
              ${icon('clock-hour-4', 'style="font-size:28px"')}
            </div>
            <div style="font-family:'Switzer',sans-serif;font-size:18px;
                        font-weight:800;margin-bottom:8px">
              Documents submitted
            </div>
            <div style="font-size:13px;color:var(--text2);line-height:1.75;margin-bottom:20px">
              Our team is reviewing your documents. You'll receive an SMS when your
              account is approved. Average review time:
              <strong>24–48 hours</strong>.
            </div>
            <button class="btn btn-ghost"
                    style="display:inline-flex;align-items:center;gap:6px"
                    onclick="kycCheckStatus()">
              ${icon('refresh')} Check Status
            </button>
          </div>

          <!-- Why we need documents -->
          <div style="background:var(--white);border:1.5px solid var(--border);
                      border-radius:12px;padding:20px;margin-top:20px">
            <div style="font-size:13px;font-weight:700;margin-bottom:10px;
                        display:flex;align-items:center;gap:8px">
              ${icon('info-circle', 'style="font-size:16px;color:var(--text2)"')}
              Why do we need these documents?
            </div>
            <div style="font-size:13px;color:var(--text2);line-height:1.85">
              OffScape verifies every pickman to protect customers and merchants on the
              platform. Your NIN confirms your identity, your licence confirms you can
              legally operate a vehicle, and your guarantor gives our users confidence
              that there is social accountability behind every delivery.
              <strong>This information is kept strictly confidential</strong> and only
              accessed by admin staff during verification and disputes.
            </div>
          </div>

        </div>
      </div>`;

    // ── Step 2: Fetch requirements from backend
    // GET /api/kyc/requirements
    // Returns: { docs: [{ key, label, hint, icon, accept, maxSizeMB, required }] }
    // Backend reads rider's vehicleType + country from their profile and returns
    // the correct KYC_CONFIG slice — frontend never hardcodes doc lists.

    await this._loadRequirements();
  },

  // ── Fetch doc requirements and render cards
  async _loadRequirements() {
    const token = localStorage.getItem('os_token');
    if (!token) {
      console.error('[KYC] No token found - user not authenticated');
      // Redirect to login or show error
      return;
    }
    const requiredContainer = document.getElementById('kycRequiredCards');
    const optionalContainer = document.getElementById('kycOptionalCards');
    const optionalSection   = document.getElementById('kycOptionalSection');
    const errorEl           = document.getElementById('kycLoadError');

    // State: track uploaded counts
    let requiredDocs    = [];
    let optionalDocs    = [];
    let uploadedRequired = 0;
    let uploadedOptional = 0;

    try {
      // ── Fetch from backend
      const { docs } = await Pickmen.getKycRequirements();
      // docs = [{ key, label, hint, icon, accept, maxSizeMB, required }, ...]

      requiredDocs = docs.filter(d => d.required);
      optionalDocs = docs.filter(d => !d.required);

      // ── Render required cards
      if (requiredContainer) {
        requiredContainer.innerHTML = requiredDocs.length
          ? requiredDocs.map(buildDocCard).join('')
          : '<div style="font-size:13px;color:var(--text2);padding:12px">No required documents for your vehicle type.</div>';
      }

      // ── Render optional cards (only show section if there are any)
      if (optionalDocs.length > 0) {
        if (optionalContainer) optionalContainer.innerHTML = optionalDocs.map(buildDocCard).join('');
        if (optionalSection)   optionalSection.style.display = 'block';
      }

      // ── Update the hero counter to reflect required-only count
      const countEl = document.getElementById('docsCount');
      if (countEl) countEl.textContent = `0 / ${requiredDocs.length}`;

      // ── Wire up upload logic now that cards exist
      _wireUploads(requiredDocs, optionalDocs, () => uploadedRequired, (n) => {
        uploadedRequired = n;
        if (countEl) countEl.textContent = `${uploadedRequired} / ${requiredDocs.length}`;

        // Show submit section only once ALL required docs are uploaded
        const submitSec = document.getElementById('kycSubmitSection');
        if (submitSec) {
          submitSec.style.display = uploadedRequired >= requiredDocs.length ? 'block' : 'none';
          if (uploadedRequired >= requiredDocs.length) {
            submitSec.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });

    } catch (err) {
      // ── Show error state
      if (requiredContainer) requiredContainer.innerHTML = '';
      if (errorEl)           errorEl.style.display = 'block';
      console.error('[KYC] Failed to load requirements:', err);
    }
  },
};

// ──────────────────────────────────────────────────────────────
// INTERNAL — Wire upload events onto rendered cards
// ──────────────────────────────────────────────────────────────
function _wireUploads(requiredDocs, optionalDocs, getCount, setCount) {

  // ── File selected → upload
  window.kycUploadFile = async function(docKey, input, maxSizeMB, isRequired) {
    const file = input.files[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      showToast(`File too large. Max ${maxSizeMB} MB for this document.`, 'error');
      input.value = '';
      return;
    }

    const $ = id => document.getElementById(id);
    const btn      = $(`kycBtn-${docKey}`);
    const statusEl = $(`kycStatus-${docKey}`);
    const progEl   = $(`kycProgress-${docKey}`);
    const progLabel= $(`kycProgLabel-${docKey}`);
    const fill     = $(`kycFill-${docKey}`);
    const card     = $(`kycCard-${docKey}`);
    const iconBox  = $(`kycIconBox-${docKey}`);

    // ── Uploading UI state
    if (btn)      { btn.disabled = true; btn.innerHTML = `${icon('loader-2')} Uploading…`; }
    if (statusEl) {
      statusEl.innerHTML = `
        <span class="badge badge-amber" style="display:inline-flex;align-items:center;gap:5px">
          ${icon('clock', 'style="font-size:12px"')} Uploading
        </span>`;
    }
    if (progEl)  progEl.style.display = 'block';
    if (fill)    fill.style.width = '10%';

    // Fake progress ticks
    let prog = 10;
    const tick = setInterval(() => {
      prog = Math.min(prog + 15, 85);
      if (fill) fill.style.width = prog + '%';
    }, 300);

    try {
      // POST /api/kyc/upload  { docKey, file }
      await Pickmen.uploadKycDoc(docKey, file);
      clearInterval(tick);

      if (fill)      fill.style.width = '100%';
      if (progLabel) progLabel.innerHTML =
        `${icon('circle-check', 'style="font-size:13px"')} Upload complete`;

      // ── Success state
      if (statusEl) {
        statusEl.innerHTML = `
          <span class="badge badge-green" style="display:inline-flex;align-items:center;gap:5px">
            ${icon('circle-check', 'style="font-size:12px"')} Uploaded
          </span>`;
      }
      if (card) {
        card.style.borderColor = 'rgba(16,185,129,.4)';
        card.style.background  = 'rgba(16,185,129,.03)';
      }
      if (iconBox) {
        iconBox.style.background  = 'rgba(16,185,129,.1)';
        iconBox.style.borderColor = 'rgba(16,185,129,.35)';
        iconBox.style.color       = '#10b981';
        iconBox.innerHTML         = icon('circle-check');
      }
      if (btn) { btn.innerHTML = `${icon('replace')} Replace`; btn.disabled = false; }

      // ── Track required-only count
      if (isRequired) setCount(getCount() + 1);

    } catch (err) {
      clearInterval(tick);
      if (fill) { fill.style.background = '#ef4444'; fill.style.width = '100%'; }
      if (progLabel) progLabel.innerHTML =
        `${icon('alert-circle', 'style="font-size:13px"')} Upload failed. Try again.`;
      if (statusEl) {
        statusEl.innerHTML = `
          <span class="badge badge-red" style="display:inline-flex;align-items:center;gap:5px">
            ${icon('alert-circle', 'style="font-size:12px"')} Failed
          </span>`;
      }
      if (btn) { btn.innerHTML = `${icon('rotate')} Retry`; btn.disabled = false; }
      showToast(`Upload failed: ${err.message}`, 'error');
    }
  };
}

// ──────────────────────────────────────────────────────────────
// GLOBAL ACTIONS
// ──────────────────────────────────────────────────────────────

// Submit all for admin review
window.kycSubmitAll = async function() {
  try {
    await Pickmen.submitKyc();  // POST /api/kyc/submit
    document.getElementById('kycSubmitSection').style.display = 'none';
    document.getElementById('kycReviewPending').style.display = 'block';
    showToast(
      'Documents submitted for review! We will SMS you when approved.',
      'success',
      6000
    );
    AuthState.updateUser({ kycSubmitted: true });
  } catch (err) {
    showToast(`Submission failed: ${err.message}`, 'error');
  }
};

// Check live KYC status
window.kycCheckStatus = async function() {
  try {
    const { status } = await Pickmen.getKycStatus(); // GET /api/kyc/status
    if (status === 'approved') {
      AuthState.updateUser({ status: 'active' });
      showToast('Your account is approved! Redirecting to dashboard…', 'success', 4000);
      setTimeout(() => OS.enterDashboard('pickman'), 2000);
    } else if (status === 'rejected') {
      showToast(
        'Your KYC was rejected. Check the reason in your SMS and resubmit.',
        'error',
        6000
      );
    } else {
      showToast('Still under review. Our team will contact you soon.', 'info');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
};

// Retry loading requirements after a network error
window.kycReloadRequirements = function() {
  const errorEl = document.getElementById('kycLoadError');
  const required = document.getElementById('kycRequiredCards');
  if (errorEl)  errorEl.style.display = 'none';
  if (required) required.innerHTML = buildSkeleton();
  KycPendingView._loadRequirements();
};
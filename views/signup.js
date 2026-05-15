// ==================== SIGN UP VIEW — Multi-Step ====================
// 3 roles, each with their own step sequence:
//
//  Customer  → [1] Personal  [2] Password
//  Merchant  → [1] Personal  [2] Business   [3] Password
//  Rider     → [1] Personal  [2] Zone       [3] Vehicle    [4] Guarantor  [5] Password
//
// Zone loading:
//  - Triggered when city is selected in step 1
//  - Prefetched in background so step 2 (rider) loads instantly
//  - Sends zone._id (ObjectId) as operatingZoneId — NOT slug
//  - Uses GET /api/zones?city=ibadan via Zones.getAll()

import { AuthAPI, Zones } from '../js/api.js';
import { Auth }           from '../js/auth.js';

// Step definitions per role — order matters, drives progress indicator
const ROLE_STEPS = {
  customer: [
    { id: 'step-personal',   label: 'Your Info'  },
    { id: 'step-password',   label: 'Password'   },
  ],
  merchant: [
    { id: 'step-personal',   label: 'Your Info'  },
    { id: 'step-business',   label: 'Business'   },
    { id: 'step-password',   label: 'Password'   },
  ],
  rider: [
    { id: 'step-personal',   label: 'Your Info'  },
    { id: 'step-zone',       label: 'Zone'       },
    { id: 'step-vehicle',    label: 'Vehicle'    },
    { id: 'step-guarantor',  label: 'Guarantor'  },
    { id: 'step-password',   label: 'Finish'     },
  ],
};

export const SignUpView = {
  render(container) {
    let selectedRole  = 'customer';
    let currentStep   = 0;          // index into ROLE_STEPS[selectedRole]
    let prefetchedZones = [];        // cached so step 2 (rider zone) is instant

    // ─────────────────────────────────────────────────────────────────────────
    // HTML
    // ─────────────────────────────────────────────────────────────────────────
    container.innerHTML = `
      <div class="auth-container">

        <!-- LEFT BRAND PANEL -->
        <div class="auth-left">
          <div class="auth-brand-logo">Off<span>Scape</span></div>
          <h1>Start sending <em>smarter.</em></h1>
          <p>Join thousands of customers, merchants, and riders on Nigeria's fastest-growing logistics platform.</p>
          <div class="auth-steps">
            ${[
              ['1', 'Create your account',      'Under 2 minutes'],
              ['2', 'Book your first delivery', 'Pickup, drop-off, and package'],
              ['3', 'Track until delivered',    'Live GPS on every order'],
              ['4', 'Get paid or save money',   'Instant payouts for riders'],
            ].map(([n, title, sub]) => `
            <div class="auth-step">
              <div class="step-num">${n}</div>
              <div class="step-text"><strong>${title}</strong><span>${sub}</span></div>
            </div>`).join('')}
          </div>
        </div>

        <!-- RIGHT FORM PANEL -->
        <div class="auth-right">
          <div class="auth-form-header">
            <h2 id="suFormTitle">Create your account</h2>
            <p>Already have one? <a href="#" data-nav="/signin">Sign in instead</a></p>
          </div>

          <!-- ROLE SELECTOR — always visible on step 0 -->
          <div id="suRoleSection" style="margin-bottom:20px">
            <div class="field-label">I am a...</div>
            <div class="role-selector" id="suRoleSelector">
              ${[
                ['customer', '<i class="fa-regular fa-user"></i>',       'Customer', 'Send packages'],
                ['merchant', '<i class="fa-solid fa-store"></i>',        'Merchant', 'Business owner'],
                ['rider',    '<i class="fa-solid fa-motorcycle"></i>',   'Rider',    'Deliver &amp; earn'],
              ].map(([r, icon, name, desc], i) => `
              <div class="role-card${i === 0 ? ' active' : ''}" onclick="suSelectRole(this,'${r}')">
                <div class="role-card-icon">${icon}</div>
                <div class="role-card-name">${name}</div>
                <div class="role-card-desc">${desc}</div>
              </div>`).join('')}
            </div>
          </div>

          <!-- PROGRESS INDICATOR — shown from step 1 onward -->
          <div id="suProgress" style="display:none;margin-bottom:24px">
            <div id="suProgressDots" style="display:flex;align-items:center;gap:0"></div>
          </div>

          <!-- ERROR BOX -->
          <div class="auth-error" id="suError"></div>

          <!-- ── STEP: Personal Info (all roles) ── -->
          <div class="su-step" id="step-personal" style="display:none">
            <div class="form-row-2">
              <div class="form-group">
                <label>First Name</label>
                <input class="form-input" type="text" id="suFirst"
                  placeholder="Tunde" autocomplete="given-name">
              </div>
              <div class="form-group">
                <label>Last Name</label>
                <input class="form-input" type="text" id="suLast"
                  placeholder="Adeyemi" autocomplete="family-name">
              </div>
            </div>
            <div class="form-group">
              <label>Email Address</label>
              <input class="form-input" type="email" id="suEmail"
                placeholder="you@example.com" autocomplete="email">
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <div style="display:flex;gap:8px">
                <div style="background:var(--bg);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0 12px;display:flex;align-items:center;font-size:13px;font-weight:600;color:var(--text2);white-space:nowrap">🇳🇬 +234</div>
                <input class="form-input" type="tel" id="suPhone"
                  placeholder="08012345678" autocomplete="tel" style="flex:1">
              </div>
            </div>
            <div class="form-group">
              <label>City</label>
              <select class="form-input" id="suCity" onchange="suOnCityChange(this.value)">
                <option value="">Pick your region</option>
                <option value="ibadan">Ibadan</option>
                <option value="lagos">Lagos</option>
              </select>
            </div>
          </div>

          <!-- ── STEP: Business Details (merchant only) ── -->
          <div class="su-step" id="step-business" style="display:none">
            <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:16px">Business Details</div>
            <div class="form-group">
              <label>Business Name</label>
              <input class="form-input" type="text" id="suBusinessName"
                placeholder="Balogun Fashion House">
            </div>
            <div class="form-group">
              <label>Business Type</label>
              <select class="form-input" id="suBusinessType">
                <option value="">Select type...</option>
                <option value="fashion">Fashion &amp; Clothing</option>
                <option value="electronics">Electronics</option>
                <option value="grocery">Grocery &amp; Food</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="documents">Documents &amp; Printing</option>
                <option value="furniture">Furniture &amp; Home</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label>Business Address</label>
              <input class="form-input" type="text" id="suBusinessAddress"
                placeholder="15 Balogun Street, Lagos Island">
            </div>
            <div class="form-group">
              <label>CAC Number <span style="font-weight:400;color:var(--text3)">(optional)</span></label>
              <input class="form-input" type="text" id="suCac" placeholder="RC-123456">
            </div>
          </div>

          <!-- ── STEP: Operating Zone (rider only) ── -->
          <div class="su-step" id="step-zone" style="display:none">
            <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Operating Zone</div>
            <p style="font-size:13px;color:var(--text2);line-height:1.6;margin-bottom:16px">
              This is the area you'll receive delivery jobs from. Choose the zone where you spend most of your time — you can cover nearby zones later.
            </p>
            <div class="form-group">
              <label>Zone</label>
              <!-- Loading state -->
              <div id="suZoneLoading" style="display:none;font-size:13px;color:var(--text2);padding:10px 0">
                <div class="auth-spinner" style="display:inline-block;width:14px;height:14px;border-width:2px;vertical-align:middle;margin-right:6px"></div>
                Loading zones for your city…
              </div>
              <!-- Zone select -->
              <select class="form-input" id="suOperatingZone" style="display:none">
                <option value="">Select your zone…</option>
              </select>
              <!-- Error state -->
              <div id="suZoneError" style="display:none;font-size:13px;color:var(--danger);padding:8px 0">
                Could not load zones.
                <a href="#" onclick="suRefetchZones();return false" style="color:var(--red)">Retry</a>
              </div>
              <!-- No city selected warning -->
              <div id="suZoneNoCityWarning" style="font-size:13px;color:var(--text2);padding:10px;background:var(--bg);border-radius:8px;border:1px solid var(--border)">
                ← Go back and select your city first
              </div>
            </div>
          </div>

          <!-- ── STEP: Vehicle Details (rider only) ── -->
          <div class="su-step" id="step-vehicle" style="display:none">
            <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:16px">Vehicle Information</div>
            <div class="form-group">
              <label>Vehicle Type</label>
              <select class="form-input" id="suVehicleType">
                <option value="">Select vehicle...</option>
                <option value="motorcycle">Motorcycle (Okada)</option>
                <option value="bicycle">Bicycle</option>
                <option value="car">Car</option>
                <option value="van">Van / Mini-truck</option>
              </select>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label>Vehicle Model</label>
                <input class="form-input" type="text" id="suVehicleModel"
                  placeholder="Honda CB125">
              </div>
              <div class="form-group">
                <label>Plate Number</label>
                <input class="form-input" type="text" id="suPlate"
                  placeholder="ABC-123-DE"
                  oninput="this.value = this.value.toUpperCase()">
              </div>
            </div>
            <div class="form-group">
              <label>NIN (National ID Number)</label>
              <input class="form-input" type="text" id="suNin"
                placeholder="12345678901" maxlength="11"
                oninput="this.value = this.value.replace(/\D/g,'')">
              <div style="font-size:11px;color:var(--text3);margin-top:4px">Must be exactly 11 digits</div>
            </div>
          </div>

          <!-- ── STEP: Guarantor (rider only) ── -->
          <div class="su-step" id="step-guarantor" style="display:none">
            <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Guarantor Information</div>
            <p style="font-size:13px;color:var(--text2);line-height:1.6;margin-bottom:16px">
              We verify your guarantor by phone before approving your account. Use someone you trust who can vouch for you.
            </p>
            <div class="form-group">
              <label>Guarantor Full Name</label>
              <input class="form-input" type="text" id="suGuarantorName"
                placeholder="Mrs. Adewale Bola">
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label>Guarantor Phone</label>
                <input class="form-input" type="tel" id="suGuarantorPhone"
                  placeholder="08012345678">
              </div>
              <div class="form-group">
                <label>Relationship</label>
                <select class="form-input" id="suGuarantorRel">
                  <option value="">Select...</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Employer">Employer</option>
                  <option value="Community Leader">Community Leader</option>
                  <option value="Colleague">Colleague</option>
                </select>
              </div>
            </div>
             <div class="form-group">
              <label>Guarantor Address</label>
              <input class="form-input" type="text" id="suGuarantorAddress"
                placeholder="Enter your address">
            </div>
            <div style="background:rgba(245,158,11,.06);border:1px solid rgba(245,158,11,.2);border-radius:8px;padding:12px;font-size:12px;color:#92400e;line-height:1.6">
              <i class="fa-solid fa-triangle-exclamation" style="color:#92400e;margin-right:6px"></i>
              <strong>KYC Required:</strong> After signup you'll upload your NIN slip, driver's licence, vehicle insurance, plate photo, and guarantor form. You won't be able to accept jobs until admin verifies all documents (24–48 hrs).
            </div>
          </div>

          <!-- ── STEP: Password + Terms (all roles, always last) ── -->
          <div class="su-step" id="step-password" style="display:none">
            <div class="form-group">
              <label>Password</label>
              <div class="password-wrap">
                <input class="form-input" type="password" id="suPassword"
                  placeholder="Min. 8 characters" autocomplete="new-password"
                  oninput="suCheckPwStrength(this.value)">
                <button type="button" class="toggle-pw"
                  onclick="suTogglePw('suPassword', this)">
                  <i class="fa-regular fa-eye"></i>
                </button>
              </div>
              <div class="pw-strength-bar">
                <div class="pw-strength-fill" id="suPwFill"></div>
              </div>
              <div class="pw-strength-label" id="suPwLabel"></div>
            </div>
            <div class="form-group">
              <label>Confirm Password</label>
              <div class="password-wrap">
                <input class="form-input" type="password" id="suConfirmPw"
                  placeholder="Repeat password" autocomplete="new-password">
                <button type="button" class="toggle-pw"
                  onclick="suTogglePw('suConfirmPw', this)">
                  <i class="fa-regular fa-eye"></i>
                </button>
              </div>
            </div>
            <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:20px">
              <input type="checkbox" id="suTerms"
                style="accent-color:var(--red);width:16px;height:16px;cursor:pointer;margin-top:2px;flex-shrink:0">
              <label for="suTerms"
                style="font-size:12px;color:var(--text2);cursor:pointer;text-transform:none;letter-spacing:0;line-height:1.5">
                I agree to OffScape's
                <a href="#" data-nav="/terms" style="color:var(--red)">Terms of Service</a> and
                <a href="#" data-nav="/privacy" style="color:var(--red)">Privacy Policy</a>.
                I understand the platform charges a 5% fee on all deliveries.
              </label>
            </div>
          </div>

          <!-- ── NAVIGATION BUTTONS ── -->
          <div id="suNavBtns" style="display:none;margin-top:4px">
            <!-- Step 0 (role selector) → single Next button -->
            <div id="suNavStep0">
              <button class="auth-submit" onclick="suBegin()">
                Continue as <span id="suRoleLabel">Customer</span> →
              </button>
            </div>
            <!-- Step 1+ → Back + Next/Submit -->
            <div id="suNavSteps" style="display:none">
              <div style="display:flex;gap:12px">
                <button type="button"
                  style="flex:0 0 auto;background:var(--bg);border:1.5px solid var(--border);border-radius:var(--radius);padding:13px 20px;font-weight:700;font-size:14px;cursor:pointer;color:var(--text)"
                  onclick="suBack()">← Back</button>
                <button type="button" id="suNextBtn"
                  class="auth-submit" style="flex:1"
                  onclick="suNext()">
                  <div class="auth-spinner" id="suSpinner" style="display:none"></div>
                  <span id="suBtnText">Next →</span>
                </button>
              </div>
            </div>
          </div>

          <div class="auth-switch-link" style="margin-top:16px">
            Already have an account? <a href="#" data-nav="/signin">Sign in</a>
          </div>
        </div>
      </div>`;

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    function val(id) {
      return document.getElementById(id)?.value?.trim() || '';
    }

    function showError(msg) {
      const el = document.getElementById('suError');
      if (!el) return;
      el.textContent = msg;
      el.classList.add('show');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function clearError() {
      const el = document.getElementById('suError');
      if (el) { el.textContent = ''; el.classList.remove('show'); }
    }

    function setLoading(loading) {
      const btn  = document.getElementById('suNextBtn');
      const spin = document.getElementById('suSpinner');
      const txt  = document.getElementById('suBtnText');
      if (!btn) return;
      btn.disabled       = loading;
      spin.style.display = loading ? 'block' : 'none';
      if (!loading) return; // text is set by renderNav
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ROLE SELECTION
    // ─────────────────────────────────────────────────────────────────────────
    window.suSelectRole = function(el, role) {
      selectedRole = role;
      document.querySelectorAll('#suRoleSelector .role-card')
        .forEach(c => c.classList.remove('active'));
      el.classList.add('active');

      // Update "Continue as X" button label
      const labels = { customer: 'Customer', merchant: 'Merchant', rider: 'Rider' };
      const lbl = document.getElementById('suRoleLabel');
      if (lbl) lbl.textContent = labels[role];
    };

    // ─────────────────────────────────────────────────────────────────────────
    // ZONE FETCHING
    // Triggered when city is selected in step-personal (step 1).
    // Prefetches zones in background so rider step 2 is instant.
    // ─────────────────────────────────────────────────────────────────────────
    window.suOnCityChange = async function(city) {
      if (!city || selectedRole !== 'rider') return;
      await suFetchZones(city);
    };

    async function suFetchZones(city) {
      const loading = document.getElementById('suZoneLoading');
      const select  = document.getElementById('suOperatingZone');
      const errDiv  = document.getElementById('suZoneError');
      const noCity  = document.getElementById('suZoneNoCityWarning');

      if (!city) {
        // No city — show warning, hide everything else
        if (loading) loading.style.display = 'none';
        if (select)  select.style.display  = 'none';
        if (errDiv)  errDiv.style.display  = 'none';
        if (noCity)  noCity.style.display  = 'block';
        return;
      }

      // Show loading, hide others
      if (loading) loading.style.display = 'block';
      if (select)  select.style.display  = 'none';
      if (errDiv)  errDiv.style.display  = 'none';
      if (noCity)  noCity.style.display  = 'none';

      try {
        // Zones.getAll(city) → GET /api/zones?city=ibadan
        // Returns { zones: [{ _id, name, slug }] }
        const { zones } = await Zones.getAll(city);
        prefetchedZones = zones || [];

        if (!select) return;
        select.innerHTML = '<option value="">Select your zone…</option>';

        prefetchedZones.forEach(z => {
          const opt = document.createElement('option');
          opt.value       = z._id;   // ← ObjectId — what backend expects as operatingZoneId
          opt.textContent = z.name;  // ← Human readable label
          select.appendChild(opt);
        });

        if (loading) loading.style.display = 'none';
        select.style.display = 'block';

      } catch (err) {
        prefetchedZones = [];
        if (loading) loading.style.display = 'none';
        if (errDiv)  errDiv.style.display  = 'block';
      }
    }
 
    window.suRefetchZones = function() {
      const city = val('suCity');
      if (city) suFetchZones(city);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // PROGRESS INDICATOR
    // ─────────────────────────────────────────────────────────────────────────
    function renderProgress() {
      const steps   = ROLE_STEPS[selectedRole];
      const dotsEl  = document.getElementById('suProgressDots');
      const progEl  = document.getElementById('suProgress');
      if (!dotsEl || !progEl) return;

      progEl.style.display = currentStep === 0 ? 'none' : 'block';
      if (currentStep === 0) return;

      const stepIndex = currentStep - 1; // step 0 is role selector (not in ROLE_STEPS)

      dotsEl.innerHTML = steps.map((s, i) => {
        const done    = i < stepIndex;
        const active  = i === stepIndex;
        const color   = done ? 'var(--red)' : active ? 'var(--red)' : 'var(--border)';
        const textCol = done || active ? 'var(--red)' : 'var(--text3)';
        const size    = active ? '28px' : '22px';

        const dot = `
          <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
            <div style="width:${size};height:${size};border-radius:50%;
              background:${active ? 'var(--red)' : done ? 'var(--red)' : 'transparent'};
              border:2px solid ${color};
              display:flex;align-items:center;justify-content:center;
              transition:all .2s">
              ${done
                ? '<i class="fa-solid fa-check" style="color:#fff;font-size:10px"></i>'
                : `<span style="font-size:11px;font-weight:700;color:${active ? '#fff' : 'var(--text3)'}">${i + 1}</span>`
              }
            </div>
            <span style="font-size:10px;font-weight:600;color:${textCol};white-space:nowrap">${s.label}</span>
          </div>`;

        // Connector line between dots
        const line = i < steps.length - 1
          ? `<div style="flex:1;height:2px;background:${done ? 'var(--red)' : 'var(--border)'};margin-bottom:18px;transition:background .2s"></div>`
          : '';

        return dot + line;
      }).join('');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SHOW/HIDE CORRECT STEP
    // ─────────────────────────────────────────────────────────────────────────
    function renderStep() {
      const steps   = ROLE_STEPS[selectedRole];
      const navBtns = document.getElementById('suNavBtns');
      const nav0    = document.getElementById('suNavStep0');
      const navN    = document.getElementById('suNavSteps');
      const btnTxt  = document.getElementById('suBtnText');
      const title   = document.getElementById('suFormTitle');
      const role    = document.getElementById('suRoleSection');

      // Hide all step panels
      document.querySelectorAll('.su-step').forEach(el => el.style.display = 'none');

      if (currentStep === 0) {
        // Role selector step
        if (role)    role.style.display    = 'block';
        if (navBtns) navBtns.style.display = 'block';
        if (nav0)    nav0.style.display    = 'block';
        if (navN)    navN.style.display    = 'none';
        if (title)   title.textContent     = 'Create your account';
      } else {
        // Content step
        const stepId  = steps[currentStep - 1].id;
        const stepEl  = document.getElementById(stepId);
        if (stepEl)  stepEl.style.display = 'block';
        if (role)    role.style.display   = 'none';
        if (navBtns) navBtns.style.display = 'block';
        if (nav0)    nav0.style.display    = 'none';
        if (navN)    navN.style.display    = 'block';

        // Button label
        const isLast = currentStep === steps.length;
        if (btnTxt) btnTxt.textContent = isLast ? 'Create Account →' : 'Next →';

        // Step title
        const titles = {
          'step-personal':  'Your personal info',
          'step-business':  'Business details',
          'step-zone':      'Operating zone',
          'step-vehicle':   'Vehicle details',
          'step-guarantor': 'Guarantor info',
          'step-password':  'Almost done!',
        };
        if (title) title.textContent = titles[stepId] || 'Sign up';
      }

      renderProgress();
      clearError();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // NAVIGATION
    // ─────────────────────────────────────────────────────────────────────────
    window.suBegin = function() {
      currentStep = 1;
      renderStep();

      // Prefetch zones if rider already has a city
      if (selectedRole === 'rider') {
        const city = val('suCity');
        if (city) suFetchZones(city);
      }
    };

    window.suBack = function() {
      if (currentStep > 1) {
        currentStep--;
        renderStep();
      } else {
        currentStep = 0;
        renderStep();
      }
    };

    window.suNext = async function() {
      const steps  = ROLE_STEPS[selectedRole];
      const stepId = steps[currentStep - 1].id;
      const isLast = currentStep === steps.length;

      clearError();

      // Validate current step
      const err = validateStep(stepId);
      if (err) { showError(err); return; }

      if (isLast) {
        await submitSignup();
      } else {
        currentStep++;

        // When advancing to zone step for riders, ensure zones are loaded
        if (steps[currentStep - 1]?.id === 'step-zone') {
          const city = val('suCity');
          if (city && prefetchedZones.length === 0) {
            await suFetchZones(city);
          }
        }

        renderStep();
      }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // PER-STEP VALIDATION
    // ─────────────────────────────────────────────────────────────────────────
    function validateStep(stepId) {
      switch (stepId) {

        case 'step-personal': {
          if (!val('suFirst'))  return 'Please enter your first name.';
          if (!val('suLast'))   return 'Please enter your last name.';
          const email = val('suEmail');
          if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return 'Please enter a valid email address.';
          const phone = val('suPhone');
          if (!phone || phone.length < 10)
            return 'Please enter a valid Nigerian phone number.';
          if (!val('suCity'))   return 'Please select your city.';
          return null;
        }

        case 'step-business': {
          if (!val('suBusinessName'))    return 'Please enter your business name.';
          if (!val('suBusinessType'))    return 'Please select your business type.';
          if (!val('suBusinessAddress')) return 'Please enter your business address.';
          return null;
        }

        case 'step-zone': {
          const zoneId = document.getElementById('suOperatingZone')?.value;
          if (!zoneId) return 'Please select your operating zone.';
          return null;
        }

        case 'step-vehicle': {
          if (!val('suVehicleType'))  return 'Please select your vehicle type.';
          if (!val('suVehicleModel')) return 'Please enter your vehicle model.';
          if (!val('suPlate'))        return 'Please enter your plate number.';
          const nin = val('suNin');
          if (!nin || !/^\d{11}$/.test(nin)) return 'NIN must be exactly 11 digits.';
          return null;
        }

        case 'step-guarantor': {
          if (!val('suGuarantorName'))  return 'Please enter your guarantor\'s full name.';
          const gPhone = val('suGuarantorPhone');
          if (!gPhone || gPhone.length < 10)
            return 'Please enter your guarantor\'s phone number.';
          if (!val('suGuarantorRel'))   return 'Please select your relationship to your guarantor.';
          if (!val('suGuarantorAddress')) return 'Please enter your specific address.';
          return null;
        }

        case 'step-password': {
          const pw  = document.getElementById('suPassword')?.value;
          const cpw = document.getElementById('suConfirmPw')?.value;
          if (!pw || pw.length < 8) return 'Password must be at least 8 characters.';
          if (pw !== cpw)           return 'Passwords do not match.';
          if (!document.getElementById('suTerms')?.checked)
            return 'Please accept the Terms of Service to continue.';
          return null;
        }

        default: return null;
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SUBMIT
    // ─────────────────────────────────────────────────────────────────────────
    async function submitSignup() {
      setLoading(true);
      const btnTxt = document.getElementById('suBtnText');
      if (btnTxt) btnTxt.textContent = 'Creating account…';

      try {
        const base = {
          firstName: val('suFirst'),
          lastName:  val('suLast'),
          email:     val('suEmail'),
          phone:     val('suPhone'),
          city:      val('suCity'),
          password:  document.getElementById('suPassword')?.value,
        };

        let result;

        if (selectedRole === 'customer') {
          result = await AuthAPI.signupCustomer(base);

        } else if (selectedRole === 'merchant') {
          result = await AuthAPI.signupMerchant({
            ...base,
            businessName:    val('suBusinessName'),
            businessType:    val('suBusinessType'),
            businessAddress: val('suBusinessAddress'),
            cacNumber:       val('suCac') || undefined,
          });

        } else if (selectedRole === 'rider') {
          result = await AuthAPI.signupRider({
            ...base,
            // ← ObjectId from zone dropdown — backend validates this
            operatingZoneId:       document.getElementById('suOperatingZone')?.value,
            vehicleType:           val('suVehicleType'),
            vehicleModel:          val('suVehicleModel'),
            plateNumber:           val('suPlate'),
            nin:                   val('suNin'),
            guarantorFullName:     val('suGuarantorName'),
            guarantorPhone:        val('suGuarantorPhone'),
            guarantorRelationship: val('suGuarantorRel'),
            guarantorAddress:      val('suGuarantorAddress')
          });
        }

        // Store email for the resend verification flow
        sessionStorage.setItem('pendingVerifyEmail', base.email);

        showToast(
          result?.emailSent !== false
            ? 'Account created! Check your email to verify.'
            : 'Account created! Use the resend option to get your verification email.',
          'success',
          5000
        );

        Router.go('/verify-pending');

      } catch (err) {
        showError(err.message || 'Could not create account. Please try again.');
        setLoading(false);
        const btnTxt = document.getElementById('suBtnText');
        if (btnTxt) btnTxt.textContent = 'Create Account →';
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PASSWORD STRENGTH
    // ─────────────────────────────────────────────────────────────────────────
    window.suCheckPwStrength = function(pw) {
      const fill  = document.getElementById('suPwFill');
      const label = document.getElementById('suPwLabel');
      if (!fill || !label) return;
      if (!pw) {
        fill.style.width = '0';
        fill.style.background = 'transparent';
        label.textContent = '';
        return;
      }
      let score = 0;
      if (pw.length >= 8)          score++;
      if (/[A-Z]/.test(pw))        score++;
      if (/[0-9]/.test(pw))        score++;
      if (/[^A-Za-z0-9]/.test(pw)) score++;
      const levels = [
        { w: '25%',  bg: '#ef4444', text: 'Weak'     },
        { w: '50%',  bg: '#f59e0b', text: 'Fair'     },
        { w: '75%',  bg: '#3b82f6', text: 'Good'     },
        { w: '100%', bg: '#10b981', text: 'Strong ✓' },
      ];
      const l = levels[Math.max(0, score - 1)];
      fill.style.width      = l.w;
      fill.style.background = l.bg;
      label.textContent     = l.text;
      label.style.color     = l.bg;
    };

    // ─────────────────────────────────────────────────────────────────────────
    // PASSWORD TOGGLE
    // ─────────────────────────────────────────────────────────────────────────
    window.suTogglePw = function(id, btn) {
      const inp = document.getElementById(id);
      if (!inp) return;
      inp.type = inp.type === 'password' ? 'text' : 'password';
      btn.innerHTML = inp.type === 'password'
        ? '<i class="fa-regular fa-eye"></i>'
        : '<i class="fa-regular fa-eye-slash"></i>';
    };

    // ─────────────────────────────────────────────────────────────────────────
    // INIT — render the first step (role selector)
    // ─────────────────────────────────────────────────────────────────────────
    renderStep();
  }
};
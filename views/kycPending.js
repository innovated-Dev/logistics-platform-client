// ==================== KYC PENDING VIEW ====================
// Shown to riders immediately after signup and whenever they try
// to access the dashboard while status === 'pending_kyc'.
// Five document upload slots, live upload progress, status tracker.
import { Riders }    from '../js/api.js';
import { Auth } from '../js/auth.js';

export const KycPendingView = {
  render(container) {
    const user = OS.currentUser || {};

    // Document definitions — what we need, why, and accepted formats
    const DOCS = [
      { key: 'nin_document',       label: 'NIN Slip / ID Card',       icon: '🪪', hint: 'Your National Identification Number document' },
      { key: 'drivers_licence',    label: "Driver's Licence",          icon: '📋', hint: 'Front page of a valid Nigerian driver\'s licence' },
      { key: 'vehicle_insurance',  label: 'Vehicle Insurance',         icon: '🛡️', hint: 'Current vehicle insurance certificate' },
      { key: 'plate_photo',        label: 'Plate Number Photo',        icon: '📸', hint: 'Clear photo of your vehicle plate number' },
      { key: 'guarantor_form',     label: 'Guarantor Form',            icon: '📝', hint: 'Completed form signed by your guarantor' },
    ];

    // Track upload state per document
    const uploadState = {};
    DOCS.forEach(d => { uploadState[d.key] = { status: 'idle', url: null }; }); // idle|uploading|done|error

    container.innerHTML = `
      <div class="dash-wrapper" style="background:#f8fafc;min-height:100vh">

        <!-- Header -->
        <div class="dash-topbar">
          <div class="dtb-logo">Off<span>Scape</span></div>
          <div style="flex:1;text-align:center">
            <span class="badge badge-amber" style="font-size:13px;padding:6px 14px">
              ⏳ KYC Verification Pending
            </span>
          </div>
          <div class="dtb-right">
            <div class="dtb-avatar" style="background:#10b981">${user.initials || '??'}</div>
            <button class="btn btn-ghost btn-sm" onclick="OS.logout()">← Logout</button>
          </div>
        </div>

        <!-- Content -->
        <div style="max-width:760px;margin:0 auto;padding:32px 20px 80px">

          <!-- Status banner -->
          <div id="kycStatusBanner" style="background:linear-gradient(135deg,#1e3a5f,#0f2744);border-radius:16px;padding:28px;color:#fff;margin-bottom:28px">
            <div style="display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap">
              <div style="font-size:40px;flex-shrink:0">🛵</div>
              <div style="flex:1">
                <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;margin-bottom:6px">
                  Almost there, ${user.firstName || 'Rider'}!
                </div>
                <div style="font-size:13px;color:rgba(255,255,255,.75);line-height:1.7;max-width:500px">
                  Upload your 5 verification documents below. Once you submit, our team will review within 
                  <strong style="color:#fff">24–48 hours</strong>. You'll receive an SMS when approved.
                </div>
                <div style="display:flex;gap:16px;margin-top:16px;flex-wrap:wrap">
                  <div style="text-align:center">
                    <div style="font-size:22px;font-weight:800" id="docsCount">0/5</div>
                    <div style="font-size:11px;color:rgba(255,255,255,.6)">Uploaded</div>
                  </div>
                  <div style="text-align:center">
                    <div style="font-size:22px;font-weight:800">24–48h</div>
                    <div style="font-size:11px;color:rgba(255,255,255,.6)">Review time</div>
                  </div>
                  <div style="text-align:center">
                    <div style="font-size:22px;font-weight:800">Free</div>
                    <div style="font-size:11px;color:rgba(255,255,255,.6)">Verification cost</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Progress tracker -->
          <div style="display:flex;align-items:center;margin-bottom:28px;gap:0">
            ${['Account Created','Documents Uploaded','Admin Review','Account Active'].map((step,i) => `
            <div style="flex:1;text-align:center;position:relative">
              <div style="width:32px;height:32px;border-radius:50%;border:2.5px solid ${i===0?'var(--success)':i===1?'var(--warning)':'var(--border)'};background:${i===0?'var(--success)':i===1?'rgba(245,158,11,.1)':'transparent'};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:${i===0?'#fff':i===1?'var(--warning)':'var(--text3)'};margin:0 auto 8px">
                ${i===0?'✓':i+1}
              </div>
              <div style="font-size:11px;font-weight:700;color:${i===0?'var(--success)':i===1?'var(--warning)':'var(--text3)'}">${step}</div>
              ${i<3?`<div style="position:absolute;top:15px;left:calc(50% + 16px);right:calc(-50% + 16px);height:2px;background:${i===0?'var(--success)':'var(--border)'}"></div>`:''}
            </div>`).join('')}
          </div>

          <!-- Document upload cards -->
          <div style="display:flex;flex-direction:column;gap:14px;margin-bottom:28px">
            ${DOCS.map(doc => `
            <div class="dash-card" id="kycCard-${doc.key}">
              <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
                <div style="font-size:28px;flex-shrink:0">${doc.icon}</div>
                <div style="flex:1;min-width:0">
                  <div style="font-size:14px;font-weight:700;margin-bottom:2px">${doc.label}</div>
                  <div style="font-size:12px;color:var(--text2)">${doc.hint}</div>
                  <div style="font-size:11px;color:var(--text3);margin-top:3px">Accepted: JPG, PNG, PDF · Max 5MB</div>
                </div>
                <div style="flex-shrink:0;text-align:right">
                  <div class="kyc-status-pill" id="kycStatus-${doc.key}">
                    <span class="badge badge-gray">Not uploaded</span>
                  </div>
                  <input type="file" id="kycFile-${doc.key}"
                    accept="image/jpeg,image/png,application/pdf"
                    style="display:none"
                    onchange="kycUploadFile('${doc.key}', this)">
                  <button class="btn btn-ghost btn-sm kyc-upload-btn" style="margin-top:8px"
                    id="kycBtn-${doc.key}"
                    onclick="document.getElementById('kycFile-${doc.key}').click()">
                    📂 Choose File
                  </button>
                </div>
              </div>
              <!-- Upload progress bar (hidden until upload starts) -->
              <div id="kycProgress-${doc.key}" style="display:none;margin-top:12px">
                <div style="background:var(--border);border-radius:4px;height:6px;overflow:hidden">
                  <div class="kyc-prog-fill" style="width:0%;height:6px;background:var(--red);border-radius:4px;transition:width .3s"></div>
                </div>
                <div style="font-size:11px;color:var(--text2);margin-top:4px" id="kycProgLabel-${doc.key}">Uploading…</div>
              </div>
            </div>`).join('')}
          </div>

          <!-- Submit all button -->
          <div id="kycSubmitSection" style="display:none;text-align:center">
            <div style="background:rgba(16,185,129,.06);border:1px solid rgba(16,185,129,.2);border-radius:12px;padding:16px;margin-bottom:16px;font-size:13px;color:#065f46;line-height:1.7">
              ✅ All 5 documents uploaded! Click below to submit for review. Our team will contact you within 24–48 hours.
            </div>
            <button class="btn btn-primary" style="font-size:15px;padding:14px 40px;background:var(--success);border-color:var(--success)"
              onclick="kycSubmitAll()">
              Submit for Review →
            </button>
          </div>

          <!-- Pending review state (shown after submission) -->
          <div id="kycReviewPending" style="display:none;text-align:center;padding:20px">
            <div style="font-size:48px;margin-bottom:16px">⏳</div>
            <div style="font-family:'Syne',sans-serif;font-size:18px;font-weight:800;margin-bottom:8px">Documents submitted!</div>
            <div style="font-size:13px;color:var(--text2);line-height:1.7;margin-bottom:20px">
              Our team is reviewing your documents. You will receive an SMS notification 
              when your account is approved. Average review time: <strong>24–48 hours</strong>.
            </div>
            <button class="btn btn-ghost" onclick="kycCheckStatus()">🔄 Check Status</button>
          </div>

          <!-- Info block -->
          <div style="background:var(--white);border:1.5px solid var(--border);border-radius:12px;padding:20px;margin-top:20px">
            <div style="font-size:13px;font-weight:700;margin-bottom:12px">ℹ️ Why do we need these documents?</div>
            <div style="font-size:13px;color:var(--text2);line-height:1.8">
              OffScape verifies every rider to protect customers and merchants on the platform.
              Your NIN confirms your identity, your licence confirms you can legally operate a vehicle,
              and your guarantor gives our users confidence that there is social accountability
              behind every delivery. <strong>This information is kept strictly confidential</strong> and
              only accessed by admin staff during verification and disputes.
            </div>
          </div>

        </div>
      </div>`;

    let uploadedCount = 0;

    // ── File selected → upload ──
    window.kycUploadFile = async function(docKey, input) {
      const file = input.files[0];
      if (!file) return;

      // File size check (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        showToast('File too large. Maximum size is 5MB.', 'error'); return;
      }

      const btn      = document.getElementById(`kycBtn-${docKey}`);
      const statusEl = document.getElementById(`kycStatus-${docKey}`);
      const progEl   = document.getElementById(`kycProgress-${docKey}`);
      const progLabel= document.getElementById(`kycProgLabel-${docKey}`);
      const card     = document.getElementById(`kycCard-${docKey}`);
      const fill     = progEl?.querySelector('.kyc-prog-fill');

      // Uploading state
      if (btn) { btn.disabled = true; btn.textContent = '⏳ Uploading...'; }
      if (progEl) progEl.style.display = 'block';
      if (fill)  { fill.style.width = '10%'; }

      // Simulate progress ticks while real upload happens
      let prog = 10;
      const tick = setInterval(() => {
        prog = Math.min(prog + 15, 85);
        if (fill) fill.style.width = prog + '%';
      }, 300);

      try {
        await Riders.uploadKycDoc(docKey, file);
        clearInterval(tick);
        if (fill) fill.style.width = '100%';
        if (progLabel) progLabel.textContent = 'Uploaded ✓';

        // Update card state
        if (statusEl) statusEl.innerHTML = '<span class="badge badge-green">✓ Uploaded</span>';
        if (card) { card.style.borderColor = 'rgba(16,185,129,.4)'; card.style.background = 'rgba(16,185,129,.03)'; }
        if (btn) { btn.textContent = '✏️ Replace'; btn.disabled = false; }

        uploadState[docKey].status = 'done';
        uploadedCount++;
        document.getElementById('docsCount').textContent = `${uploadedCount}/5`;

        // Show submit button when all 5 are done
        if (uploadedCount === DOCS.length) {
          document.getElementById('kycSubmitSection').style.display = 'block';
          document.getElementById('kycSubmitSection').scrollIntoView({ behavior: 'smooth' });
        }

      } catch(err) {
        clearInterval(tick);
        if (fill) { fill.style.background = '#ef4444'; fill.style.width = '100%'; }
        if (progLabel) progLabel.textContent = 'Upload failed. Try again.';
        if (statusEl) statusEl.innerHTML = '<span class="badge badge-red">⚠ Failed</span>';
        if (btn) { btn.textContent = '📂 Retry'; btn.disabled = false; }
        showToast(`Upload failed: ${err.message}`, 'error');
      }
    };

    // ── Submit all for review ──
    window.kycSubmitAll = function() {
      document.getElementById('kycSubmitSection').style.display = 'none';
      document.getElementById('kycReviewPending').style.display = 'block';
      showToast('Documents submitted for review! We will SMS you when approved.', 'success', 6000);
      // Update user status locally so refresh doesn't redirect here again unexpectedly
      AuthState.updateUser({ kycSubmitted: true });
    };

    // ── Check status ──
    window.kycCheckStatus = async function() {
      try {
        const { status } = await Riders.getKycStatus();
        if (status === 'approved') {
          AuthState.updateUser({ status: 'active' });
          showToast('🎉 Your account is approved! Redirecting to dashboard...', 'success', 4000);
          setTimeout(() => OS.enterDashboard('rider'), 2000);
        } else if (status === 'rejected') {
          showToast('Your KYC was rejected. Check the reason in your SMS and resubmit.', 'error', 6000);
        } else {
          showToast('Still under review. Our team will contact you soon.', 'info');
        }
      } catch(err) {
        showToast(err.message, 'error');
      }
    };
  }
};



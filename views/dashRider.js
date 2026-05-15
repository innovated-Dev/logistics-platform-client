// ==================== RIDER DASHBOARD ====================
const LAGOS_C   = [6.4531, 3.3958];
const PICKUP_R  = [6.4545, 3.3847]; // Balogun Market
const DELIVERY_R= [6.4355, 3.4713]; // Lekki Phase 1
const RIDER_POS = [6.4531, 3.3958]; // Rider current
const ROUTE_R   = [
  [6.4539,3.3875],[6.4530,3.3920],[6.4520,3.3980],
  [6.4502,3.4050],[6.4480,3.4120],[6.4460,3.4220],
  [6.4430,3.4330],[6.4400,3.4450],[6.4370,3.4580],[6.4355,3.4713]
];
let rMaps = {}, rRouteStep = 0, rRouteTimer = null;

export const RiderDashView = {
  render(container) {
    const u = OS.currentUser || { name:'Kehinde Adeyemi', initials:'KA', color:'#10b981', role:'rider' };

    container.innerHTML = `
    <div class="dash-wrapper">
      <div class="dash-topbar">
        <div class="dtb-logo">Off<span>Scape</span></div>
        <div class="dash-nav-tabs">
          <button class="dash-nav-tab active" onclick="rPanel('dashboard',this)" data-panel="r-dashboard">🏠 Dashboard</button>
          <button class="dash-nav-tab" onclick="rPanel('jobs',this)" data-panel="r-jobs">📋 Available Jobs</button>
          <button class="dash-nav-tab" onclick="rPanel('active',this)" data-panel="r-active">🛵 Active Delivery</button>
          <button class="dash-nav-tab" onclick="rPanel('earnings',this)" data-panel="r-earnings">💰 Earnings</button>
          <button class="dash-nav-tab" onclick="rPanel('profile',this)" data-panel="r-profile">👤 My Profile</button>
        </div>
        <div class="dtb-right">
          <span class="badge badge-green"><span class="pulse-dot"></span> Online</span>
          <span class="role-badge rider">🛵 RIDER</span>
          <div class="dtb-avatar" style="background:${u.color}">${u.initials}</div>
          <button class="btn btn-ghost btn-sm" onclick="OS.logout()">← Exit</button>
        </div>
      </div>

      <div class="dash-content">

        <!-- ═══ DASHBOARD (OVERVIEW) ═══ -->
        <div id="rp-dashboard" class="dash-panel active">
          <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;margin-bottom:4px">Ready to Ride? 🛵</div>
          <div style="font-size:13px;color:var(--text2);margin-bottom:20px">
            You have <strong style="color:var(--success)">5 job requests</strong> waiting near you. Status:
            <span class="badge badge-green" style="margin-left:4px"><span class="pulse-dot"></span> Online</span>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="sv" style="color:var(--success)">₦4,850</div>
              <div class="sl">Today's Earnings</div>
              <div class="ss">After 5% platform fee</div>
            </div>
            <div class="stat-card">
              <div class="sv">8</div>
              <div class="sl">Trips Today</div>
              <div class="ss">3 more = daily bonus</div>
            </div>
            <div class="stat-card">
              <div class="sv">⭐ 4.9</div>
              <div class="sl">Your Rating</div>
              <div class="ss">340 total reviews</div>
            </div>
            <div class="stat-card">
              <div class="sv" style="color:var(--warning)">₦24,200</div>
              <div class="sl">This Month</div>
              <div class="ss">Withdraw anytime</div>
            </div>
          </div>

          <div class="g2">
            <div>
              <!-- Top Job Card -->
              <div class="card-head">Top Job Request <span class="badge badge-red" style="animation:pulse 2s infinite">NEW</span></div>
              <div class="job-card highlight" style="border-color:var(--success);margin-bottom:14px">
                <div class="job-header">
                  <div>
                    <div style="font-size:14px;font-weight:700">Fashion Items × 3</div>
                    <div class="mono" style="font-size:11px;color:var(--text2)">ORD-LAG-2849 · Just now</div>
                  </div>
                  <div style="text-align:right">
                    <div class="mono" style="font-size:22px;font-weight:700;color:var(--success)">₦2,100</div>
                    <div style="font-size:11px;color:var(--text3)">You get ₦1,995</div>
                  </div>
                </div>
                <div class="job-route">
                  <div class="route-point"><div class="route-dot"></div> Balogun Market, Lagos Island <span style="font-size:11px;color:var(--text3);margin-left:4px">(0.8km away)</span></div>
                  <div class="route-point" style="margin-left:0"><div class="route-vline"></div></div>
                  <div class="route-point"><div class="route-dot end"></div> Lekki Phase 1 <span style="font-size:11px;color:var(--text3);margin-left:4px">(14.2km total)</span></div>
                </div>
                <div class="job-meta" style="margin-bottom:14px">
                  <span class="job-meta-item">⏱ Est. 28 mins</span>
                  <span class="job-meta-item">👜 3 kg</span>
                  <span class="job-meta-item">⚡ Express</span>
                  <span class="job-meta-item" style="color:var(--red)">💳 Paystack paid</span>
                </div>
                <div style="display:flex;gap:10px">
                  <button class="btn btn-primary" style="flex:1;background:var(--success);border-color:var(--success)" onclick="acceptJob()">✓ Accept Job</button>
                  <button class="btn btn-ghost" style="flex:1" onclick="skipJob()">✗ Skip</button>
                </div>
                <div style="font-size:11px;color:var(--text3);margin-top:8px;text-align:center">
                  ℹ️ Platform deducts 5% (₦105). You receive ₦1,995 after delivery.
                </div>
              </div>

              <!-- Online Toggle -->
              <div class="dash-card" style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px">
                <div>
                  <div style="font-size:14px;font-weight:700">Available for Jobs</div>
                  <div style="font-size:12px;color:var(--text2);margin-top:2px">Toggle to go offline and stop receiving requests</div>
                </div>
                <div id="onlineToggle" onclick="toggleOnline()" style="width:52px;height:28px;background:var(--success);border-radius:50px;position:relative;cursor:pointer;transition:background 0.3s;flex-shrink:0">
                  <div id="toggleKnob" style="width:22px;height:22px;background:#fff;border-radius:50%;position:absolute;right:4px;top:3px;transition:all 0.3s;box-shadow:0 1px 4px rgba(0,0,0,0.2)"></div>
                </div>
              </div>
            </div>

            <div>
              <div class="card-head">Your Location <span class="badge badge-green"><span class="pulse-dot"></span> GPS Active</span></div>
              <div id="rDashMap" class="dash-map" style="height:280px;margin-bottom:12px"></div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:var(--bg);border-radius:8px;border:1.5px solid var(--border)">
                <div style="font-size:12px;color:var(--text2)">📍 Current location</div>
                <div style="font-size:12px;font-weight:700">Lagos Island, Lagos</div>
              </div>
              <div class="dash-card" style="margin-top:12px">
                <div class="card-head" style="margin-bottom:10px">Today's Summary</div>
                <div style="display:flex;gap:10px;flex-wrap:wrap">
                  ${[['⏱','6h 24min','Online time'],['📍','87km','Distance covered'],['⭐','4.9','Today\'s avg rating'],['💰','₦4,850','Net earned']].map(([icon,val,lbl])=>`
                  <div style="flex:1;min-width:90px;text-align:center;background:var(--bg);border-radius:8px;padding:10px;border:1.5px solid var(--border)">
                    <div style="font-size:18px;margin-bottom:3px">${icon}</div>
                    <div style="font-size:14px;font-weight:800;font-family:'Syne',sans-serif">${val}</div>
                    <div style="font-size:10px;color:var(--text3)">${lbl}</div>
                  </div>`).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ AVAILABLE JOBS ═══ -->
        <div id="rp-jobs" class="dash-panel">
          <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;margin-bottom:4px">Available Jobs</div>
          <div style="font-size:13px;color:var(--text2);margin-bottom:20px">5 delivery requests near you. Accept to lock in the job.</div>

          <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap">
            <select class="input-sel" style="width:auto"><option>All Types</option><option>Express Only</option><option>Standard</option></select>
            <select class="input-sel" style="width:auto"><option>Nearest First</option><option>Highest Pay</option><option>Shortest Distance</option></select>
          </div>

          <div style="display:flex;flex-direction:column;gap:12px">
            ${[
              {id:'ORD-LAG-2849',title:'Fashion Items × 3',from:'Balogun Market',fromDist:'0.8km',to:'Lekki Phase 1',total:'14.2km',pay:'₦2,100',net:'₦1,995',fee:'₦105',time:'28 min',weight:'3kg',speed:'⚡ Express',age:'Just now',color:'var(--success)'},
              {id:'ORD-LAG-2848',title:'Documents Envelope',from:'Marina, Lagos Island',fromDist:'1.2km',to:'Victoria Island',total:'5.4km',pay:'₦850',net:'₦808',fee:'₦42',time:'12 min',weight:'0.2kg',speed:'⚡ Express',age:'5 mins ago',color:'var(--red)'},
              {id:'ORD-LAG-2846',title:'Electronics Package',from:'Computer Village, Ikeja',fromDist:'8.4km',to:'Surulere',total:'12.8km',pay:'₦3,400',net:'₦3,230',fee:'₦170',time:'35 min',weight:'4kg',speed:'🚐 Van needed',age:'8 mins ago',color:'var(--blue)'},
              {id:'ORD-IBD-0420',title:'Grocery Bag',from:'Bodija Market, Ibadan',fromDist:'2.1km',to:'UI Road, Ibadan',total:'6.8km',pay:'₦700',net:'₦665',fee:'₦35',time:'18 min',weight:'2.5kg',speed:'📦 Standard',age:'12 mins ago',color:'var(--warning)'},
              {id:'ORD-LAG-2843',title:'Clothes Bundle × 5',from:'Balogun Market',fromDist:'0.9km',to:'Magodo Estate',total:'18.4km',pay:'₦2,800',net:'₦2,660',fee:'₦140',time:'42 min',weight:'5kg',speed:'⚡ Express',age:'15 mins ago',color:'var(--success)'},
            ].map((j,i)=>`
            <div class="job-card${i===0?' highlight':''}" id="job-${j.id}" style="${i===0?'border-color:var(--success)':''}">
              <div class="job-header">
                <div>
                  <div style="font-size:14px;font-weight:700">${j.title}</div>
                  <div class="mono" style="font-size:11px;color:var(--text2)">${j.id} · ${j.age}</div>
                </div>
                <div style="text-align:right">
                  <div class="mono" style="font-size:18px;font-weight:700;color:${j.color}">${j.pay}</div>
                  <div style="font-size:10px;color:var(--text3)">You get ${j.net}</div>
                </div>
              </div>
              <div class="job-route">
                <div class="route-point"><div class="route-dot"></div>${j.from} <span style="font-size:11px;color:var(--text3)">(${j.fromDist})</span></div>
                <div class="route-point" style="margin-left:0"><div class="route-vline"></div></div>
                <div class="route-point"><div class="route-dot end"></div>${j.to} <span style="font-size:11px;color:var(--text3)">(${j.total} total)</span></div>
              </div>
              <div class="job-meta" style="margin-bottom:12px">
                <span class="job-meta-item">⏱ ${j.time}</span>
                <span class="job-meta-item">📦 ${j.weight}</span>
                <span class="job-meta-item">${j.speed}</span>
                <span class="job-meta-item" style="color:var(--warning)">Fee: ${j.fee}</span>
              </div>
              <div style="display:flex;gap:8px">
                <button class="btn btn-primary btn-sm" style="flex:1;background:${j.color};border-color:${j.color}" onclick="acceptJobById('${j.id}','${j.title}','${j.net}')">✓ Accept</button>
                <button class="btn btn-ghost btn-sm" style="flex:1">✗ Skip</button>
              </div>
            </div>`).join('')}
          </div>
        </div>

        <!-- ═══ ACTIVE DELIVERY ═══ -->
        <div id="rp-active" class="dash-panel">
          <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;margin-bottom:4px">Active Delivery 🛵</div>
          <div style="font-size:13px;color:var(--text2);margin-bottom:20px">Navigate to pickup, then deliver to customer</div>

          <div id="noActiveJob" style="text-align:center;padding:60px 20px">
            <div style="font-size:48px;margin-bottom:16px">📭</div>
            <div style="font-family:'Syne',sans-serif;font-size:18px;font-weight:700;margin-bottom:8px">No Active Delivery</div>
            <div style="font-size:13px;color:var(--text2);margin-bottom:20px">Accept a job from Available Jobs to start tracking here.</div>
            <button class="btn btn-primary" onclick="rPanel('jobs',document.querySelector('[data-panel=r-jobs]'))">Browse Available Jobs →</button>
          </div>

          <div id="activeJobView" style="display:none">
            <div class="g2">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;padding:14px;background:var(--white);border-radius:var(--radius);border:1.5px solid var(--border);margin-bottom:14px;flex-wrap:wrap;gap:10px">
                  <div>
                    <div class="mono" style="font-size:12px;color:var(--red);font-weight:600" id="activeOrderId">ORD-LAG-2849</div>
                    <span class="badge badge-amber" style="margin-top:6px;display:inline-flex"><span class="pulse-dot" style="margin-right:4px"></span> In Transit</span>
                  </div>
                  <div class="eta-badge"><div class="eta-time" id="rETA">--:--</div><div class="eta-lbl">To Delivery</div></div>
                </div>

                <!-- Delivery destination -->
                <div style="background:rgba(16,185,129,0.06);border:1.5px solid rgba(16,185,129,0.2);border-radius:var(--radius);padding:14px;margin-bottom:10px">
                  <div style="font-size:11px;color:var(--success);font-weight:700;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px">📦 DELIVERY DESTINATION</div>
                  <div style="font-size:15px;font-weight:700" id="activeDeliveryAddr">12 Admiralty Way, Lekki Phase 1</div>
                  <div style="font-size:12px;color:var(--text2);margin-top:4px">Recipient: <span id="activeRecipientName">—</span> · <a data-call-customer href="tel:" style="color:var(--red);font-weight:700" id="activeRecipientPhone">+234 ...</a></div>
                </div>

                <!-- Package info -->
                <div style="background:var(--bg);border:1.5px solid var(--border);border-radius:var(--radius);padding:14px;margin-bottom:14px">
                  <div style="font-size:11px;color:var(--text2);font-weight:700;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px">📦 PACKAGE</div>
                  <div style="font-size:13px" id="activePkgInfo">Fashion Items × 3 · 3kg</div>
                  <div style="font-size:12px;color:var(--red);margin-top:4px">⚡ Express Delivery</div>
                </div>

                <!-- Your earnings -->
                <div class="price-breakdown" style="margin-bottom:14px">
                  <div class="pb-row"><span class="lbl">Customer paid</span><span class="val">₦2,100</span></div>
                  <div class="pb-row"><span class="lbl">Platform deduction (5%)</span><span class="val" style="color:var(--danger)">-₦105</span></div>
                  <div class="pb-row total"><span class="lbl">YOUR EARNINGS</span><span class="val" style="color:var(--success)" id="activeEarnings">₦1,995</span></div>
                </div>

                <!-- COD OTP input (shown only for pay-on-delivery orders) -->
                <div id="codOtpSection" style="display:none;margin-bottom:12px">
                  <div style="background:rgba(245,158,11,.06);border:1px solid rgba(245,158,11,.2);border-radius:10px;padding:14px;margin-bottom:10px">
                    <div style="font-size:12px;font-weight:700;color:#92400e;margin-bottom:8px">💳 CASH ON DELIVERY — OTP Required</div>
                    <div style="font-size:12px;color:var(--text2);margin-bottom:10px">Click "I've Arrived" first. The customer will receive a 6-digit OTP by SMS. Ask them for it, then enter it below.</div>
                    <button class="btn btn-ghost btn-full" style="margin-bottom:10px" id="arrivedBtn" onclick="notifyArrival()">📍 I've Arrived at Delivery Point</button>
                    <div class="form-group" style="margin-bottom:0">
                      <label>Customer OTP (6 digits)</label>
                      <input class="form-input" type="text" id="codOtpInput" maxlength="6" placeholder="Enter OTP from customer" style="letter-spacing:6px;font-size:18px;font-weight:700;text-align:center" inputmode="numeric">
                    </div>
                  </div>
                </div>
                <!-- Action buttons -->
                <div style="display:flex;gap:8px;margin-bottom:10px">
                  <button class="btn btn-primary btn-full" style="background:var(--success);border-color:var(--success)" onclick="confirmDelivery()">✓ Confirm Delivery</button>
                </div>
                <div style="display:flex;gap:8px">
                  <a data-call-customer href="tel:" class="icon-btn" title="Call customer — works offline" style="flex:1;border-radius:8px;width:auto;height:auto;padding:10px;text-decoration:none;text-align:center">📞 Call</a>
                  <a href="sms:" data-call-customer class="icon-btn" title="SMS customer" style="flex:1;border-radius:8px;width:auto;height:auto;padding:10px;text-decoration:none;text-align:center">💬 Message</a>
                  <div class="icon-btn" title="Report issue" style="flex:1;border-radius:8px;width:auto;height:auto;padding:10px;cursor:pointer" onclick="showToast('Issue reported. Support will follow up within 15 minutes.','info')">⚠️ Issue</div>
                </div>
              </div>
              <div>
                <div class="card-head">Navigation <span class="badge badge-green"><span class="pulse-dot"></span> Live Route</span></div>
                <div id="rActiveMap" class="dash-map" style="height:380px"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ EARNINGS ═══ -->
        <div id="rp-earnings" class="dash-panel">
          <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;margin-bottom:4px">My Earnings 💰</div>
          <div style="font-size:13px;color:var(--text2);margin-bottom:20px">Your income summary and withdrawal options</div>

          <!-- COD pending debit alert (shown when rider has outstanding COD fees) -->
          <div id="codDebitAlert" style="display:none;background:rgba(239,68,68,.05);border:1.5px solid rgba(239,68,68,.2);border-radius:10px;padding:14px;margin-bottom:14px">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
              <div>
                <div style="font-size:13px;font-weight:700;color:var(--red);margin-bottom:3px">⚠️ COD Fees Outstanding</div>
                <div style="font-size:12px;color:var(--text2)">You have <strong id="codDebitAmount">₦0</strong> in uncleared cash-on-delivery fees. Settle before withdrawing.</div>
              </div>
              <button class="btn btn-sm" style="background:var(--red);color:#fff;border-color:var(--red);flex-shrink:0" onclick="settleCodDebit()">
                Pay Now →
              </button>
            </div>
          </div>

          <div class="stats-grid" style="margin-bottom:20px">
            <div class="stat-card"><div class="sv" style="color:var(--success)" id="earnToday">₦—</div><div class="sl">Today</div><div class="ss" id="earnTodayTrips">— deliveries</div></div>
            <div class="stat-card"><div class="sv" style="color:var(--success)" id="earnMonth">₦—</div><div class="sl">This Month</div><div class="ss">Tap to withdraw</div></div>
            <div class="stat-card"><div class="sv" style="color:var(--warning)" id="walletBal">₦—</div><div class="sl">Wallet Balance</div><div class="ss">Available</div></div>
            <div class="stat-card"><div class="sv" id="totalDeliveries">—</div><div class="sl">Total Deliveries</div><div class="ss">All time</div></div>
          </div>

          <div class="g2">
            <div>
              <div class="dash-card" style="margin-bottom:14px">
                <div class="card-head">Earnings This Week</div>
                <div class="mini-chart" style="height:80px">
                  ${[55,70,85,45,90,75,60].map((h,i)=>`<div class="mini-bar${i===6?' today':''}" style="height:${h}%"></div>`).join('')}
                </div>
                <div class="mini-bar-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Today</span></div>
                <div style="display:flex;gap:12px;margin-top:12px;font-size:12px">
                  <span style="color:var(--text2)">Total: <strong style="color:var(--text)">₦18,400</strong></span>
                  <span style="color:var(--success)">↑ +14% vs last week</span>
                </div>
              </div>

              <!-- Withdraw -->
              <div class="wallet-card">
                <div class="wallet-lbl">Rider Wallet Balance</div>
                <div class="wallet-bal">₦24,200.00</div>
                <div class="wallet-id">Rider ID: OS-RDR-3348-KA</div>
                <div class="wallet-actions">
                  <div class="w-btn" onclick="showWithdrawModal()">🏦 Withdraw</div>
                  <div class="w-btn" onclick="showToast('Statement downloading...','info')">📄 Statement</div>
                </div>
              </div>
              <div class="dash-card" style="margin-top:14px">
                <div class="card-head" style="margin-bottom:12px">Withdraw to Bank</div>
                <div style="display:flex;flex-direction:column;gap:10px">
                  <div class="form-group" style="margin-bottom:0"><label>Bank Account</label>
                    <select class="input-sel"><option>GTBank — 0123456789</option><option>OPay — 6034567890</option><option>+ Add New Bank</option></select></div>
                  <div class="form-group" style="margin-bottom:0"><label>Amount (₦)</label>
                    <input class="form-input" type="number" placeholder="5000" id="withdrawAmt"></div>
                  <div style="display:flex;gap:6px;flex-wrap:wrap">
                    ${['5000','10000','20000'].map(a=>`<button class="btn btn-ghost btn-sm" onclick="document.getElementById('withdrawAmt').value='${a}'">₦${parseInt(a).toLocaleString()}</button>`).join('')}
                  </div>
                  <button class="btn btn-primary btn-full" onclick="showToast('💸 Withdrawal initiated! Arrives in ~60 seconds.','success')">Withdraw Now (Instant)</button>
                </div>
              </div>
            </div>

            <div class="dash-card">
              <div class="card-head">Recent Trips</div>
              <div class="table-wrap">
                <table class="dash-table">
                  <thead><tr><th>Order</th><th>Route</th><th>Total</th><th>Fee</th><th>You Got</th><th>Date</th></tr></thead>
                  <tbody>
                    ${[
                      ['ORD-LAG-2847','Balogun → Lekki','₦1,625','₦81','₦1,544','Now'],
                      ['ORD-LAG-2841','Computer Village → Magodo','₦2,340','₦117','₦2,223','Today 11AM'],
                      ['ORD-LAG-2838','Ikeja → Victoria Island','₦3,100','₦155','₦2,945','Today 9AM'],
                      ['ORD-LAG-2831','Surulere → Lekki','₦2,800','₦140','₦2,660','Yesterday 4PM'],
                      ['ORD-IBD-0411','Dugbe → Bodija','₦900','₦45','₦855','Yesterday 2PM'],
                      ['ORD-LAG-2825','Yaba → VI','₦1,200','₦60','₦1,140','Yesterday 11AM'],
                    ].map(r=>`<tr>
                      <td><span class="mono" style="color:var(--red);font-size:11px">${r[0]}</span></td>
                      <td style="font-size:12px">${r[1]}</td>
                      <td class="mono" style="font-size:12px">${r[2]}</td>
                      <td class="mono" style="font-size:12px;color:var(--warning)">${r[3]}</td>
                      <td class="mono" style="font-size:12px;color:var(--success);font-weight:700">${r[4]}</td>
                      <td style="color:var(--text3);font-size:11px">${r[5]}</td>
                    </tr>`).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ PROFILE ═══ -->
        <div id="rp-profile" class="dash-panel">
          <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;margin-bottom:4px">Rider Profile</div>
          <div style="font-size:13px;color:var(--text2);margin-bottom:20px">Manage your account and vehicle details</div>

          <div class="g2">
            <div>
              <div class="dash-card" style="margin-bottom:14px">
                <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">
                  <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,var(--warning),#ff6b00);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#fff">${u.initials}</div>
                  <div>
                    <div style="font-size:18px;font-weight:800">${u.name}</div>
                    <span class="badge badge-green">✓ KYC Verified</span>
                    <div style="font-size:12px;color:var(--text3);margin-top:4px">Rider since March 2024</div>
                  </div>
                </div>
                <div style="display:flex;flex-direction:column;gap:10px">
                  <div class="form-group" style="margin-bottom:0"><label>Full Name</label>
                    <input class="form-input" value="${u.name}"></div>
                  <div class="form-group" style="margin-bottom:0"><label>Phone Number</label>
                    <input class="form-input" value="+234 803 456 7890"></div>
                  <div class="form-group" style="margin-bottom:0"><label>Email</label>
                    <input class="form-input" value="kehinde@email.com"></div>
                  <div class="form-group" style="margin-bottom:0"><label>City</label>
                    <select class="input-sel" id="riderCity"><option value="lagos">Lagos</option><option value="ibadan">Ibadan</option></select></div>
              <div class="form-group" style="margin-bottom:0">
                <label>Operating Zones <span style="font-weight:400;font-size:11px;color:var(--text3)">(select all zones you know well)</span></label>
                <div id="zoneSelector" style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:4px">
                  <div style="font-size:12px;color:var(--text3);grid-column:span 2;padding:6px 0">Loading zones...</div>
                </div>
                <div style="font-size:11px;color:var(--text3);margin-top:6px">You will only receive job offers in your selected zones. Choose areas you know well.</div>
              </div>
                  <button class="btn btn-primary" onclick="showToast('Profile updated!','success')">Save Changes</button>
                </div>
              </div>

              <div class="dash-card">
                <div class="card-head">Vehicle Details</div>
                <div style="display:flex;flex-direction:column;gap:10px">
                  <div class="form-group" style="margin-bottom:0"><label>Vehicle Type</label>
                    <select class="input-sel"><option selected>Motorcycle (Okada)</option><option>Tricycle (Keke)</option><option>Car</option><option>Van</option></select></div>
                  <div class="form-group" style="margin-bottom:0"><label>Vehicle Model</label>
                    <input class="form-input" value="Honda CB125"></div>
                  <div class="form-group" style="margin-bottom:0"><label>Plate Number</label>
                    <input class="form-input" value="ABC-123-DE"></div>
                  <button class="btn btn-ghost btn-full" onclick="showToast('Vehicle details updated!','success')">Update Vehicle</button>
                </div>
              </div>
            </div>

            <div>
              <div class="dash-card" style="margin-bottom:14px">
                <div class="card-head">Online Status</div>
                <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0">
                  <div>
                    <div style="font-size:14px;font-weight:600">Available for Jobs</div>
                    <div style="font-size:12px;color:var(--text2);margin-top:2px">Toggle to go offline and stop receiving new requests</div>
                  </div>
                  <div onclick="toggleOnline()" style="width:52px;height:28px;background:var(--success);border-radius:50px;position:relative;cursor:pointer">
                    <div style="width:22px;height:22px;background:#fff;border-radius:50%;position:absolute;right:4px;top:3px;box-shadow:0 1px 4px rgba(0,0,0,.2)"></div>
                  </div>
                </div>
              </div>

              <div class="dash-card" style="margin-bottom:14px">
                <div class="card-head">Verification Documents</div>
                <div style="display:flex;flex-direction:column;gap:8px;font-size:13px">
                  ${[["Driver's License",'badge-green','Verified'],["Vehicle Insurance",'badge-green','Verified'],["Guarantor Form",'badge-green','Verified'],["NIN Slip",'badge-green','Verified'],["Profile Photo",'badge-green','Verified']].map(([doc,cls,status])=>`
                  <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(226,232,240,.5)">
                    <span>${doc}</span>
                    <span class="badge ${cls}">${status}</span>
                  </div>`).join('')}
                </div>
              </div>

              <div class="dash-card">
                <div class="card-head">Performance Stats</div>
                <div style="display:flex;flex-direction:column;gap:8px;font-size:13px">
                  ${[['⭐ Rating','4.9 / 5.0'],['✅ Completion Rate','97.6%'],['⚡ On-time Rate','94.2%'],['📦 Total Deliveries','340'],['🏆 Top Rider Badge','Earned March 2025']].map(([lbl,val])=>`
                  <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(226,232,240,.5)">
                    <span style="color:var(--text2)">${lbl}</span>
                    <span style="font-weight:700">${val}</span>
                  </div>`).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div><!-- /dash-content -->

      <nav class="mobile-bottom-nav">
        <div class="mbn-inner">
          <button class="mbn-item active" onclick="rPanel('dashboard',this)" data-mpanel="r-dashboard"><span class="mbn-icon">🏠</span>Home</button>
          <button class="mbn-item" onclick="rPanel('jobs',this)" data-mpanel="r-jobs"><span class="mbn-icon">📋</span>Jobs</button>
          <button class="mbn-item" onclick="rPanel('active',this)" data-mpanel="r-active"><span class="mbn-icon">🛵</span>Active</button>
          <button class="mbn-item" onclick="rPanel('earnings',this)" data-mpanel="r-earnings"><span class="mbn-icon">💰</span>Earn</button>
          <button class="mbn-item" onclick="rPanel('profile',this)" data-mpanel="r-profile"><span class="mbn-icon">👤</span>Profile</button>
        </div>
      </nav>
    </div>`;

    // ── PANEL SWITCHER ──
    window.rPanel = function(panel, el) {
      document.querySelectorAll('.dash-panel').forEach(p => p.classList.remove('active'));
      document.getElementById('rp-' + panel)?.classList.add('active');
      document.querySelectorAll('.dash-nav-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.mbn-item').forEach(t => t.classList.remove('active'));
      if (el?.dataset?.panel)  document.querySelector(`[data-panel="${el.dataset.panel}"]`)?.classList.add('active');
      if (el?.dataset?.mpanel) document.querySelector(`[data-mpanel="${el.dataset.mpanel}"]`)?.classList.add('active');
      if (panel === 'dashboard') setTimeout(initRDashMap, 300);
      if (panel === 'active')    setTimeout(initRActiveMap, 300);
    };

    // ── ONLINE TOGGLE ──
    let isOnline = true;
    window.toggleOnline = function() {
      isOnline = !isOnline;
      const toggles = document.querySelectorAll('#onlineToggle,[onclick="toggleOnline()"]');
      toggles.forEach(t => { t.style.background = isOnline ? 'var(--success)' : 'var(--border2)'; });
      document.querySelectorAll('#toggleKnob').forEach(k => { k.style.right = isOnline ? '4px' : 'auto'; k.style.left = isOnline ? 'auto' : '4px'; });
      showToast(isOnline ? '🟢 You are now Online — receiving job requests.' : '🔴 You are now Offline — no new requests.', isOnline ? 'success' : 'info');
    };

    // ── JOB ACTIONS ──
    window.acceptJob = function() {
      showToast('🛵 Job accepted! Navigate to Balogun Market for pickup.', 'success');
      setTimeout(() => {
        document.getElementById('noActiveJob').style.display = 'none';
        document.getElementById('activeJobView').style.display = 'block';
        rPanel('active', document.querySelector('[data-panel=r-active]'));
      }, 800);
    };

    window.acceptJobById = function(id, title, net) {
      showToast(`🛵 Job accepted! Navigate to pickup point.`, 'success');
      setTimeout(() => {
        document.getElementById('noActiveJob').style.display = 'none';
        document.getElementById('activeJobView').style.display = 'block';
        document.getElementById('activeOrderId').textContent = id;
        document.getElementById('activePkgInfo').textContent = title;
        document.getElementById('activeEarnings').textContent = net;
        rPanel('active', document.querySelector('[data-panel=r-active]'));
      }, 800);
    };

    window.skipJob = function() {
      showToast('Job skipped. Next request loading...', 'info');
    };

    // ── Load real earnings from API ──
    window.loadEarnings = async function() {
      try {
        const { Wallet } = await import('../js/api.js');
        const data = await Wallet.getBalance();
        const balEl = document.getElementById('walletBal');
        if (balEl) balEl.textContent = `₦${(data.balance||0).toLocaleString()}`;

        // COD debit alert
        const debit = data.codPendingDebit || 0;
        const alert = document.getElementById('codDebitAlert');
        const debitAmt = document.getElementById('codDebitAmount');
        if (alert) alert.style.display = debit > 0 ? 'block' : 'none';
        if (debitAmt) debitAmt.textContent = `₦${debit.toLocaleString()}`;
      } catch(_) {}
    };

    // ── Settle COD debit ──
    window.settleCodDebit = async function() {
      try {
        const { Wallet } = await import('../js/api.js');
        const result = await Wallet.settleCodDebit();
        showToast(result.message || 'COD fees cleared!', 'success');
        loadEarnings();
      } catch(err) {
        showToast(err.message, 'error');
      }
    };

    // ── Load operating zones into selector ──
    window.loadZones = async function() {
      const container = document.getElementById('zoneSelector');
      if (!container) return;
      try {
        const { Zones } = await import('../api.js');
        const city  = document.getElementById('riderCity')?.value || OS.currentUser?.city || 'ibadan';
        const data  = await Zones.getAll(city);
        const zones = data.zones || [];
        const userZones = new Set((OS.currentUser?.operatingZones || []).map(z => z.toString()));

        container.innerHTML = zones.length
          ? zones.map(z => `
            <label style="display:flex;align-items:center;gap:6px;padding:7px 10px;border:1.5px solid var(--border);border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;transition:all .15s;background:${userZones.has(z._id)?'rgba(231,76,60,.05)':'var(--white)'};border-color:${userZones.has(z._id)?'var(--red)':'var(--border)'}">
              <input type="checkbox" value="${z._id}" ${userZones.has(z._id)?'checked':''} style="accent-color:var(--red)" onchange="updateZone(this,'${z.name}')">
              ${z.name}
            </label>`).join('')
          : '<div style="font-size:12px;color:var(--text3)">No zones available for this city.</div>';
      } catch(err) {
        if (container) container.innerHTML = '<div style="font-size:12px;color:var(--red)">Could not load zones. Check connection.</div>';
      }
    };

    window.updateZone = function(checkbox, zoneName) {
      const label = checkbox.closest('label');
      if (checkbox.checked) {
        if (label) { label.style.background = 'rgba(231,76,60,.05)'; label.style.borderColor = 'var(--red)'; }
        showToast(`Zone added: ${zoneName}`, 'success');
      } else {
        if (label) { label.style.background = 'var(--white)'; label.style.borderColor = 'var(--border)'; }
      }
      // TODO: call API to save zones — PATCH /api/riders/zones
    };

    // Listen for city change to reload zones
    setTimeout(() => {
      document.getElementById('riderCity')?.addEventListener('change', loadZones);
    }, 500);

    // ── Track current active order state ──
    window._activeOrderId   = null;
    window._activeIsCod     = false;
    window._activeRiderPhone= null;
    window._activeRecipPhone= null;

    window.notifyArrival = async function() {
      const btn = document.getElementById('arrivedBtn');
      if (btn) { btn.disabled = true; btn.textContent = '⏳ Notifying...'; }
      try {
        if (window._activeOrderId) {
          const { Orders } = await import('../js/api.js');
          await Orders.arrivedAtDelivery(window._activeOrderId);
        }
        showToast(`📱 OTP sent to customer's phone. Ask them for the code.`, 'success', 6000);

        if (btn) btn.textContent = '✅ Customer notified';
        const otpInput = document.getElementById('codOtpInput');
        if (otpInput) otpInput.focus();
      } catch(err) {
        showToast(err.message || 'Could not notify customer. Check your connection.', 'error');
        if (btn) { btn.disabled = false; btn.textContent = `📍 I've Arrived at Delivery Point`; }
      }
    };

    window.confirmDelivery = async function() {
      const otp = document.getElementById('codOtpInput')?.value?.trim();
      if (window._activeIsCod && !otp) {
        showToast('Please enter the OTP from the customer to confirm this cash delivery.', 'warning'); return;
      }
      if (window._activeIsCod && otp.length !== 6) {
        showToast('OTP must be 6 digits.', 'warning'); return;
      }
      try {
        if (window._activeOrderId) {
          const { Orders } = await import('../js/api.js');
          const result = await Orders.confirm(window._activeOrderId, otp || undefined);
          const earned = result.riderEarnings?.toLocaleString() || '—';
          showToast(`✅ Delivery confirmed! ₦${earned} added to your wallet.`, 'success', 6000);
        } else {
          showToast(`✅ Delivery confirmed! Earnings credited to your wallet.`, 'success');
        }
        setTimeout(() => {
          document.getElementById('activeJobView').style.display = 'none';
          document.getElementById('noActiveJob').style.display = 'block';
          window._activeOrderId = null;
          window._activeIsCod   = false;
          if (document.getElementById('codOtpInput')) document.getElementById('codOtpInput').value = '';
          document.getElementById('codOtpSection').style.display = 'none';
        }, 1500);
      } catch(err) {
        showToast(err.message || 'Confirmation failed. Please try again.', 'error');
      }
    };

    // Called when a job is accepted — stores order context and shows COD section if needed
    window._activateJob = function(orderId, isCod, riderPhone, recipPhone) {
      window._activeOrderId    = orderId;
      window._activeIsCod      = isCod;
      window._activeRiderPhone = riderPhone;
      window._activeRecipPhone = recipPhone;
      const codSection = document.getElementById('codOtpSection');
      if (codSection) codSection.style.display = isCod ? 'block' : 'none';
      // Update call links with real phone numbers
      if (riderPhone) {
        document.querySelectorAll('[data-call-rider]').forEach(el => el.href = `tel:${riderPhone}`);
      }
      if (recipPhone) {
        document.querySelectorAll('[data-call-customer]').forEach(el => el.href = `tel:${recipPhone}`);
      }
    };

    // ── ETA ──
    function updateRiderETA() {
      const now = new Date(); now.setMinutes(now.getMinutes() + 8);
      const t = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
      const el = document.getElementById('rETA'); if(el) el.textContent = t;
    }
    updateRiderETA(); setInterval(updateRiderETA, 60000);

    // ── MAPS ──
    function mkRMap(id, lat, lng, zoom) {
      if(rMaps[id]){ rMaps[id].remove(); delete rMaps[id]; }
      const el = document.getElementById(id); if(!el) return null;
      const map = L.map(id, {zoomControl:false,attributionControl:false}).setView([lat,lng],zoom);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{maxZoom:19}).addTo(map);
      rMaps[id] = map; return map;
    }
    const dotI = c => L.divIcon({className:'',html:`<div style="width:11px;height:11px;border-radius:50%;background:${c};border:2.5px solid #fff;box-shadow:0 0 0 3px ${c}44"></div>`,iconSize:[11,11],iconAnchor:[5.5,5.5]});
    const riderI = L.divIcon({className:'',html:'<div style="font-size:18px;line-height:1">🛵</div>',iconSize:[20,20],iconAnchor:[10,10]});
    const storeI = L.divIcon({className:'',html:'<div style="font-size:18px;line-height:1">📦</div>',iconSize:[20,20],iconAnchor:[10,10]});

    function initRDashMap() {
      const map = mkRMap('rDashMap', LAGOS_C[0], LAGOS_C[1], 14); if(!map) return;
      L.marker(RIDER_POS, {icon:riderI}).addTo(map).bindPopup('📍 Your Location');
      L.marker(PICKUP_R,  {icon:storeI}).addTo(map).bindPopup('📦 Nearby Pickup (0.8km)');
    }

    function initRActiveMap() {
      const map = mkRMap('rActiveMap', 6.4430, 3.4280, 13); if(!map) return;
      L.marker(PICKUP_R,   {icon:storeI}).addTo(map).bindPopup('📦 Pickup: Balogun Market');
      L.marker(DELIVERY_R, {icon:dotI('#3b82f6')}).addTo(map).bindPopup('🏁 Delivery: Lekki Phase 1');
      L.polyline([PICKUP_R,DELIVERY_R], {color:'rgba(231,76,60,.25)',weight:3,dashArray:'8,5'}).addTo(map);
      let step = 3;
      const rm = L.marker(ROUTE_R[step], {icon:riderI}).addTo(map);
      if(rRouteTimer) clearInterval(rRouteTimer);
      rRouteTimer = setInterval(() => {
        step++; if(step >= ROUTE_R.length){ clearInterval(rRouteTimer); return; }
        rm.setLatLng(ROUTE_R[step]);
      }, 2500);
    }

    setTimeout(initRDashMap, 400);
  }
};

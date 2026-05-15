// ==================== MERCHANT DASHBOARD ====================
const M_STORE   = [6.4545, 3.3847]; // Balogun Market
const M_CUST1   = [6.4355, 3.4713]; // Lekki
const M_CUST2   = [6.5244, 3.3792]; // Ikeja
const M_RIDER1  = [6.4430, 3.4200];
const M_RIDER2  = [6.4980, 3.3700];
const LAGOS_C   = [6.4531, 3.3958];
const IBD_C     = [7.3775, 3.9470];
let mMaps = {};

export const MerchantDashView = {
  render(container) {
    const u = OS.currentUser || { name:'Balogun Traders Ltd.', initials:'BT', color:'#f59e0b', role:'merchant' };

    container.innerHTML = `
    <div class="dash-wrapper">
      <div class="dash-topbar">
        <div class="dtb-logo">Off<span>Scape</span></div>
        <div class="dash-nav-tabs">
          <button class="dash-nav-tab active" onclick="mPanel('overview',this)" data-panel="m-overview">🏠 Overview</button>
          <button class="dash-nav-tab" onclick="mPanel('post',this)" data-panel="m-post">📤 Post Shipment</button>
          <button class="dash-nav-tab" onclick="mPanel('active',this)" data-panel="m-active">📡 Active Deliveries</button>
          <button class="dash-nav-tab" onclick="mPanel('history',this)" data-panel="m-history">📋 History</button>
          <button class="dash-nav-tab" onclick="mPanel('wallet',this)" data-panel="m-wallet">💳 Wallet</button>
          <button class="dash-nav-tab" onclick="mPanel('analytics',this)" data-panel="m-analytics">📊 Analytics</button>
        </div>
        <div class="dtb-right">
          <span class="role-badge merchant">🏪 MERCHANT</span>
          <div class="dtb-avatar" style="background:${u.color}">${u.initials}</div>
          <button class="btn btn-ghost btn-sm" onclick="OS.logout()">← Exit</button>
        </div>
      </div>

      <div class="dash-content">

        <!-- ═══ OVERVIEW ═══ -->
        <div id="mp-overview" class="dash-panel active">
          <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;margin-bottom:4px">Merchant Dashboard 🏪</div>
          <div style="font-size:13px;color:var(--text2);margin-bottom:20px">${u.name} · Lagos Island · Today: ${new Date().toLocaleDateString('en-NG',{weekday:'long'})}</div>
          <div class="stats-grid">
            <div class="stat-card"><div class="sv">7</div><div class="sl">Active Shipments</div><div class="ss">4 in transit</div></div>
            <div class="stat-card"><div class="sv" style="color:var(--success)">₦84,200</div><div class="sl">Revenue This Month</div><div class="ss">+12% vs last month</div></div>
            <div class="stat-card"><div class="sv">143</div><div class="sl">Deliveries Done</div><div class="ss">This month</div></div>
            <div class="stat-card"><div class="sv" style="color:var(--warning)">₦4,210</div><div class="sl">Platform Fees Paid</div><div class="ss">5% of transactions</div></div>
          </div>
          <div class="g2">
            <div>
              <div class="card-head">Active Deliveries</div>
              ${[
                {id:'ORD-LAG-2844',title:'Fashion Items × 3',from:'Balogun Market, Lagos Island',to:'Lekki Phase 1',rider:'Tunde B.',eta:'8 mins',amount:'₦2,100',status:'badge-amber',statusTxt:'In Transit'},
                {id:'ORD-LAG-2839',title:'Electronics Package',from:'Computer Village, Ikeja',to:'Surulere, Lagos',rider:'Chukwu O.',eta:'4 mins to pickup',amount:'₦3,400',status:'badge-blue',statusTxt:'Pickup Pending'},
              ].map(j=>`
              <div class="job-card" style="margin-bottom:10px">
                <div class="job-header">
                  <div>
                    <div style="font-size:14px;font-weight:700">${j.title}</div>
                    <div class="mono" style="font-size:11px;color:var(--text2)">${j.id}</div>
                  </div>
                  <span class="badge ${j.status}"><span class="pulse-dot" style="margin-right:3px"></span>${j.statusTxt}</span>
                </div>
                <div class="job-route">
                  <div class="route-point"><div class="route-dot"></div>${j.from}</div>
                  <div class="route-point" style="margin-left:0"><div class="route-vline"></div></div>
                  <div class="route-point"><div class="route-dot end"></div>${j.to}</div>
                </div>
                <div class="job-meta">
                  <span class="job-meta-item">🛵 ${j.rider}</span>
                  <span class="job-meta-item">📍 ${j.eta}</span>
                  <span class="job-meta-item" style="color:var(--success);font-weight:700">${j.amount}</span>
                </div>
              </div>`).join('')}
              <button class="btn btn-outline btn-full" onclick="mPanel('active',document.querySelector('[data-panel=m-active]'))">View All Active →</button>
            </div>
            <div>
              <div class="card-head">Live Rider Map <span class="badge badge-green"><span class="pulse-dot"></span> GPS</span></div>
              <div id="mOverviewMap" class="dash-map" style="height:280px"></div>
            </div>
          </div>
        </div>

        <!-- ═══ POST SHIPMENT ═══ -->
        <div id="mp-post" class="dash-panel">
          <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;margin-bottom:4px">Post New Shipment</div>
          <div style="font-size:13px;color:var(--text2);margin-bottom:20px">List goods for delivery. Nearby verified riders will be matched automatically.</div>
          <div class="g2">
            <div>
              <div class="dash-card">
                <div style="font-size:15px;font-weight:700;margin-bottom:14px">📦 Shipment Details</div>
                <div class="form-group"><label>Goods Description</label>
                  <input class="form-input" placeholder="e.g. 3 pairs of shoes, sizes 40-44"></div>
                <div class="g2" style="gap:10px">
                  <div class="form-group"><label>Category</label>
                    <select class="input-sel">
                      <option>Fashion & Clothes</option><option>Electronics</option>
                      <option>Food & Groceries</option><option>Documents</option>
                      <option>Building Materials</option><option>Furniture</option>
                    </select></div>
                  <div class="form-group"><label>Weight (kg)</label>
                    <input class="form-input" type="number" placeholder="3" value="3"></div>
                  <div class="form-group"><label>Quantity / Pieces</label>
                    <input class="form-input" type="number" placeholder="5" value="3"></div>
                  <div class="form-group"><label>Goods Value (₦)</label>
                    <input class="form-input" type="number" placeholder="25000"></div>
                </div>
                <div class="form-group"><label>Fragile / Handling</label>
                  <select class="input-sel"><option>Standard</option><option>Handle with Care</option><option>Fragile — Extra Careful</option><option>Temperature Sensitive</option></select></div>
              </div>
              <div class="dash-card">
                <div style="font-size:15px;font-weight:700;margin-bottom:14px">📍 Pickup & Delivery</div>
                <div class="form-group"><label>Pickup Address (Your Location)</label>
                  <input class="form-input" value="14 Balogun Street, Lagos Island"></div>
                <div class="form-group"><label>Delivery Address</label>
                  <input class="form-input" placeholder="Customer's full address"></div>
                <div class="g2" style="gap:10px">
                  <div class="form-group"><label>Customer Name</label>
                    <input class="form-input" placeholder="Full name"></div>
                  <div class="form-group"><label>Customer Phone</label>
                    <input class="form-input" placeholder="+234 ..."></div>
                </div>
                <div class="form-group"><label>Delivery Deadline</label>
                  <select class="input-sel"><option>ASAP (Express)</option><option>Same Day</option><option>Next Day</option><option>Specific Date</option></select></div>
              </div>
            </div>
            <div>
              <div class="dash-card">
                <div style="font-size:15px;font-weight:700;margin-bottom:14px">💰 Pricing & Rider</div>
                <div class="form-group"><label>Pricing Mode</label>
                  <select class="input-sel">
                    <option>Auto-match (OffScape sets price)</option>
                    <option>Set Budget — Riders bid below it</option>
                    <option>Open Bidding — Lowest bid wins</option>
                  </select></div>
                <div class="form-group"><label>Your Budget / Max Price (₦)</label>
                  <input class="form-input" type="number" placeholder="2500"></div>
                <div class="price-breakdown">
                  <div class="pb-row"><span class="lbl">Estimated delivery</span><span class="val">₦2,100</span></div>
                  <div class="pb-row"><span class="lbl">Platform fee (5%)</span><span class="val" style="color:var(--warning)">₦105</span></div>
                  <div class="pb-row total"><span class="lbl">You pay</span><span class="val">₦2,205</span></div>
                </div>
                <div class="pb-fee-note" style="margin-bottom:16px">ℹ️ Rider receives ₦2,100 directly. OffScape earns ₦105 (5%).</div>
              </div>
              <div class="dash-card">
                <div style="font-size:15px;font-weight:700;margin-bottom:14px">👥 Nearby Riders</div>
                ${[
                  {init:'KA',name:'Kehinde Adeyemi',meta:'⭐ 4.9 · 0.8km away · Bike',grad:'135deg, #f59e0b, #ff6b00'},
                  {init:'TO',name:'Taiwo Ogundimu',meta:'⭐ 4.7 · 1.2km away · Bike',grad:'135deg, #3b82f6, #7b2fff'},
                  {init:'CB',name:'Chukwuemeka B.',meta:'⭐ 4.8 · 2.1km away · Van',grad:'135deg, #ef4444, #ff8c00'},
                ].map((r,i)=>`
                <div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg);border-radius:8px;margin-bottom:8px">
                  <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(${r.grad});display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#fff;flex-shrink:0">${r.init}</div>
                  <div style="flex:1">
                    <div style="font-size:13px;font-weight:700">${r.name}</div>
                    <div style="font-size:11px;color:var(--text2)">${r.meta}</div>
                  </div>
                  <button class="btn ${i===0?'btn-primary':'btn-ghost'} btn-sm" onclick="showToast('${r.name} assigned to this shipment!','success')">Assign</button>
                </div>`).join('')}
              </div>
              <button class="btn btn-primary btn-full" onclick="showToast('📦 Shipment posted! Matching with nearest rider...','success')">Post Shipment & Match Rider →</button>
            </div>
          </div>
        </div>

        <!-- ═══ ACTIVE DELIVERIES ═══ -->
        <div id="mp-active" class="dash-panel">
          <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;margin-bottom:4px">Active Deliveries</div>
          <div style="font-size:13px;color:var(--text2);margin-bottom:20px">Track all your in-progress shipments in real time</div>
          <div class="g2">
            <div>
              ${[
                {id:'ORD-LAG-2844',title:'Fashion Items × 3',from:'Balogun Market',to:'Lekki Phase 1',rider:'Tunde Bakare',eta:'8 mins to delivery',amount:'₦2,100',time:'2:05 PM',status:'badge-amber',st:'In Transit'},
                {id:'ORD-LAG-2839',title:'Electronics Package',from:'Computer Village, Ikeja',to:'Surulere',rider:'Chukwu O.',eta:'4 mins to pickup',amount:'₦3,400',time:'1:45 PM',status:'badge-blue',st:'Pickup Pending'},
                {id:'ORD-IBD-0415',title:'Groceries Box',from:'Bodija Market, Ibadan',to:'UI Road, Ibadan',rider:'Adekunle S.',eta:'15 mins to delivery',amount:'₦900',time:'1:20 PM',status:'badge-amber',st:'In Transit'},
              ].map(j=>`
              <div class="job-card" style="margin-bottom:12px;${j.st==='In Transit'?'border-color:rgba(245,158,11,.3)':''}">
                <div class="job-header">
                  <div>
                    <div style="font-size:14px;font-weight:700">${j.title}</div>
                    <div class="mono" style="font-size:11px;color:var(--text2)">${j.id} · ${j.time}</div>
                  </div>
                  <span class="badge ${j.status}"><span class="pulse-dot" style="margin-right:3px"></span>${j.st}</span>
                </div>
                <div class="job-route">
                  <div class="route-point"><div class="route-dot"></div>${j.from}</div>
                  <div class="route-point" style="margin-left:0"><div class="route-vline"></div></div>
                  <div class="route-point"><div class="route-dot end"></div>${j.to}</div>
                </div>
                <div class="job-meta" style="margin-bottom:10px">
                  <span class="job-meta-item">🛵 ${j.rider}</span>
                  <span class="job-meta-item">📍 ${j.eta}</span>
                  <span class="job-meta-item" style="color:var(--success);font-weight:700">${j.amount}</span>
                </div>
                <div style="display:flex;gap:8px">
                  <div class="icon-btn" title="Call rider">📞</div>
                  <div class="icon-btn" title="View on map">🗺️</div>
                  <button class="btn btn-ghost btn-sm" style="margin-left:auto">Details →</button>
                </div>
              </div>`).join('')}
            </div>
            <div>
              <div class="card-head">All Riders Live <span class="badge badge-green"><span class="pulse-dot"></span> 3 Active</span></div>
              <div id="mActiveMap" class="dash-map" style="height:420px"></div>
            </div>
          </div>
        </div>

        <!-- ═══ HISTORY ═══ -->
        <div id="mp-history" class="dash-panel">
          <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;margin-bottom:4px">Delivery History</div>
          <div style="font-size:13px;color:var(--text2);margin-bottom:20px">All your past shipments and their outcomes</div>
          <div class="dash-card">
            <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap">
              <input class="form-input" placeholder="Search orders..." style="max-width:260px">
              <select class="input-sel" style="width:auto">
                <option>All Status</option><option>Delivered</option><option>In Transit</option><option>Cancelled</option>
              </select>
              <select class="input-sel" style="width:auto">
                <option>This Month</option><option>Last Month</option><option>Last 3 Months</option>
              </select>
            </div>
            <div class="table-wrap">
              <table class="dash-table">
                <thead><tr><th>Order</th><th>Route</th><th>Goods</th><th>Amount</th><th>Platform Fee</th><th>Rider</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  ${[
                    ['ORD-LAG-2844','Balogun → Lekki','Fashion ×3','₦2,100','₦105','Tunde B.','badge-amber','In Transit','Today'],
                    ['ORD-LAG-2841','Computer Village → Magodo','Electronics','₦3,200','₦160','Kehinde A.','badge-green','Delivered','Today'],
                    ['ORD-LAG-2835','Ikeja → Ajah','Clothes ×5','₦2,800','₦140','Taiwo O.','badge-green','Delivered','Yesterday'],
                    ['ORD-IBD-0412','Dugbe → Bodija','Groceries','₦900','₦45','Adekunle S.','badge-green','Delivered','2 days ago'],
                    ['ORD-LAG-2820','Surulere → VI','Documents','₦750','₦38','Emeka C.','badge-red','Cancelled','3 days ago'],
                  ].map(r=>`<tr>
                    <td><span class="mono" style="color:var(--red);font-size:11px">${r[0]}</span></td>
                    <td style="font-size:12px">${r[1]}</td>
                    <td style="font-size:12px">${r[2]}</td>
                    <td class="mono">${r[3]}</td>
                    <td class="mono" style="color:var(--warning)">${r[4]}</td>
                    <td style="font-size:12px">${r[5]}</td>
                    <td><span class="badge ${r[6]}">${r[7]}</span></td>
                    <td style="color:var(--text3);font-size:11px">${r[8]}</td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ═══ WALLET ═══ -->
        <div id="mp-wallet" class="dash-panel">
          <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;margin-bottom:4px">Business Wallet</div>
          <div style="font-size:13px;color:var(--text2);margin-bottom:20px">Manage your merchant funds and fee summary</div>
          <div class="g2">
            <div>
              <div class="wallet-card">
                <div class="wallet-lbl">Available Balance</div>
                <div class="wallet-bal">₦28,400.00</div>
                <div class="wallet-id">OffScape Merchant Escrow · OS-BIZ-7742</div>
                <div class="wallet-actions">
                  <div class="w-btn" onclick="showToast('Withdrawal to bank initiated!','success')">🏦 Withdraw</div>
                  <div class="w-btn" onclick="showToast('Bank funding opens here','info')">➕ Add Funds</div>
                  <div class="w-btn" onclick="showToast('Generating statement PDF...','info')">📊 Statement</div>
                </div>
              </div>
              <div class="dash-card">
                <div class="card-head">Monthly Fee Summary</div>
                <div style="display:flex;flex-direction:column;gap:8px;font-size:13px">
                  <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Total Transactions</span><span class="mono">₦84,200</span></div>
                  <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Platform Fees Paid (5%)</span><span class="mono" style="color:var(--warning)">₦4,210</span></div>
                  <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Cancelled Orders Refunded</span><span class="mono" style="color:var(--success)">+₦750</span></div>
                  <div style="display:flex;justify-content:space-between;border-top:1.5px solid var(--border);padding-top:8px;margin-top:4px">
                    <span style="font-weight:700">Net Revenue</span>
                    <span class="mono" style="color:var(--success);font-weight:700">₦80,740</span>
                  </div>
                </div>
              </div>
              <div class="dash-card">
                <div class="card-head">Withdraw to Bank</div>
                <div style="display:flex;flex-direction:column;gap:10px">
                  <div class="form-group" style="margin-bottom:0"><label>Bank</label>
                    <select class="input-sel"><option>First Bank</option><option>GTBank</option><option>Zenith Bank</option><option>UBA</option><option>Access Bank</option></select></div>
                  <div class="form-group" style="margin-bottom:0"><label>Account Number</label>
                    <input class="form-input" placeholder="3012345678"></div>
                  <div class="form-group" style="margin-bottom:0"><label>Amount (₦)</label>
                    <input class="form-input" type="number" placeholder="10000"></div>
                  <button class="btn btn-primary btn-full" onclick="showToast('💸 Withdrawal initiated! Arrives in ~60 seconds.','success')">Withdraw Now</button>
                </div>
              </div>
            </div>
            <div class="dash-card">
              <div class="card-head">Recent Transactions</div>
              ${[
                ['Customer Payment · ORD-2844','Today 2:05 PM','+₦2,100','var(--success)'],
                ['Platform Fee · ORD-2844','Today 2:05 PM','-₦105','var(--warning)'],
                ['Customer Payment · ORD-2841','Today 11:30 AM','+₦3,200','var(--success)'],
                ['Platform Fee · ORD-2841','Today 11:30 AM','-₦160','var(--warning)'],
                ['Customer Payment · ORD-2835','Yesterday','+₦2,800','var(--success)'],
                ['Platform Fee · ORD-2835','Yesterday','-₦140','var(--warning)'],
                ['Withdrawal to GTBank','2 days ago','-₦15,000','var(--danger)'],
              ].map(t=>`
              <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(226,232,240,.5)">
                <div><div style="font-size:13px;font-weight:600">${t[0]}</div><div style="font-size:11px;color:var(--text3)">${t[1]}</div></div>
                <span class="mono" style="color:${t[3]};font-weight:600;font-size:13px">${t[2]}</span>
              </div>`).join('')}
            </div>
          </div>
        </div>

        <!-- ═══ ANALYTICS ═══ -->
        <div id="mp-analytics" class="dash-panel">
          <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;margin-bottom:4px">Business Analytics</div>
          <div style="font-size:13px;color:var(--text2);margin-bottom:20px">Performance metrics for your logistics operations</div>
          <div class="stats-grid" style="margin-bottom:20px">
            <div class="stat-card"><div class="sv">143</div><div class="sl">Deliveries</div><div class="ss">This month</div></div>
            <div class="stat-card"><div class="sv" style="color:var(--success)">97.2%</div><div class="sl">Success Rate</div><div class="ss">Industry avg: 92%</div></div>
            <div class="stat-card"><div class="sv">28min</div><div class="sl">Avg. Delivery</div><div class="ss">Lagos intra-zone</div></div>
            <div class="stat-card"><div class="sv">⭐ 4.8</div><div class="sl">Customer Rating</div><div class="ss">Based on 143 orders</div></div>
          </div>
          <div class="g2">
            <div class="dash-card">
              <div class="card-head">Weekly Delivery Volume</div>
              <div class="mini-chart" style="height:80px">
                ${[40,60,75,55,90,80,65].map((h,i)=>`<div class="mini-bar${i===6?' today':''}" style="height:${h}%"></div>`).join('')}
              </div>
              <div class="mini-bar-labels">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Today</span>
              </div>
              <div style="display:flex;gap:12px;margin-top:14px;font-size:12px">
                <span style="color:var(--text2)">Total this week: <strong style="color:var(--text)">37 deliveries</strong></span>
                <span style="color:var(--success)">↑ +8% vs last week</span>
              </div>
            </div>
            <div class="dash-card">
              <div class="card-head">Top Delivery Routes</div>
              ${[
                ['Balogun Market → Lekki','34 orders','24%'],
                ['Computer Village → Magodo','28 orders','20%'],
                ['Ikeja → Ajah','22 orders','15%'],
                ['Dugbe, Ibadan → Bodija','18 orders','13%'],
                ['Other Routes','41 orders','28%'],
              ].map(([route,orders,pct])=>`
              <div style="padding:10px 0;border-bottom:1px solid rgba(226,232,240,.5)">
                <div style="display:flex;justify-content:space-between;margin-bottom:5px">
                  <span style="font-size:13px;font-weight:600">${route}</span>
                  <span style="font-size:12px;color:var(--text2)">${orders}</span>
                </div>
                <div style="background:var(--border);border-radius:2px;height:4px">
                  <div style="background:var(--red);height:4px;border-radius:2px;width:${pct}"></div>
                </div>
              </div>`).join('')}
            </div>
          </div>
          <div class="g2" style="margin-top:16px">
            <div class="dash-card">
              <div class="card-head">Top Riders You Use</div>
              ${[
                {init:'KA',name:'Kehinde Adeyemi',orders:28,rating:'4.9',grad:'135deg,#f59e0b,#ff6b00'},
                {init:'TO',name:'Taiwo Ogundimu',orders:22,rating:'4.7',grad:'135deg,#3b82f6,#7b2fff'},
                {init:'CB',name:'Chukwuemeka B.',orders:18,rating:'4.8',grad:'135deg,#ef4444,#ff8c00'},
              ].map(r=>`
              <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid rgba(226,232,240,.5)">
                <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(${r.grad});display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#fff;flex-shrink:0">${r.init}</div>
                <div style="flex:1">
                  <div style="font-size:13px;font-weight:700">${r.name}</div>
                  <div style="font-size:11px;color:var(--text2)">⭐ ${r.rating} · ${r.orders} deliveries for you</div>
                </div>
                <button class="btn btn-ghost btn-sm" onclick="showToast('Request sent to ${r.name}','success')">Assign</button>
              </div>`).join('')}
            </div>
            <div class="dash-card">
              <div class="card-head">Package Category Breakdown</div>
              ${[['Fashion & Clothes','48 orders','34%','var(--red)'],['Electronics','32 orders','22%','var(--blue)'],['Groceries','28 orders','20%','var(--success)'],['Documents','20 orders','14%','var(--warning)'],['Other','15 orders','10%','var(--text2)']].map(([cat,orders,pct,color])=>`
              <div style="padding:10px 0;border-bottom:1px solid rgba(226,232,240,.5)">
                <div style="display:flex;justify-content:space-between;margin-bottom:5px">
                  <span style="font-size:13px;font-weight:600">${cat}</span>
                  <span style="font-size:12px;color:var(--text2)">${orders}</span>
                </div>
                <div style="background:var(--border);border-radius:2px;height:4px">
                  <div style="background:${color};height:4px;border-radius:2px;width:${pct}"></div>
                </div>
              </div>`).join('')}
            </div>
          </div>
        </div>

      </div><!-- /dash-content -->

      <nav class="mobile-bottom-nav">
        <div class="mbn-inner">
          <button class="mbn-item active" onclick="mPanel('overview',this)" data-mpanel="m-overview"><span class="mbn-icon">🏠</span>Home</button>
          <button class="mbn-item" onclick="mPanel('post',this)" data-mpanel="m-post"><span class="mbn-icon">📤</span>Post</button>
          <button class="mbn-item" onclick="mPanel('active',this)" data-mpanel="m-active"><span class="mbn-icon">📡</span>Active</button>
          <button class="mbn-item" onclick="mPanel('wallet',this)" data-mpanel="m-wallet"><span class="mbn-icon">💳</span>Wallet</button>
          <button class="mbn-item" onclick="mPanel('analytics',this)" data-mpanel="m-analytics"><span class="mbn-icon">📊</span>Stats</button>
        </div>
      </nav>
    </div>`;

    // ── PANEL SWITCHER ──
    window.mPanel = function(panel, el) {
      document.querySelectorAll('.dash-panel').forEach(p => p.classList.remove('active'));
      document.getElementById('mp-' + panel)?.classList.add('active');
      document.querySelectorAll('.dash-nav-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.mbn-item').forEach(t => t.classList.remove('active'));
      if (el?.dataset?.panel)  document.querySelector(`[data-panel="${el.dataset.panel}"]`)?.classList.add('active');
      if (el?.dataset?.mpanel) document.querySelector(`[data-mpanel="${el.dataset.mpanel}"]`)?.classList.add('active');
      if (panel === 'overview') setTimeout(() => initMMap('mOverviewMap', 1), 300);
      if (panel === 'active')   setTimeout(() => initMMap('mActiveMap', 3), 300);
    };

    // ── MAPS ──
    function mkMMap(id, lat, lng, zoom) {
      if(mMaps[id]){ mMaps[id].remove(); delete mMaps[id]; }
      const el = document.getElementById(id); if(!el) return null;
      const map = L.map(id, {zoomControl:false,attributionControl:false}).setView([lat,lng],zoom);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{maxZoom:19}).addTo(map);
      mMaps[id] = map; return map;
    }
    const dIcon = c => L.divIcon({className:'',html:`<div style="width:11px;height:11px;border-radius:50%;background:${c};border:2.5px solid #fff;box-shadow:0 0 0 3px ${c}44"></div>`,iconSize:[11,11],iconAnchor:[5.5,5.5]});
    const bikeI = L.divIcon({className:'',html:'<div style="font-size:17px;line-height:1">🛵</div>',iconSize:[18,18],iconAnchor:[9,9]});
    const storeI= L.divIcon({className:'',html:'<div style="font-size:17px;line-height:1">🏪</div>',iconSize:[18,18],iconAnchor:[9,9]});

    function initMMap(mapId, riderCount) {
      const map = mkMMap(mapId, 6.4531, 3.3958, 12); if(!map) return;
      L.marker(M_STORE, {icon:storeI}).addTo(map).bindPopup('🏪 Your Store');
      L.marker(M_CUST1, {icon:dIcon('#3b82f6')}).addTo(map).bindPopup('👤 Customer 1 (Lekki)');
      if(riderCount >= 1) L.marker(M_RIDER1,{icon:bikeI}).addTo(map).bindPopup('🛵 Tunde B. — In Transit');
      if(riderCount >= 3){
        L.marker(M_CUST2, {icon:dIcon('#10b981')}).addTo(map).bindPopup('👤 Customer 2 (Ikeja)');
        L.marker(M_RIDER2,{icon:bikeI}).addTo(map).bindPopup('🛵 Chukwu O. — Pickup Pending');
      }
      L.polyline([M_STORE,M_CUST1],{color:'rgba(231,76,60,.3)',weight:2,dashArray:'6,4'}).addTo(map);
    }

    // Init maps
    setTimeout(() => initMMap('mOverviewMap', 1), 400);
  }
};

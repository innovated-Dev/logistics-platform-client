// ==================== ADMIN DASHBOARD ====================
export const AdminDashView = {
  render(container) {
    const u = OS.currentUser || { name:'Super Admin' || 'MojiBola', initials:'SA', color:'#8b5cf6', role:'admin' };

    container.innerHTML = `
    <div class="dash-wrapper" style="background:#f1f5f9">
      <div class="dash-topbar" style="background:linear-gradient(135deg,#1e1b4b,#312e81)">
        <div class="dtb-logo" style="color:#fff">Off<span style="color:#a78bfa">Scape</span> <span style="font-size:11px;font-weight:600;color:rgba(167,139,250,.6);margin-left:4px">ADMIN</span></div>
        <div class="dash-nav-tabs">
          <button class="dash-nav-tab active" onclick="aPanel('overview',this)" data-panel="a-overview">📊 Overview</button>
          <button class="dash-nav-tab" onclick="aPanel('orders',this)" data-panel="a-orders">📦 All Orders</button>
          <button class="dash-nav-tab" onclick="aPanel('users',this)" data-panel="a-users">👥 Users</button>
          <button class="dash-nav-tab" onclick="aPanel('riders',this)" data-panel="a-riders">🛵 Riders</button>
          <button class="dash-nav-tab" onclick="aPanel('finance',this)" data-panel="a-finance">💳 Finance</button>
          <button class="dash-nav-tab" onclick="aPanel('settings',this)" data-panel="a-settings">⚙️ Settings</button>
        </div>
        <div class="dtb-right">
          <span class="role-badge admin">🔐 ADMIN</span>
          <div class="dtb-avatar" style="background:#8b5cf6">${u.initials || 'SA'}</div>
          <button class="btn btn-ghost btn-sm" onclick="OS.logout()">← Exit</button>
        </div>
      </div>

      <div class="dash-content">

        <!-- ═══ OVERVIEW ═══ -->
        <div id="ap-overview" class="dash-panel active">
          <div style="font-family:'Switzer',sans-serif;font-size:20px;font-weight:800;margin-bottom:4px">Platform Overview 📊</div>
          <div style="font-size:13px;color:var(--text2);margin-bottom:20px">Live metrics across Lagos & Ibadan · Last updated just now</div>

          <!-- KPI Grid -->
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px">
            <div class="stat-card" style="border-left:4px solid var(--success)">
              <div class="sv" id="kpi-revenue" style="color:var(--success)">₦—</div>
              <div class="sl">Platform Revenue</div><div class="ss">Today</div>
            </div>
            <div class="stat-card" style="border-left:4px solid var(--blue)">
              <div class="sv" id="kpi-orders" style="color:var(--blue)">—</div>
              <div class="sl">Active Orders</div><div class="ss">Right now</div>
            </div>
            <div class="stat-card" style="border-left:4px solid var(--success)">
              <div class="sv" id="kpi-riders" style="color:var(--success)">—</div>
              <div class="sl">Riders Online</div><div class="ss">Currently</div>
            </div>
            <div class="stat-card" style="border-left:4px solid #8b5cf6">
              <div class="sv" id="kpi-fees" style="color:#8b5cf6">₦—</div>
              <div class="sl">Platform Fees</div><div class="ss">Today (5%)</div>
            </div>
          </div>

          <div class="g2" style="margin-bottom:20px">
            <!-- Live Orders Feed -->
            <div class="dash-card">
              <div class="card-head">
                Live Order Feed
                <span class="badge badge-green"><span class="pulse-dot"></span> Real-time</span>
              </div>
              <div id="liveFeed" style="display:flex;flex-direction:column;gap:8px;max-height:320px;overflow-y:auto">
                <div style="text-align:center;color:var(--text3);padding:30px;font-size:13px">Waiting for live orders…</div>
              </div>
            </div>

            <!-- City breakdown + chart -->
            <div>
              <div class="dash-card" style="margin-bottom:14px">
                <div class="card-head">Orders by City
                  <span style="font-size:11px;color:var(--text3);margin-left:auto">Today</span>
                </div>
                <div id="city-breakdown">
                  <div style="color:var(--text3);font-size:13px;text-align:center;padding:20px">Loading…</div>
                </div>
            </div>

              <!-- Platform Health -->
              <div class="dash-card">
                <div class="card-head">Platform Health</div>
                 <div id="healthPanel">
                ${[
                  ['API Status',       'Checking…', 'var(--text3)'],
                  ['Payment Gateway',  'Paystack',   'var(--success)'],
                  ['GPS Tracking',     'Live',       'var(--success)'],
                  ['SMS Service',      'Termii',     'var(--success)'],
                  ['Pending KYC',      '—',          'var(--warning)'],
                  ['Open Disputes',    '—',          'var(--warning)'],
                ].map(([label, val, color]) => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(226,232,240,.5)">
                  <span style="font-size:13px">${label}</span>
                  <span class="mono" id="health-${label.replace(/\s/g,'')}" style="font-size:12px;color:${color}">${val}</span>
                </div>`).join('')}
              </div>
            </div>
          </div>

          <!-- Recent signups -->
          <div class="dash-card">
            <div class="card-head">Recent Signups <button class="btn btn-ghost btn-sm" style="margin-left:auto">View All →</button></div>
            <div class="table-wrap">
              <table class="dash-table">
                <thead><tr><th>Name</th><th>Role</th><th>City</th><th>Signed Up</th><th>Status</th><th>Action</th></tr></thead>
                <tbody id="signups-tbody">
                  <tr><td colspan="6" style="text-align:center;color:var(--text3);padding:20px">Loading…</td>
                  </tr>                
                  </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ═══ ALL ORDERS ═══ -->
        <div id="ap-orders" class="dash-panel">
          <div style="font-family:'Switzer',sans-serif;font-size:20px;font-weight:800;margin-bottom:4px">All Orders</div>
          <div style="font-size:13px;color:var(--text2);margin-bottom:20px">Complete order management across all users and cities</div>

          <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;align-items:center">

            <input class="form-input" id="orderSearch" placeholder="Search by order ID, name, route..." style="max-width:280px" oninput="debounceLoadOrders()">

            <select class="input-sel" id="orderCity" style="width:auto" onChange="loadOrders()">
            <option>All Cities</option>
            <option>Lagos</option>
            <option>Ibadan</option>
            </select>

            <select class="input-sel" id="orderStatus" style="width:auto" onChange="loadOrders()">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="in-transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="disputed">Disputed</option>
            </select>

            <select class="input-sel" style="width:auto">
            <option>Today</option>
            <option>Last 7 Days</option>
            <option>This Month</option>
            </select>

            <button class="btn btn-primary btn-sm" onclick="exportCSV()">⬇ Export CSV</button>
          </div>


          <div class="dash-card">
            <div class="table-wrap">
              <table class="dash-table">
                <thead><tr><th>Order ID</th><th>Customer</th><th>Merchant</th><th>Rider</th><th>Route</th><th>Amount</th><th>Fee</th><th>Status</th><th>City</th><th>Actions</th></tr></thead>
                <tbody id="orders-tbody">
                     <tr>
                        <td colspan="9" style="text-align:center;color:var(--text3);padding:20px">Loading…</td
                     ></tr>
                </tbody>
              </table>
            </div>
                 <div id="orders-pagination" style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px"></div>
          </div>
        </div>

        <!-- ═══ USERS ═══ -->
        <div id="ap-users" class="dash-panel">
          <div style="font-family:'Switzer',sans-serif;font-size:20px;font-weight:800;margin-bottom:4px">User Management</div>
          <div style="font-size:13px;color:var(--text2);margin-bottom:20px">Manage all customers and merchants on the platform</div>

          <div class="stats-grid" style="margin-bottom:20px">
            <div class="stat-card"><div class="sv" id="u-total">—</div><div class="sl">Total Users</div></div>
            <div class="stat-card"><div class="sv" id="u-customers" style="color:var(--customer-color)">—</div><div class="sl">Customers</div></div>
            <div class="stat-card"><div class="sv" id="u-merchants" style="color:var(--merchant-color)">—</div><div class="sl">Merchants</div></div>
            <div class="stat-card"><div class="sv" id="u-active" style="color:var(--success)">—</div><div class="sl">Active (30d)</div></div>
          </div>

          <div class="dash-card">
             <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap">
              <input class="form-input" id="userSearch" placeholder="Search by name, email, phone…" style="max-width:280px"
                oninput="debounceLoadUsers()">
              <select class="input-sel" id="userRole" style="width:auto" onchange="loadUsers()">
                <option value="">All Roles</option><option value="customer">Customers</option><option value="merchant">Merchants</option>
              </select>
              <select class="input-sel" id="userStatus" style="width:auto" onchange="loadUsers()">
                <option value="">All Status</option><option value="active">Active</option>
                <option value="suspended">Suspended</option><option value="pending">Pending</option>
              </select>
            </div>
            <div class="table-wrap">
              <table class="dash-table">
                <thead><tr><th>User</th><th>Role</th><th>City</th><th>Orders</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody id="users-tbody">
                  <tr><td colspan="7" style="text-align:center;color:var(--text3);padding:20px">Loading…</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ═══ RIDERS ═══ -->
          <div id="ap-riders" class="dash-panel">
          <div style="font-family:'Switzer',sans-serif;font-size:20px;font-weight:800;margin-bottom:4px">Rider Management</div>
          <div style="font-size:13px;color:var(--text2);margin-bottom:20px">Verify, monitor and manage all riders</div>

          <div class="stats-grid" style="margin-bottom:20px">
            <div class="stat-card"><div class="sv" id="r-total">—</div><div class="sl">Total Riders</div></div>
            <div class="stat-card"><div class="sv" id="r-online" style="color:var(--success)">—</div><div class="sl">Online Now</div></div>
            <div class="stat-card"><div class="sv" id="r-kyc" style="color:var(--warning)">—</div><div class="sl">Pending KYC</div></div>
            <div class="stat-card"><div class="sv" id="r-suspended" style="color:var(--danger)">—</div><div class="sl">Suspended</div></div>
          </div>

          <!-- KYC Queue -->
          <div class="dash-card" style="margin-bottom:14px">
            <div class="card-head">
              🔍 KYC Verification Queue
              <span class="badge badge-amber" id="kyc-count-badge">— Pending</span>
              <button class="btn btn-ghost btn-sm" style="margin-left:auto" onclick="loadKycQueue()">↻ Refresh</button>
            </div>
            <div class="table-wrap">
              <table class="dash-table">
                <thead><tr><th>Rider</th><th>City</th><th>Vehicle</th><th>NIN</th><th>License</th><th>Insurance</th><th>Applied</th><th>Actions</th></tr></thead>
                <tbody id="kyc-tbody">
                  <tr><td colspan="8" style="text-align:center;color:var(--text3);padding:20px">Loading…</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Active Riders -->
          <div class="dash-card">
            <div class="card-head">
              Active Riders
              <span class="badge badge-green"><span class="pulse-dot"></span> <span id="r-online-badge">—</span> Online</span>
              <button class="btn btn-ghost btn-sm" style="margin-left:auto" onclick="loadActiveRiders()">↻ Refresh</button>
            </div>
            <div class="table-wrap">
              <table class="dash-table">
                <thead><tr><th>Rider</th><th>City</th><th>Rating</th><th>Today's Trips</th><th>Today's Earnings</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody id="riders-tbody">
                  <tr><td colspan="7" style="text-align:center;color:var(--text3);padding:20px">Loading…</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ═══ FINANCE ═══ -->
         <div id="ap-finance" class="dash-panel">
          <div style="font-family:'Switzer',sans-serif;font-size:20px;font-weight:800;margin-bottom:4px">Finance & Revenue</div>
          <div style="font-size:13px;color:var(--text2);margin-bottom:20px">Platform revenue, fee collection, and payout tracking</div>

          <div class="stats-grid" style="margin-bottom:20px">
            <div class="stat-card" style="border-left:4px solid var(--success)">
              <div class="sv" id="adminGMV" style="color:var(--success)">₦—</div>
              <div class="sl">Total GMV Today</div><div class="ss">Gross Merchandise Value</div>
            </div>
            <div class="stat-card" style="border-left:4px solid #8b5cf6">
              <div class="sv" id="adminPlatFee" style="color:#8b5cf6">₦—</div>
              <div class="sl">Platform Revenue</div><div class="ss">5% of GMV</div>
            </div>
            <div class="stat-card" style="border-left:4px solid var(--blue)">
              <div class="sv" id="adminRiderPayout" style="color:var(--blue)">₦—</div>
              <div class="sl">Rider Payouts</div><div class="ss">95% to riders</div>
            </div>
            <div class="stat-card" style="border-left:4px solid var(--warning)">
              <div class="sv" id="adminPending" style="color:var(--warning)">—</div>
              <div class="sl">Pending Payouts</div><div class="ss">In queue</div>
            </div>
          </div>

          <!-- Compensation Pool + Insurance Reserve -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px">
            <div class="dash-card" style="border-left:4px solid var(--red)">
              <div class="card-head">🛡️ Compensation Pool
                <span class="badge badge-gray" style="font-size:10px;margin-left:4px">Early cancel payouts</span>
              </div>
              <div style="font-family:'Switzer',sans-serif;font-size:24px;font-weight:800;color:var(--red);margin-bottom:6px" id="compPoolBal">₦—</div>
              <div style="font-size:12px;color:var(--text2);margin-bottom:12px">Riders get ₦300 from this pool when customers cancel early.</div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
                <input type="number" id="poolTopupAmt" placeholder="₦ amount" class="form-input"
                  style="width:120px;padding:7px 10px;font-size:13px">
                <button class="btn btn-primary btn-sm" onclick="topupCompPool()">Top Up Pool</button>
              </div>
            </div>
            <div class="dash-card" style="border-left:4px solid var(--blue)">
              <div class="card-head">🔒 Insurance Reserve
                <span class="badge badge-gray" style="font-size:10px;margin-left:4px">Damage/loss claims</span>
              </div>
              <div style="font-family:'Switzer',sans-serif;font-size:24px;font-weight:800;color:var(--blue);margin-bottom:6px" id="insuranceResBal">₦—</div>
              <div style="font-size:12px;color:var(--text2);margin-bottom:12px">Funded by 0.5% of declared item value on insured orders.</div>
              <button class="btn btn-ghost btn-sm btn-full"
                onclick="showToast('Contact finance team to process claims','info')">Process Claim</button>
            </div>
          </div>

          <!-- Transaction Ledger -->
          <div class="dash-card">
            <div class="card-head">Transaction Ledger
              <button class="btn btn-ghost btn-sm" style="margin-left:auto" onclick="loadFinance()">↻ Refresh</button>
            </div>
            <div class="table-wrap">
              <table class="dash-table">
                <thead><tr><th>Order</th><th>Customer</th><th>Rider</th><th>GMV</th><th>Platform Fee (5%)</th><th>Rider Payout</th><th>Status</th><th>City</th></tr></thead>
                <tbody id="ledger-tbody">
                  <tr><td colspan="8" style="text-align:center;color:var(--text3);padding:20px">Loading…</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ═══ SETTINGS ═══ -->
       <div id="ap-settings" class="dash-panel">
          <div style="font-family:'Switzer',sans-serif;font-size:20px;font-weight:800;margin-bottom:4px">Platform Settings</div>
          <div style="font-size:13px;color:var(--text2);margin-bottom:20px">Configure OffScape platform rules and fees</div>

          <div class="g2">
            <div>
              <div class="dash-card" style="margin-bottom:14px">
                <div class="card-head">💰 Platform Fee Settings</div>
                <div style="display:flex;flex-direction:column;gap:14px">
                  <div class="form-group" style="margin-bottom:0">
                    <label>Standard Platform Fee (%)</label>
                    <input class="form-input" id="cfg-platformFee" type="number" min="1" max="20" placeholder="Loading…">
                    <div style="font-size:11px;color:var(--text3);margin-top:4px">Riders receive (100 - fee)%.</div>
                  </div>
                  <div class="form-group" style="margin-bottom:0">
                    <label>Express Delivery Premium (%)</label>
                    <input class="form-input" id="cfg-expressPremium" type="number" min="0" max="100" placeholder="Loading…">
                  </div>
                  <div class="form-group" style="margin-bottom:0">
                    <label>Airtime Conversion Rates</label>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:6px">
                      ${['MTN','Airtel','Glo','9mobile'].map(net => `
                      <div style="display:flex;align-items:center;gap:8px;background:var(--bg);padding:8px;border-radius:6px;border:1px solid var(--border)">
                        <span style="font-size:13px;font-weight:600;min-width:55px">${net}</span>
                        <input class="form-input" id="cfg-airtime-${net}" type="number" min="50" max="95"
                          style="padding:6px 8px;font-size:12px" placeholder="—">
                        <span style="font-size:11px;color:var(--text2)">%</span>
                      </div>`).join('')}
                    </div>
                  </div>
                  <button class="btn btn-primary" onclick="saveConfig()">Save Fee Settings</button>
                </div>
              </div>

              <div class="dash-card">
                <div class="card-head">🌍 City / Zone Settings</div>
                <div id="zones-list" style="display:flex;flex-direction:column;gap:10px">
                  <div style="color:var(--text3);font-size:13px;text-align:center;padding:20px">Loading zones…</div>
                </div>
              </div>
            </div>

            <div>
              <div class="dash-card" style="margin-bottom:14px">
                <div class="card-head">🔗 Integrations</div>
                <div style="display:flex;flex-direction:column;gap:10px">
                  ${[
                    ['💳 Paystack',        'Payment gateway',   'Connected',     'var(--success)'],
                    ['🗺️ Google Maps',     'GPS & routing',     'Active',        'var(--success)'],
                    ['📱 Termii SMS',      'SMS notifications', 'Check .env',    'var(--warning)'],
                    ['🤖 Claude AI',       'Support chatbot',   'Check .env',    'var(--warning)'],
                    ['☁️ Cloudinary',      'KYC document store','Check .env',    'var(--warning)'],
                  ].map(([name, desc, status, color]) => `
                  <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:var(--bg);border-radius:8px;border:1px solid var(--border)">
                    <div>
                      <div style="font-size:13px;font-weight:700">${name}</div>
                      <div style="font-size:11px;color:var(--text2)">${desc}</div>
                    </div>
                    <span class="badge" style="background:${color}18;color:${color}">${status}</span>
                  </div>`).join('')}
                </div>
              </div>

              <div class="dash-card">
                <div class="card-head">🔔 Cancellation Rules</div>
                <div style="display:flex;flex-direction:column;gap:12px;font-size:13px">
                  <div style="padding:10px;background:var(--bg);border-radius:8px;border:1px solid var(--border)">
                    <div style="font-weight:700;margin-bottom:4px">Early Cancel (within 5 min)</div>
                    <div style="color:var(--text2)">Full refund to customer. ₦300 from compensation pool to rider.</div>
                  </div>
                  <div style="padding:10px;background:var(--bg);border-radius:8px;border:1px solid var(--border)">
                    <div style="font-weight:700;margin-bottom:4px">Late Cancel (rider en route)</div>
                    <div style="color:var(--text2)">50% fee charged to customer, paid directly to rider.</div>
                  </div>
                  <div style="padding:10px;background:var(--bg);border-radius:8px;border:1px solid var(--border)">
                    <div style="font-weight:700;margin-bottom:4px">Rider Acceptance Window</div>
                    <div style="color:var(--text2)">90 seconds. 3 nearest riders offered simultaneously.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div><!-- /dash-content -->

      <nav class="mobile-bottom-nav">
        <div class="mbn-inner">
          <button class="mbn-item active" onclick="aPanel('overview',this)" data-mpanel="a-overview"><span class="mbn-icon">📊</span>Overview</button>
          <button class="mbn-item" onclick="aPanel('orders',this)"   data-mpanel="a-orders"><span class="mbn-icon">📦</span>Orders</button>
          <button class="mbn-item" onclick="aPanel('riders',this)"   data-mpanel="a-riders"><span class="mbn-icon">🛵</span>Riders</button>
          <button class="mbn-item" onclick="aPanel('finance',this)"  data-mpanel="a-finance"><span class="mbn-icon">💳</span>Finance</button>
          <button class="mbn-item" onclick="aPanel('settings',this)" data-mpanel="a-settings"><span class="mbn-icon">⚙️</span>Settings</button>
        </div>
      </nav>
    </div>`;

    
    // ─────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────
    function statusBadge(s) {
      return { pending: 'badge-amber', accepted: 'badge-blue', 'in-transit': 'badge-amber',
               delivered: 'badge-green', cancelled: 'badge-red', disputed: 'badge-red' }[s] || 'badge-gray';
    }

    function fmt(n) { return `₦${(n || 0).toLocaleString()}`; }

    function timeAgo(dateStr) {
      const diff = Date.now() - new Date(dateStr).getTime();
      const m = Math.floor(diff / 60000);
      if (m < 1)  return 'just now';
      if (m < 60) return `${m}m ago`;
      const h = Math.floor(m / 60);
      if (h < 24) return `${h}h ago`;
      return `${Math.floor(h / 24)}d ago`;
    }

    // ─────────────────────────────────────────────
    // OVERVIEW
    // ─────────────────────────────────────────────
    async function loadOverview() {
      try {
        const { Admin } = await import('../js/api.js');
        const data = await Admin.getStats();

        document.getElementById('kpi-revenue').textContent  = fmt(data.todayGMV);
        document.getElementById('kpi-fees').textContent     = fmt(data.todayFees);
        document.getElementById('kpi-orders').textContent   = data.activeOrders ?? '—';
        document.getElementById('kpi-riders').textContent   = data.ridersOnline  ?? '—';

        // City breakdown chart
      const citySection = document.getElementById('city-breakdown');
      if (citySection && data.cityBreakdown?.length) {
        const total = data.cityBreakdown.reduce((sum, c) => sum + c.count, 0) || 1;
        const colors = ['var(--red)', 'var(--blue)', 'var(--success)', '#8b5cf6', 'var(--warning)'];
        citySection.innerHTML = data.cityBreakdown.map((c, i) => {
          const pct = Math.round((c.count / total) * 100);
          return `
          <div style="margin-bottom:12px">
            <div style="display:flex;justify-content:space-between;margin-bottom:5px">
              <span style="font-size:13px;font-weight:700">📍 ${c._id || 'Unknown'}</span>
              <span style="font-size:12px;color:var(--text2)">${c.count} orders · ${pct}%</span>
            </div>
            <div style="background:var(--border);border-radius:3px;height:6px">
              <div style="background:${colors[i % colors.length]};height:6px;border-radius:3px;width:${pct}%;transition:width .6s ease"></div>
            </div>
          </div>`;
        }).join('');
      } else if (citySection) {
        citySection.innerHTML = `<div style="color:var(--text3);font-size:13px;text-align:center;padding:20px">No orders today yet</div>`;
      }
        // Health sidebar
        const h = (id, val) => { const el = document.getElementById('health-' + id); if (el) el.textContent = val; };
        h('APIStatus',      '✓ Online');
        h('PendingKYC',     data.pendingKyc   ?? '—');
        h('OpenDisputes',   data.openDisputes ?? '—');

        // Recent signups
        const tbody = document.getElementById('signups-tbody');
        if (tbody && data.recentSignups?.length) {
          tbody.innerHTML = data.recentSignups.map(u => `
            <tr>
              <td style="font-weight:600">${u.name}</td>
              <td><span class="role-badge ${u.role}">${u.role}</span></td>
              <td>📍 ${u.city || '—'}</td>
              <td style="color:var(--text3);font-size:12px">${timeAgo(u.createdAt)}</td>
              <td><span class="badge ${u.status === 'active' ? 'badge-green' : 'badge-amber'}">${u.status}</span></td>
              <td>
                <button class="btn btn-ghost btn-sm" onclick="showToast('Profile view coming soon','info')">View</button>
                ${u.status === 'pending_kyc'
                  ? `<button class="btn btn-sm" style="background:#8b5cf6;color:#fff;border-color:#8b5cf6"
                       onclick="approveRiderKYC('${u._id}','${u.name}')">Approve</button>` : ''}
              </td>
            </tr>`).join('');
        } else if (tbody) {
          tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text3);padding:20px">No recent signups yet</td></tr>`;
        }
      } catch (e) {
        console.error('loadOverview:', e);
        showToast('Could not load overview stats', 'error');
      }
    }

    // ─────────────────────────────────────────────
    // ORDERS
    // ─────────────────────────────────────────────
    let orderDebounce;
    window.debounceLoadOrders = function () {
      clearTimeout(orderDebounce);
      orderDebounce = setTimeout(loadOrders, 400);
    };

    window.loadOrders = async function (page = 1) {
      const tbody  = document.getElementById('orders-tbody');
      if (tbody) tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:var(--text3);padding:20px">Loading…</td></tr>`;
      try {
        const { Admin } = await import('../js/api.js');
        const params = {
          page,
          search: document.getElementById('orderSearch')?.value || '',
          city:   document.getElementById('orderCity')?.value   || '',
          status: document.getElementById('orderStatus')?.value || '',
        };
        const res = await Admin.getOrders(params);
        const orders = res.orders || res;

        if (!tbody) return;
        if (!orders.length) {
          tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:var(--text3);padding:30px">No orders found</td></tr>`;
          return;
        }

       tbody.innerHTML = orders.map(o => `
        <tr>
          <td><span class="mono" style="color:var(--red);font-size:11px">
            ${o.orderRef || o._id}
          </span></td>
          <td style="font-size:12px">${o.customer?.name || o.customer?.firstName || '—'}</td>
          <td style="font-size:12px">${o.merchant?.name || '—'}</td>
          <td style="font-size:12px">${o.rider?.name    || '—'}</td>
          <td style="font-size:12px">
            ${o.pickup?.address || '…'} → ${o.delivery?.address || '…'}
          </td>
          <td class="mono" style="font-size:12px">${fmt(o.fees?.total)}</td>
          <td class="mono" style="font-size:12px;color:#8b5cf6">${fmt(o.fees?.platformFee)}</td>
          <td><span class="badge ${statusBadge(o.status)}">${o.status}</span></td>
          <td><span class="badge badge-gray">📍 ${o.city || o.pickup?.city || '—'}</span></td>
          <td>
            <div style="display:flex;gap:4px">
              <button class="btn btn-ghost btn-sm"
                onclick="viewOrderDetail('${o._id}')">View</button>
              ${o.status === 'disputed'
                ? `<button class="btn btn-sm" style="background:var(--warning);color:#fff"
                    onclick="openResolveDispute('${o._id}')">Resolve</button>` : ''}
            </div>
          </td>
        </tr>`).join('');

        // Pagination
        if (res.totalPages > 1) {
          const pg = document.getElementById('orders-pagination');
          if (pg) {
            pg.innerHTML = Array.from({ length: res.totalPages }, (_, i) => `
              <button class="btn btn-sm ${i + 1 === page ? 'btn-primary' : 'btn-ghost'}"
                onclick="loadOrders(${i + 1})">${i + 1}</button>`).join('');
          }
        }
      } catch (e) {
        console.error('loadOrders:', e);
        if (tbody) tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:var(--danger);padding:20px">${e.message}</td></tr>`;
      }
    };

    window.viewOrderDetail = function (id) {
      showToast(`Order detail modal for ${id} — coming soon`, 'info');
    };

    window.openResolveDispute = async function (orderId) {
      const resolution = prompt('Describe the resolution for this dispute:');
      if (!resolution) return;
      try {
        const { Admin } = await import('../js/api.js');
        await Admin.resolveDispute(orderId, resolution);
        showToast('Dispute resolved successfully', 'success');
        loadOrders();
      } catch (e) { showToast(e.message, 'error'); }
    };

    window.exportCSV = function () {
      showToast('CSV export — connect to backend /admin/orders?export=csv', 'info');
    };

    // ─────────────────────────────────────────────
    // USERS
    // ─────────────────────────────────────────────
    let userDebounce;
    window.debounceLoadUsers = function () {
      clearTimeout(userDebounce);
      userDebounce = setTimeout(loadUsers, 400);
    };

    window.loadUsers = async function () {
      const tbody = document.getElementById('users-tbody');
      if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:20px">Loading…</td></tr>`;
      try {
        const { Admin } = await import('../js/api.js');
        const params = {
          search: document.getElementById('userSearch')?.value  || '',
          role:   document.getElementById('userRole')?.value    || '',
          status: document.getElementById('userStatus')?.value  || '',
        };
        const res   = await Admin.getUsers(params);
        const users = res.users || res;

        // Update stat cards if counts returned
        if (res.counts) {
          document.getElementById('u-total').textContent     = res.counts.total     ?? '—';
          document.getElementById('u-customers').textContent = res.counts.customers  ?? '—';
          document.getElementById('u-merchants').textContent = res.counts.merchants  ?? '—';
          document.getElementById('u-active').textContent    = res.counts.active     ?? '—';
        }

        if (!tbody) return;
        if (!users.length) {
          tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:30px">No users found</td></tr>`;
          return;
        }

        tbody.innerHTML = users.map(u => `
          <tr>
            <td>
              <div style="font-size:13px;font-weight:700">${u.name}</div>
              <div style="font-size:11px;color:var(--text3)">${u.email}</div>
            </td>
            <td><span class="role-badge ${u.role}">${u.role}</span></td>
            <td style="font-size:12px">📍 ${u.city || '—'}</td>
            <td class="mono" style="font-size:12px">${u.orderCount ?? '—'}</td>
            <td style="color:var(--text3);font-size:12px">${timeAgo(u.createdAt)}</td>
            <td><span class="badge ${u.status === 'active' ? 'badge-green' : u.status === 'suspended' ? 'badge-red' : 'badge-amber'}">${u.status}</span></td>
            <td>
              <div style="display:flex;gap:4px">
                <button class="btn btn-ghost btn-sm" onclick="showToast('Profile view coming soon','info')">View</button>
                ${u.status === 'active'
                  ? `<button class="btn btn-sm" style="background:var(--danger);color:#fff"
                       onclick="suspendUser('${u._id}','${u.name}')">Suspend</button>`
                  : u.status === 'suspended'
                  ? `<button class="btn btn-sm" style="background:var(--success);color:#fff"
                       onclick="reactivateUser('${u._id}','${u.name}')">Reactivate</button>` : ''}
              </div>
            </td>
          </tr>`).join('');
      } catch (e) {
        console.error('loadUsers:', e);
        if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--danger);padding:20px">${e.message}</td></tr>`;
      }
    };

    window.suspendUser = async function (id, name) {
      if (!confirm(`Suspend ${name}? They will lose platform access.`)) return;
      try {
        const { Admin } = await import('../js/api.js');
        await Admin.suspendUser(id);
        showToast(`${name} suspended`, 'error');
        loadUsers();
      } catch (e) { showToast(e.message, 'error'); }
    };

    window.reactivateUser = async function (id, name) {
      if (!confirm(`Reactivate ${name}?`)) return;
      try {
        const { Admin } = await import('../js/api.js');
        await Admin.reactivateUser(id);
        showToast(`${name} reactivated`, 'success');
        loadUsers();
      } catch (e) { showToast(e.message, 'error'); }
    };

    // ─────────────────────────────────────────────
    // RIDERS — KYC QUEUE
    // ─────────────────────────────────────────────
    window.loadKycQueue = async function () {
      const tbody = document.getElementById('kyc-tbody');
      if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text3);padding:20px">Loading…</td></tr>`;
      try {
        const { Admin } = await import('../js/api.js');
        const riders = await Admin.getKycQueue();

        const badge = document.getElementById('kyc-count-badge');
        if (badge) badge.textContent = `${riders.length} Pending`;
        document.getElementById('r-kyc').textContent = riders.length;

        if (!tbody) return;
        if (!riders.length) {
          tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text3);padding:30px">✅ No pending KYC applications</td></tr>`;
          return;
        }

        tbody.innerHTML = riders.map(r => {
          const docs = r.kycDocuments || {};
          return `
          <tr>
            <td>
              <div style="font-size:13px;font-weight:700">${r.name}</div>
              <div style="font-size:11px;color:var(--text3)">${r.phone || r.email}</div>
            </td>
            <td>📍 ${r.city || '—'}</td>
            <td>🛵 ${r.vehicleType || '—'}</td>
            ${['nin', 'driversLicense', 'vehicleInsurance'].map(doc => {
              const ok = !!docs[doc];
              return `<td><span class="badge ${ok ? 'badge-green' : 'badge-red'}">${ok ? 'Submitted' : 'Missing'}</span></td>`;
            }).join('')}
            <td style="color:var(--text3);font-size:12px">${timeAgo(r.createdAt)}</td>
            <td>
              <div style="display:flex;gap:4px">
                <button class="btn btn-sm" style="background:var(--success);color:#fff;border-color:var(--success)"
                  onclick="approveRiderKYC('${r._id}','${r.name}')">✓ Approve</button>
                <button class="btn btn-sm" style="background:var(--danger);color:#fff;border-color:var(--danger)"
                  onclick="rejectRiderKYC('${r._id}','${r.name}')">✗ Reject</button>
              </div>
            </td>
          </tr>`;
        }).join('');
      } catch (e) {
        console.error('loadKycQueue:', e);
        if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--danger);padding:20px">${e.message}</td></tr>`;
      }
    };

    window.approveRiderKYC = async function (id, name) {
      if (!confirm(`Approve KYC for ${name}? They will be able to go online and accept orders.`)) return;
      try {
        const { Admin } = await import('../js/api.js');
        await Admin.approveKYC(id);
        showToast(`${name} approved and verified! ✅`, 'success');
        loadKycQueue();
        loadRiderStats();
      } catch (e) { showToast(e.message, 'error'); }
    };

    window.rejectRiderKYC = async function (id, name) {
      const reason = prompt(`Reason for rejecting ${name}'s KYC:`);
      if (!reason) return;
      try {
        const { Admin } = await import('../js/api.js');
        await Admin.rejectKYC(id, reason);
        showToast(`${name} rejected. Notification sent.`, 'error');
        loadKycQueue();
      } catch (e) { showToast(e.message, 'error'); }
    };

    // ─────────────────────────────────────────────
    // RIDERS — ACTIVE LIST + STATS
    // ─────────────────────────────────────────────
    async function loadRiderStats() {
      try {
        const { Admin } = await import('../js/api.js');
        const data = await Admin.getStats();
        document.getElementById('r-total').textContent     = data.totalRiders     ?? '—';
        document.getElementById('r-online').textContent    = data.ridersOnline    ?? '—';
        document.getElementById('r-suspended').textContent = data.suspendedRiders ?? '—';
        const ob = document.getElementById('r-online-badge');
        if (ob) ob.textContent = data.ridersOnline ?? '—';
      } catch (e) { console.error('loadRiderStats:', e); }
    }

    window.loadActiveRiders = async function () {
      const tbody = document.getElementById('riders-tbody');
      if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:20px">Loading…</td></tr>`;
      try {
        const { Admin } = await import('../js/api.js');
        const res     = await Admin.getUsers({ role: 'rider', status: 'active' });
        const riders  = res.users || res;

        if (!tbody) return;
        if (!riders.length) {
          tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:30px">No active riders found</td></tr>`;
          return;
        }

        tbody.innerHTML = riders.map(r => `
          <tr>
            <td style="font-weight:600;font-size:13px">${r.name}</td>
            <td style="font-size:12px">📍 ${r.city || '—'}</td>
            <td>${r.rating ? `⭐ ${r.rating.toFixed(1)}` : '—'}</td>
            <td class="mono" style="font-size:12px">${r.todayTrips ?? '—'}</td>
            <td class="mono" style="font-size:12px;color:var(--success)">${r.todayEarnings != null ? fmt(r.todayEarnings) : '—'}</td>
            <td>
              <span class="badge ${r.isOnline ? 'badge-green' : 'badge-gray'}">
                ${r.isOnline ? '🟢 Online' : '⚫ Offline'}
              </span>
            </td>
            <td>
              <div style="display:flex;gap:4px">
                <button class="btn btn-ghost btn-sm" onclick="showToast('Profile view coming soon','info')">View</button>
                <button class="btn btn-sm btn-danger"
                  onclick="suspendUser('${r._id}','${r.name}')">Suspend</button>
              </div>
            </td>
          </tr>`).join('');
      } catch (e) {
        console.error('loadActiveRiders:', e);
        if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--danger);padding:20px">${e.message}</td></tr>`;
      }
    };

    // ─────────────────────────────────────────────
    // FINANCE
    // ─────────────────────────────────────────────
    window.loadFinance = async function () {
      try {
        const { Admin } = await import('../js/api.js');
        const data = await Admin.getFinance();

        document.getElementById('adminGMV').textContent         = fmt(data.todayGMV);
        document.getElementById('adminPlatFee').textContent     = fmt(data.todayFees);
        document.getElementById('adminRiderPayout').textContent = fmt(data.todayRiderPayouts);
        document.getElementById('adminPending').textContent     = data.pendingPayoutsCount ?? '—';

        // Ledger
        const tbody = document.getElementById('ledger-tbody');
        const orders = data.recentOrders || [];
        if (tbody) {
          if (!orders.length) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text3);padding:30px">No transactions yet</td></tr>`;
          } else {
            tbody.innerHTML = orders.map(o => `
        <tr>
          <td><span class="mono" style="color:var(--red);font-size:11px">
            ${o.orderRef || o._id}
          </span></td>
          <td style="font-size:12px">${o.customer?.name || '—'}</td>
          <td style="font-size:12px">${o.rider?.name    || '—'}</td>
          <td class="mono">${fmt(o.fees?.total)}</td>
          <td class="mono" style="color:#8b5cf6">${fmt(o.fees?.platformFee)}</td>
          <td class="mono" style="color:var(--success)">${fmt(o.riderPayout)}</td>
          <td><span class="badge ${statusBadge(o.status)}">${o.status}</span></td>
          <td><span class="badge badge-gray">📍 ${o.city || o.pickup?.city || '—'}</span></td>
        </tr>`).join('');
          }
        }
      } catch (e) {
        console.error('loadFinance:', e);
        showToast('Could not load finance data', 'error');
      }
    };

    // ─────────────────────────────────────────────
    // COMPENSATION POOL
    // ─────────────────────────────────────────────
    async function loadPoolBalances() {
      try {
        const { Admin } = await import('../js/api.js');
        const data = await Admin.getCompensationPool();
        const comp = document.getElementById('compPoolBal');
        const ins  = document.getElementById('insuranceResBal');
        if (comp) comp.textContent = fmt(data.compensationPool);
        if (ins)  ins.textContent  = fmt(data.insuranceReserve);
      } catch (e) { console.error('loadPoolBalances:', e); }
    }

    window.topupCompPool = async function () {
      const amt = parseFloat(document.getElementById('poolTopupAmt')?.value);
      if (!amt || amt < 1) { showToast('Enter a valid amount', 'warning'); return; }
      try {
        const { Admin } = await import('../js/api.js');
        await Admin.topupPool(amt);
        showToast(`${fmt(amt)} added to compensation pool!`, 'success');
        document.getElementById('poolTopupAmt').value = '';
        loadPoolBalances();
      } catch (e) { showToast(e.message, 'error'); }
    };

    // ─────────────────────────────────────────────
    // SETTINGS — Config + Zones
    // ─────────────────────────────────────────────
    async function loadConfig() {
      try {
        const { Admin } = await import('../js/api.js');
        const { config } = await Admin.getConfig(); // ← destructure
        if (!config) return;
        const s = (id, val) => { const el = document.getElementById(id); if (el) el.value = val ?? ''; };
        s('cfg-platformFee',     config.platformFeePercent);
        s('cfg-expressPremium',  config.expressPremiumPercent);
        s('cfg-airtime-MTN',     config.airtimeRates?.mtn);
        s('cfg-airtime-Airtel',  config.airtimeRates?.airtel);
        s('cfg-airtime-Glo',     config.airtimeRates?.glo);
        s('cfg-airtime-9mobile', config.airtimeRates?.['9mobile']);
      } catch (e) { console.error('loadConfig:', e); }
  }
    window.saveConfig = async function () {
      try {
        const { Admin } = await import('../js/api.js');
        await Admin.updateConfig({
          platformFeePercent:    parseFloat(document.getElementById('cfg-platformFee')?.value),
          expressPremiumPercent: parseFloat(document.getElementById('cfg-expressPremium')?.value),
          airtimeRates: {
            mtn:     parseFloat(document.getElementById('cfg-airtime-MTN')?.value),
            airtel:  parseFloat(document.getElementById('cfg-airtime-Airtel')?.value),
            glo:     parseFloat(document.getElementById('cfg-airtime-Glo')?.value),
            '9mobile': parseFloat(document.getElementById('cfg-airtime-9mobile')?.value),
          },
        });
        showToast('Platform settings saved!', 'success');
      } catch (e) { showToast(e.message, 'error'); }
    };

   async function loadZones() {
      try {
        const { Admin } = await import('../js/api.js');
        const { zones } = await Admin.getZones(); // ← destructure
        const el = document.getElementById('zones-list');
        if (!el) return;
        if (!zones.length) {
          el.innerHTML = `<div style="color:var(--text3);font-size:13px;text-align:center;padding:16px">No zones found</div>`;
          return;
        }
        el.innerHTML = zones.map(z => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:var(--bg);border-radius:8px;border:1px solid var(--border)">
            <span style="font-size:13px;font-weight:700">📍 ${z.name}</span>
            <div style="display:flex;align-items:center;gap:8px">
              <span class="badge" style="background:var(--success)18;color:var(--success)">${z.city}</span>
              <span class="badge badge-gray">${z.isActive ? 'Active' : 'Inactive'}</span>
            </div>
          </div>`).join('');
      } catch (e) {
        const el = document.getElementById('zones-list');
        if (el) el.innerHTML = `<div style="color:var(--danger);font-size:13px;text-align:center;padding:16px">${e.message}</div>`;
      }
  }

    // ─────────────────────────────────────────────
    // LIVE FEED (Socket.IO driven)
    // ─────────────────────────────────────────────
    function pushLiveFeed(order) {
      const feed = document.getElementById('liveFeed');
      if (!feed) return;
      // Remove empty placeholder if present
      const placeholder = feed.querySelector('[data-placeholder]');
      if (placeholder) placeholder.remove();

      const el = document.createElement('div');
      el.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px;background:var(--bg);border-radius:6px;border:1px solid var(--border);animation:fadeUp .3s ease;font-size:12px';
      el.innerHTML = `
        <span class="mono" style="color:var(--red)">${order.orderCode || order._id}</span>
        <span>${order.pickup?.address || '?'} → ${order.dropoff?.address || '?'}</span>
        <span class="badge ${statusBadge(order.status)}">${order.status}</span>
        <span style="color:var(--text3)">just now</span>`;
      feed.insertBefore(el, feed.firstChild);
      if (feed.children.length > 12) feed.lastChild?.remove();
    }

    // Hook into Socket.IO if available
    if (window.OS?.socket) {
      OS.socket.on('orderUpdate', pushLiveFeed);
      OS.socket.on('orderCreated', pushLiveFeed);
    }

    // ─────────────────────────────────────────────
    // PANEL SWITCHER
    // ─────────────────────────────────────────────
    window.aPanel = function (panel, el) {
      document.querySelectorAll('.dash-panel').forEach(p => p.classList.remove('active'));
      document.getElementById('ap-' + panel)?.classList.add('active');
      document.querySelectorAll('.dash-nav-tab, .mbn-item').forEach(t => t.classList.remove('active'));
      if (el) el.classList.add('active');

      const loaders = {
        overview: loadOverview,
        orders:   () => loadOrders(1),
        users:    loadUsers,
        riders:   () => { loadRiderStats(); loadKycQueue(); loadActiveRiders(); },
        finance:  () => { loadFinance(); loadPoolBalances(); },
        settings: () => { loadConfig(); loadZones(); },
      };
      loaders[panel]?.();
    };

    // ─────────────────────────────────────────────
    // INITIAL LOAD
    // ─────────────────────────────────────────────
    loadOverview();
    loadPoolBalances();
  }
};
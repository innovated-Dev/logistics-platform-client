// ==================== CUSTOMER DASHBOARD ====================
// ZONE PATCH: Zones are now auto-resolved from address via geocoding.
// No more zone dropdowns — customers just type their address.
let cMaps = {}, cRiderMarker = null, cTrackInterval = null;

export const CustomerDashView = {
  render(container) {
    const u = OS.currentUser || { name: 'Customer', initials: 'C', color: '#3b82f6' };
    const firstName = u.name?.split(' ')[0] || u.firstName || 'there';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    container.innerHTML = `
    <div class="dash-wrapper">
      <div class="dash-topbar">
        <div class="dtb-logo">Off<span>Scape</span></div>
        <div class="dash-nav-tabs">
          <button class="dash-nav-tab active" onclick="cPanel('overview',this)" data-panel="overview">🏠 Overview</button>
          <button class="dash-nav-tab" onclick="cPanel('order',this)"    data-panel="order">📦 Place Order</button>
          <button class="dash-nav-tab" onclick="cPanel('track',this)"    data-panel="track">📡 Track</button>
          <button class="dash-nav-tab" onclick="cPanel('orders',this)"   data-panel="orders">📋 My Orders</button>
          <button class="dash-nav-tab" onclick="cPanel('wallet',this)"   data-panel="wallet">💳 Wallet</button>
          <button class="dash-nav-tab" onclick="cPanel('airtime',this)"  data-panel="airtime">📱 Airtime</button>
        </div>
        <div class="dtb-right">
          <span class="role-badge customer">🛍️ CUSTOMER</span>
          <div class="dtb-avatar" style="background:${u.color || '#3b82f6'}">${u.initials || firstName[0]}</div>
          <button class="btn btn-ghost btn-sm" onclick="OS.logout()">← Exit</button>
        </div>
      </div>

      <div class="dash-content">

        <!-- ═══ OVERVIEW ═══ -->
        <div id="cp-overview" class="dash-panel active">
          <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;margin-bottom:4px">${greeting}, ${firstName} 👋</div>
          <div style="font-size:13px;color:var(--text2);margin-bottom:20px">Here's your delivery activity.</div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="sv" id="ov-active">—</div>
              <div class="sl">Active Orders</div><div class="ss">In progress</div>
            </div>
            <div class="stat-card">
              <div class="sv" id="ov-spent" style="color:var(--red)">₦—</div>
              <div class="sl">Total Spent</div><div class="ss">This month</div>
            </div>
            <div class="stat-card">
              <div class="sv" id="ov-total">—</div>
              <div class="sl">All Deliveries</div><div class="ss">All time</div>
            </div>
            <div class="stat-card">
              <div class="sv" id="ov-wallet" style="color:var(--warning)">₦—</div>
              <div class="sl">Wallet Balance</div><div class="ss">Available</div>
            </div>
          </div>

          <div class="g2">
            <div>
              <div class="card-head">Active Delivery
                <span class="badge badge-green" id="ov-live-badge" style="display:none"><span class="pulse-dot"></span> LIVE</span>
              </div>
              <div id="ov-active-order">
                <div style="text-align:center;padding:40px 20px;background:var(--white);border-radius:var(--radius);border:1.5px dashed var(--border)">
                  <div style="font-size:36px;margin-bottom:10px">📦</div>
                  <div style="font-size:14px;font-weight:700;margin-bottom:6px">No active deliveries</div>
                  <div style="font-size:12px;color:var(--text2);margin-bottom:14px">Place an order to get started</div>
                  <button class="btn btn-primary btn-sm" onclick="cPanel('order',document.querySelector('[data-panel=order]'))">Place Order →</button>
                </div>
              </div>
            </div>

            <div>
              <div class="card-head">Quick Actions</div>
              <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px">
                <button class="btn btn-primary btn-full" onclick="cPanel('order',document.querySelector('[data-panel=order]'))">📦 Place New Order</button>
                <button class="btn btn-ghost btn-full"  onclick="cPanel('airtime',document.querySelector('[data-panel=airtime]'))">📱 Convert Airtime to Cash</button>
                <button class="btn btn-ghost btn-full"  onclick="cPanel('wallet',document.querySelector('[data-panel=wallet]'))">💳 Top Up Wallet</button>
              </div>
              <div class="card-head">Recent Orders</div>
              <div id="ov-recent-orders">
                <div style="text-align:center;color:var(--text3);font-size:13px;padding:20px">No orders yet</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ PLACE ORDER ═══ -->
        <div id="cp-order" class="dash-panel">
          <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;margin-bottom:4px">Place a New Order</div>
          <div style="font-size:13px;color:var(--text2);margin-bottom:20px">Fill in the details and get matched with a verified nearby rider.</div>

          <div class="order-progress">
            <div class="op-step active" id="ost1"><div class="op-circle">1</div><span>Details</span></div>
            <div class="op-line" id="opl1"></div>
            <div class="op-step" id="ost2"><div class="op-circle">2</div><span>Confirm</span></div>
            <div class="op-line" id="opl2"></div>
            <div class="op-step" id="ost3"><div class="op-circle">3</div><span>Pay</span></div>
            <div class="op-line" id="opl3"></div>
            <div class="op-step" id="ost4"><div class="op-circle">✓</div><span>Done</span></div>
          </div>

          <!-- Step 1: Details -->
          <div id="ostep1">
            <div class="g2">

              <!-- ── PICKUP CARD ── -->
              <div class="dash-card">
                <div style="font-size:14px;font-weight:700;margin-bottom:14px">📍 Pickup Details</div>

                <div class="form-group">
                  <label>City</label>
                  <select class="input-sel" id="pkuCity">
                    <option value="Ibadan">Ibadan</option>
                    <option value="Lagos">Lagos</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Pickup Address</label>
                  <div style="position:relative">
                    <input
                      class="form-input"
                      id="pkuAddr"
                      placeholder="e.g. 12 Bode Thomas St, Dugbe"
                      oninput="debouncedResolve('pickup')"
                      autocomplete="off"
                    >
                    <div id="pkuAddrSpinner" style="display:none;position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:12px;color:var(--text3)">⏳</div>
                  </div>
                  <div id="pkuZoneBadge" style="display:none"></div>
                </div>

                <input type="hidden" id="pkuZone">

                <div class="form-group">
                  <label>Sender Phone</label>
                  <input class="form-input" id="pkuPhone" placeholder="+234 800 000 0000">
                </div>
              </div>

              <!-- ── DROPOFF CARD ── -->
              <div class="dash-card">
                <div style="font-size:14px;font-weight:700;margin-bottom:14px">🏁 Delivery Details</div>

                <div class="form-group">
                  <label>City</label>
                  <select class="input-sel" id="dlvCity">
                    <option value="Ibadan">Ibadan</option>
                    <option value="Lagos">Lagos</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Delivery Address</label>
                  <div style="position:relative">
                    <input
                      class="form-input"
                      id="dlvAddr"
                      placeholder="e.g. Bodija Estate, Road 5"
                      oninput="debouncedResolve('dropoff')"
                      autocomplete="off"
                    >
                    <div id="dlvAddrSpinner" style="display:none;position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:12px;color:var(--text3)">⏳</div>
                  </div>
                  <div id="dlvZoneBadge" style="display:none"></div>
                </div>

                <input type="hidden" id="dlvZone">

                <div class="form-group">
                  <label>Recipient Phone</label>
                  <input class="form-input" id="dlvPhone" placeholder="+234 800 000 0000">
                </div>
              </div>

            </div><!-- /g2 -->

            <div class="dash-card" style="margin-top:14px">
              <div style="font-size:14px;font-weight:700;margin-bottom:14px">📦 Package Info</div>
              <div class="g2">
                <div class="form-group">
                  <label>Package Category</label>
                  <select class="input-sel" id="pkgCat" onchange="calcOrderPrice()">
                    <option value="document">Documents / Small Items</option>
                    <option value="fragile">Fragile / Perishable Items</option>
                    <option value="small_parcel">Clothes / Fashion</option>
                    <option value="large_parcel">Electronics</option>
                    <option value="groceries">Groceries</option>
                    <option value="large_items">Large Items (5–15kg)</option>
                    <option value="bulk">Bulk Goods</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Delivery Speed</label>
                  <select class="input-sel" id="pkgSpeed" onchange="calcOrderPrice()">
                    <option value="express">Express (Same Day)</option>
                    <option value="standard">Standard (Next Day)</option>
                    <option value="economy">Economy (2–3 Days)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Weight (kg)</label>
                  <input class="form-input" type="number" id="pkgWt" value="1" min="0.1" oninput="calcOrderPrice()">
                </div>
                <div class="form-group">
                  <label>Item Value ₦ (for insurance)</label>
                  <input class="form-input" type="number" id="pkgVal" placeholder="0 = no insurance" oninput="calcOrderPrice()">
                </div>
              </div>
              <div class="form-group">
                <label>Special Instructions (optional)</label>
                <input class="form-input" id="pkgNotes" placeholder="Fragile, call before delivery, etc.">
              </div>
            </div>

            <div class="price-breakdown">
              <div class="pb-row"><span class="lbl">Base delivery fee</span><span class="val" id="pbBase">₦—</span></div>
              <div class="pb-row"><span class="lbl">Weight surcharge</span><span class="val" id="pbDist">₦0</span></div>
              <div class="pb-row"><span class="lbl">Platform fee (5%)</span><span class="val" id="pbFee">₦—</span></div>
              <div class="pb-row"><span class="lbl">Insurance (0.5%)</span><span class="val" id="pbIns">Not selected</span></div>
              <div class="pb-row total"><span class="lbl">Total</span><span class="val" id="pbTotal">₦—</span></div>
            </div>
            <div class="pb-fee-note">ℹ️ OffScape charges a 5% platform fee. Riders receive 95% of the delivery fee.</div>
            <button class="btn btn-primary" style="margin-top:14px" onclick="goToConfirm()">Continue to Confirm →</button>
          </div>

          <!-- Step 2: Confirm + Payment method -->
          <div id="ostep2" style="display:none">
            <div class="dash-card" style="margin-bottom:14px">
              <div style="font-size:14px;font-weight:700;margin-bottom:14px">✅ Order Summary</div>
              <div style="display:flex;flex-direction:column;gap:10px;font-size:13px" id="confirmSummary"></div>
            </div>

            <div class="dash-card">
              <div style="font-size:14px;font-weight:700;margin-bottom:12px">Payment Method</div>
              <div style="display:flex;flex-direction:column;gap:8px">
                <label style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:12px;border-radius:8px;border:2px solid var(--red);background:var(--red-light)">
                  <input type="radio" name="pm" value="paystack" checked style="accent-color:var(--red)">
                  <div>
                    <div style="font-size:13px;font-weight:700">💳 Pay with Paystack</div>
                    <div style="font-size:11px;color:var(--text2)">Card, bank transfer, USSD</div>
                  </div>
                </label>
                <label style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:12px;border-radius:8px;border:1.5px solid var(--border)" id="walletPayLabel">
                  <input type="radio" name="pm" value="wallet" style="accent-color:var(--red)">
                  <div>
                    <div style="font-size:13px;font-weight:700">💰 OffScape Wallet (<span id="walletBalPM">₦—</span>)</div>
                    <div style="font-size:11px;color:var(--text2)">Instant from wallet balance</div>
                  </div>
                </label>
                <label style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:12px;border-radius:8px;border:1.5px solid var(--border)">
                  <input type="radio" name="pm" value="cod" style="accent-color:var(--red)">
                  <div>
                    <div style="font-size:13px;font-weight:700">🤝 Pay on Delivery (Cash)</div>
                    <div style="font-size:11px;color:var(--text2)">Cash to rider · ₦100 handling fee</div>
                  </div>
                </label>
              </div>
            </div>

            <div style="display:flex;gap:10px;margin-top:14px">
              <button class="btn btn-ghost" onclick="prevOStep()">← Back</button>
              <button class="btn btn-primary" id="payNowBtn" onclick="doPlaceOrder()">Pay & Place Order →</button>
            </div>
          </div>

          <!-- Step 3: Searching for rider -->
          <div id="ostep3" style="display:none;text-align:center;padding:48px 20px">
            <div style="font-size:60px;margin-bottom:16px">🔍</div>
            <h2 style="font-family:'Syne',sans-serif;font-size:22px;margin-bottom:10px">Finding your rider…</h2>
            <p style="color:var(--text2);margin-bottom:20px">We're matching you with the 3 nearest verified riders.<br>This takes up to 90 seconds.</p>
            <div class="loader" style="margin:0 auto 20px"></div>
            <div class="mono" id="newOrderCode" style="font-size:14px;color:var(--red);margin-bottom:20px"></div>
            <button class="btn btn-ghost" onclick="cPanel('orders',document.querySelector('[data-panel=orders]'))">View My Orders →</button>
          </div>

          <!-- Step 4: Rider found -->
          <div id="ostep4" style="display:none;text-align:center;padding:48px 20px">
            <div style="font-size:60px;margin-bottom:16px">🚀</div>
            <h2 style="font-family:'Syne',sans-serif;font-size:22px;margin-bottom:10px">Rider Assigned!</h2>
            <p style="color:var(--text2);margin-bottom:10px">Your rider is heading to the pickup point.</p>
            <div class="mono" id="confirmedOrderCode" style="font-size:14px;color:var(--red);margin-bottom:20px"></div>
            <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
              <button class="btn btn-primary" onclick="goToTrack()">Track Live →</button>
              <button class="btn btn-ghost" onclick="resetOrderForm()">Place Another Order</button>
            </div>
          </div>
        </div>

        <!-- ═══ TRACK ORDER ═══ -->
        <div id="cp-track" class="dash-panel">
          <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;margin-bottom:4px">Live Order Tracking</div>
          <div style="font-size:13px;color:var(--text2);margin-bottom:20px">Real-time GPS — updates every 5 seconds</div>

          <div id="track-empty" style="text-align:center;padding:60px 20px">
            <div style="font-size:48px;margin-bottom:14px">📡</div>
            <div style="font-size:15px;font-weight:700;margin-bottom:8px">No active order to track</div>
            <div style="font-size:13px;color:var(--text2);margin-bottom:20px">Once you place an order and a rider accepts it, live tracking appears here.</div>
            <button class="btn btn-primary" onclick="cPanel('order',document.querySelector('[data-panel=order]'))">Place an Order →</button>
          </div>

          <div id="track-active" style="display:none">
            <div class="g2">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;padding:14px;background:var(--white);border-radius:var(--radius);border:1.5px solid var(--border);margin-bottom:12px;flex-wrap:wrap;gap:10px">
                  <div>
                    <div class="mono" id="track-order-code" style="font-size:12px;color:var(--red);font-weight:600">—</div>
                    <div id="track-route" style="font-size:14px;font-weight:700;margin-top:4px">—</div>
                    <span class="badge badge-amber" id="track-status-badge" style="margin-top:6px;display:inline-flex">
                      <span class="pulse-dot" style="margin-right:4px"></span> —
                    </span>
                  </div>
                  <div class="eta-badge">
                    <div class="eta-time" id="track-eta">--:--</div>
                    <div class="eta-lbl">Estimated Arrival</div>
                  </div>
                </div>

                <div id="cancelTimer" style="background:var(--bg);border:1.5px solid var(--border);border-radius:8px;padding:12px;margin-bottom:12px;font-size:13px;display:none">
                  <div style="display:flex;justify-content:space-between;align-items:center">
                    <div>
                      <div style="font-weight:700">Free cancellation window</div>
                      <div style="font-size:11px;color:var(--text2)">Cancel free within 5 minutes of placing</div>
                    </div>
                    <div id="cancelCountdown" style="font-family:'DM Mono',monospace;font-size:18px;font-weight:800;color:var(--success)">5:00</div>
                  </div>
                  <button id="cancelOrderBtn" class="btn btn-ghost btn-full btn-sm" style="margin-top:10px;color:var(--danger);border-color:var(--danger)"
                    onclick="cancelActiveOrder()">Cancel Order</button>
                </div>

                <div id="cTrackMap" class="dash-map" style="margin-bottom:12px"></div>

                <div class="rider-card" id="track-rider-card" style="display:none">
                  <div class="rider-av" id="track-rider-av">?</div>
                  <div style="flex:1">
                    <div class="rider-name" id="track-rider-name">—</div>
                    <div class="rider-meta" id="track-rider-meta">—</div>
                  </div>
                  <div class="rider-actions">
                    <div class="icon-btn" title="Call" id="track-call-btn">📞</div>
                    <div class="icon-btn" title="Message">💬</div>
                  </div>
                </div>
              </div>

              <div>
                <div style="font-size:14px;font-weight:700;margin-bottom:14px">Delivery Timeline</div>
                <div class="timeline" id="track-timeline"></div>

                <div class="dash-card" style="margin-top:16px" id="track-pkg-info" style="display:none">
                  <div style="font-size:13px;font-weight:700;margin-bottom:10px">📦 Package Info</div>
                  <div style="font-size:13px;display:flex;flex-direction:column;gap:6px" id="track-pkg-details"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ MY ORDERS ═══ -->
        <div id="cp-orders" class="dash-panel">
          <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;margin-bottom:4px">My Orders</div>
          <div style="font-size:13px;color:var(--text2);margin-bottom:20px">Your complete delivery history</div>

          <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap">
            <select class="input-sel" id="ordersFilter" style="width:auto" onchange="loadMyOrders()">
              <option value="">All Orders</option>
              <option value="pending">Pending</option>
              <option value="in-transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button class="btn btn-ghost btn-sm" onclick="loadMyOrders()">↻ Refresh</button>
          </div>

          <div class="dash-card">
            <div class="table-wrap">
              <table class="dash-table">
                <thead><tr><th>Order ID</th><th>Route</th><th>Package</th><th>Amount</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
                <tbody id="my-orders-tbody">
                  <tr><td colspan="7" style="text-align:center;color:var(--text3);padding:30px">Loading…</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ═══ WALLET ═══ -->
        <div id="cp-wallet" class="dash-panel">
          <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;margin-bottom:4px">My Wallet</div>
          <div style="font-size:13px;color:var(--text2);margin-bottom:20px">Manage your OffScape balance</div>

          <div class="g2">
            <div>
              <div class="wallet-card">
                <div class="wallet-lbl">Available Balance</div>
                <div class="wallet-bal" id="wallet-bal">₦—</div>
                <div class="wallet-id" id="wallet-id">Account: loading…</div>
                <div class="wallet-actions">
                  <div class="w-btn" onclick="cPanel('wallet',null);document.getElementById('fundSection').scrollIntoView({behavior:'smooth'})">➕ Add Money</div>
                  <div class="w-btn" onclick="openWithdraw()">🏦 Withdraw</div>
                  <div class="w-btn" onclick="cPanel('airtime',document.querySelector('[data-panel=airtime]'))">📱 Airtime</div>
                </div>
              </div>

              <div class="dash-card" id="fundSection">
                <div class="card-head">Fund Wallet via Paystack</div>
                <div style="display:flex;flex-direction:column;gap:10px">
                  <div class="form-group" style="margin-bottom:0">
                    <label>Amount (₦)</label>
                    <input class="form-input" type="number" id="fundAmt" placeholder="5000" value="5000" min="100">
                  </div>
                  <div style="display:flex;gap:8px;flex-wrap:wrap">
                    ${['1000','2000','5000','10000'].map(a =>
                      `<button class="btn btn-ghost btn-sm" onclick="document.getElementById('fundAmt').value='${a}'">₦${parseInt(a).toLocaleString()}</button>`
                    ).join('')}
                  </div>
                  <button class="btn btn-primary btn-full" onclick="initTopup()">Pay with Paystack →</button>
                </div>
              </div>
            </div>

            <div class="dash-card">
              <div class="card-head">Transaction History
                <button class="btn btn-ghost btn-sm" style="margin-left:auto" onclick="loadTransactions()">↻</button>
              </div>
              <div id="tx-list">
                <div style="text-align:center;color:var(--text3);font-size:13px;padding:30px">Loading…</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ AIRTIME TO CASH ═══ -->
        <div id="cp-airtime" class="dash-panel">
          <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;margin-bottom:4px">Airtime & Data → Cash</div>
          <div style="font-size:13px;color:var(--text2);margin-bottom:20px">Convert airtime to real money in your OffScape wallet</div>

          <div class="g2">
            <div class="a2c-box">
              <div class="a2c-head">
                <div style="font-size:15px;font-weight:700">📱 Convert Airtime</div>
                <div style="font-size:12px;color:var(--text2);margin-top:4px">Up to 78% value returned to your wallet</div>
              </div>
              <div class="a2c-body">
                <div style="font-size:11px;color:var(--text2);font-weight:700;margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px">Select Network</div>
                <div class="network-grid" id="network-grid">
                  <div class="net-btn selected" onclick="cSelNet(this,0.78,'MTN')"><div class="net-icon">🟡</div><div class="net-name">MTN</div></div>
                  <div class="net-btn" onclick="cSelNet(this,0.75,'Airtel')"><div class="net-icon">🔴</div><div class="net-name">Airtel</div></div>
                  <div class="net-btn" onclick="cSelNet(this,0.72,'Glo')"><div class="net-icon">🟢</div><div class="net-name">Glo</div></div>
                  <div class="net-btn" onclick="cSelNet(this,0.70,'9mobile')"><div class="net-icon">🟤</div><div class="net-name">9mobile</div></div>
                </div>
                <div class="a2c-rate">
                  <div class="a2c-rate-info">Current rate (<span id="netName">MTN</span>)</div>
                  <div class="a2c-rate-val" id="a2cRateDisp">₦100 → ₦78</div>
                </div>
                <div class="form-group">
                  <label>Airtime Amount (₦)</label>
                  <input class="form-input" type="number" id="a2cAmt" placeholder="500" min="100" oninput="calcA2C()">
                </div>
                <div style="text-align:center;font-size:20px;color:var(--text3);margin:8px 0">⬇️</div>
                <div class="a2c-result" id="a2cResult" style="display:none">
                  <div class="a2c-result-amt" id="a2cResultAmt">₦0</div>
                  <div class="a2c-result-lbl">You receive in OffScape Wallet</div>
                </div>
                <button class="btn btn-primary btn-full" style="margin-top:14px" onclick="submitAirtime()">Convert Now</button>
                <div style="font-size:11px;color:var(--text3);margin-top:8px;text-align:center">Cash credited to your wallet upon confirmation.</div>
              </div>
            </div>

            <div class="dash-card">
              <div class="card-head">Airtime Conversion History</div>
              <div id="airtime-history">
                <div style="text-align:center;color:var(--text3);font-size:13px;padding:30px">No conversions yet</div>
              </div>
            </div>
          </div>
        </div>

      </div><!-- /dash-content -->

      <nav class="mobile-bottom-nav">
        <div class="mbn-inner">
          <button class="mbn-item active" onclick="cPanel('overview',this)" data-mpanel="overview"><span class="mbn-icon">🏠</span>Home</button>
          <button class="mbn-item" onclick="cPanel('order',this)"   data-mpanel="order"><span class="mbn-icon">📦</span>Order</button>
          <button class="mbn-item" onclick="cPanel('track',this)"   data-mpanel="track"><span class="mbn-icon">📡</span>Track</button>
          <button class="mbn-item" onclick="cPanel('wallet',this)"  data-mpanel="wallet"><span class="mbn-icon">💳</span>Wallet</button>
          <button class="mbn-item" onclick="cPanel('airtime',this)" data-mpanel="airtime"><span class="mbn-icon">📱</span>Airtime</button>
        </div>
      </nav>
    </div>`;

    // ─────────────────────────────────────────────
    // STATE
    // ─────────────────────────────────────────────
    let _currentOrder   = null;
    let _orderFormData  = {};
    let _a2cRate        = 0.78;
    let _a2cNetwork     = 'MTN';
    let _cancelInterval = null;
    let _walletBalance  = 0;

    let _pkuZoneData = null;
    let _dlvZoneData = null;

    const fmt  = n  => `₦${(n || 0).toLocaleString()}`;
    const setT = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };

    // ─────────────────────────────────────────────
    // PANEL SWITCHER
    // ─────────────────────────────────────────────
    window.cPanel = function(panel, el) {
      document.querySelectorAll('.dash-panel').forEach(p => p.classList.remove('active'));
      document.getElementById('cp-' + panel)?.classList.add('active');
      document.querySelectorAll('.dash-nav-tab, .mbn-item').forEach(t => t.classList.remove('active'));
      if (el?.dataset?.panel)  document.querySelector(`[data-panel="${el.dataset.panel}"]`)?.classList.add('active');
      if (el?.dataset?.mpanel) document.querySelector(`[data-mpanel="${el.dataset.mpanel}"]`)?.classList.add('active');

      const loaders = {
        overview: loadOverview,
        orders:   loadMyOrders,
        wallet:   () => { loadWallet(); loadTransactions(); },
        track:    loadTracking,
        order:    () => { loadWalletBalance(); },
        airtime:  loadAirtimeRates,
      };
      loaders[panel]?.();
    };

    // ─────────────────────────────────────────────
    // ZONE AUTO-RESOLVER
    // ─────────────────────────────────────────────
    let _pkuDebounce = null;
    let _dlvDebounce = null;

    window.debouncedResolve = function(type) {
      if (type === 'pickup') {
        clearTimeout(_pkuDebounce);
        _pkuDebounce = setTimeout(() => resolveZoneFor('pickup'), 700);
      } else {
        clearTimeout(_dlvDebounce);
        _dlvDebounce = setTimeout(() => resolveZoneFor('dropoff'), 700);
      }
    };

    async function resolveZoneFor(type) {
      const isPku     = type === 'pickup';
      const addrId    = isPku ? 'pkuAddr'       : 'dlvAddr';
      const cityId    = isPku ? 'pkuCity'        : 'dlvCity';
      const zoneHidId = isPku ? 'pkuZone'        : 'dlvZone';
      const badgeId   = isPku ? 'pkuZoneBadge'   : 'dlvZoneBadge';
      const spinnerId = isPku ? 'pkuAddrSpinner' : 'dlvAddrSpinner';

      const address = document.getElementById(addrId)?.value?.trim();
      const city    = document.getElementById(cityId)?.value || 'Ibadan';
      const badge   = document.getElementById(badgeId);
      const spinner = document.getElementById(spinnerId);
      const zoneHid = document.getElementById(zoneHidId);

      if (isPku) _pkuZoneData = null; else _dlvZoneData = null;
      if (zoneHid) zoneHid.value = '';
      if (badge)   badge.style.display = 'none';

      if (!address || address.length < 5) return;

      if (spinner) spinner.style.display = 'block';

      try {
        const { Zones } = await import('../js/api.js');
        const data = await Zones.getZone(address, city);
        const lat = data.coordinates.lat;
        const lng = data.coordinates.lng;

        if (data.zone) {
          const zd = { zoneId: data.zone._id, zoneName: data.zone.name, lat, lng, covered: true };
          if (isPku) _pkuZoneData = zd; else _dlvZoneData = zd;
          if (zoneHid) zoneHid.value = data.zone._id;
          showZoneBadge(badge, 'success', `📍 Zone: ${data.zone.name} — delivery available`);
          refreshQuote();
        } else {
          const zd = { zoneId: null, zoneName: null, lat, lng, covered: false };
          if (isPku) _pkuZoneData = zd; else _dlvZoneData = zd;
          showZoneBadge(badge, 'warning', `⚠️ Address found but outside our delivery zones`);
        }
      } catch (err) {
        showZoneBadge(badge, 'error', `❌ Could not find this address — try being more specific`);
        console.warn(`Zone resolve error [${type}]:`, err.message);
      } finally {
        if (spinner) spinner.style.display = 'none';
      }
    }

    function showZoneBadge(badge, type, text) {
      if (!badge) return;
      const styles = {
        success: 'background:#d1fae5;color:#065f46;border:1.5px solid #6ee7b7',
        warning: 'background:#fef3c7;color:#92400e;border:1.5px solid #fcd34d',
        error:   'background:#fee2e2;color:#991b1b;border:1.5px solid #fca5a5',
      };
      badge.setAttribute('style',
        `display:flex;align-items:center;gap:6px;margin-top:8px;padding:8px 12px;border-radius:8px;font-size:12px;font-weight:600;${styles[type]}`
      );
      badge.textContent = text;
    }

    // ─────────────────────────────────────────────
    // OVERVIEW
    // ─────────────────────────────────────────────
    async function loadOverview() {
      try {
        const { Orders, Wallet } = await import('../js/api.js');
        const [ordersRes, walletRes] = await Promise.all([
          Orders.getAll({ limit: 5 }),
          Wallet.get(),
        ]);

        const orders = ordersRes.orders || ordersRes;
        _walletBalance = walletRes.balance || 0;

        const active = orders.filter(o => ['pending','accepted','in-transit'].includes(o.status)).length;
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthSpent = orders
          .filter(o => o.status === 'delivered' && new Date(o.createdAt) >= monthStart)
          .reduce((s, o) => s + (o.totalAmount || 0), 0);

        setT('ov-active', active || '0');
        setT('ov-spent',  fmt(monthSpent));
        setT('ov-total',  ordersRes.total || orders.length || '0');
        setT('ov-wallet', fmt(_walletBalance));

        const activeOrder = orders.find(o => ['accepted','in-transit','pending'].includes(o.status));
        const activeEl    = document.getElementById('ov-active-order');
        const liveBadge   = document.getElementById('ov-live-badge');

        if (activeOrder && activeEl) {
          liveBadge.style.display = 'inline-flex';
          activeEl.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:14px;background:var(--white);border-radius:var(--radius);border:1.5px solid var(--border);margin-bottom:10px;flex-wrap:wrap;gap:10px">
              <div>
                <div class="mono" style="font-size:12px;color:var(--red);font-weight:600">${activeOrder.orderCode || activeOrder._id}</div>
                <div style="font-size:13px;font-weight:700;margin-top:4px">${activeOrder.pickup?.address || '…'} → ${activeOrder.dropoff?.address || '…'}</div>
                <div style="font-size:12px;color:var(--text2);margin-top:2px">
                  ${activeOrder.rider ? `Rider: ${activeOrder.rider.name || activeOrder.rider.firstName} 🛵` : 'Searching for rider…'}
                </div>
              </div>
              <span class="badge badge-amber"><span class="pulse-dot"></span> ${activeOrder.status}</span>
            </div>
            <button class="btn btn-outline btn-full" onclick="cPanel('track',document.querySelector('[data-panel=track]'))">View Full Tracking →</button>`;
          _currentOrder = activeOrder;
        }

        const recentEl = document.getElementById('ov-recent-orders');
        if (recentEl) {
          if (!orders.length) {
            recentEl.innerHTML = `<div style="text-align:center;color:var(--text3);font-size:13px;padding:20px">No orders yet — place your first delivery!</div>`;
          } else {
            recentEl.innerHTML = orders.slice(0, 4).map(o => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(226,232,240,.5)">
                <div>
                  <div style="font-size:13px;font-weight:600">${o.pickup?.address || '…'} → ${o.dropoff?.address || '…'}</div>
                  <div style="font-size:11px;color:var(--text3);font-family:'DM Mono',monospace">${o.orderCode || o._id} · ${timeAgo(o.createdAt)}</div>
                </div>
                <span class="badge ${statusBadge(o.status)}">${o.status}</span>
              </div>`).join('');
          }
        }
      } catch (e) {
        console.error('loadOverview:', e);
      }
    }

    // ─────────────────────────────────────────────
    // PRICE CALCULATOR
    // ─────────────────────────────────────────────
    window.calcOrderPrice = refreshQuote;

    let _quotedTotal = null;
    let _quotedFees  = null;

    async function refreshQuote() {
      if (!_pkuZoneData?.covered || !_dlvZoneData?.covered) {
        ['pbBase','pbDist','pbFee','pbIns','pbTotal'].forEach(id => setT(id, '₦—'));
        return;
      }

      setT('pbTotal', 'Calculating…');

      try {
        const { Orders } = await import('../js/api.js');

        const quote = await Orders.quote({
          pickup: {
            address: document.getElementById('pkuAddr')?.value,
            city:    document.getElementById('pkuCity')?.value,
            lat:     _pkuZoneData.lat,
            lng:     _pkuZoneData.lng,
          },
          delivery: {
            address: document.getElementById('dlvAddr')?.value,
            city:    document.getElementById('dlvCity')?.value,
            lat:     _dlvZoneData.lat,
            lng:     _dlvZoneData.lng,
          },
          package: {
            category:      document.getElementById('pkgCat')?.value,
            weight:        parseFloat(document.getElementById('pkgWt')?.value || 1),
            speed:         document.getElementById('pkgSpeed')?.value,
            declaredValue: parseFloat(document.getElementById('pkgVal')?.value || 0),
            insured:       parseFloat(document.getElementById('pkgVal')?.value || 0) > 0,
          },
          paymentMethod: 'paystack',
        });

        const f = quote.fees;
        setT('pbBase',  fmt(f.baseFee + f.distanceFee));
        setT('pbDist',  f.weightSurcharge > 0 ? fmt(f.weightSurcharge) : '₦0');
        setT('pbFee',   fmt(f.platformFee));
        setT('pbIns',   f.insurance > 0 ? fmt(f.insurance) : 'Not selected');
        setT('pbTotal', fmt(f.total));

        _quotedTotal = f.total;
        _quotedFees  = f;

      } catch (err) {
        setT('pbTotal', 'Price unavailable');
        _quotedTotal = null;
        _quotedFees  = null;
        console.warn('Quote error:', err.message);
      }
    }

    // ─────────────────────────────────────────────
    // ORDER FLOW — STEP 1 → 2
    // ─────────────────────────────────────────────
    window.goToConfirm = function() {
      const pkuAddr = document.getElementById('pkuAddr')?.value?.trim();
      const dlvAddr = document.getElementById('dlvAddr')?.value?.trim();

      if (!pkuAddr) { showToast('Enter a pickup address', 'warning'); return; }
      if (!dlvAddr) { showToast('Enter a delivery address', 'warning'); return; }

      if (!_pkuZoneData?.covered) {
        showToast('Pickup address zone not detected. Wait for zone detection or try a more specific address.', 'warning');
        return;
      }
      if (!_dlvZoneData?.covered) {
        showToast('Delivery address zone not detected. Wait for zone detection or try a more specific address.', 'warning');
        return;
      }

      if (!_quotedTotal || !_quotedFees) {
        showToast('Price is still calculating — please wait a moment.', 'warning');
        return;
      }

      const catLabels = {
        document:     'Documents / Small Items',
        fragile:      'Fragile / Perishable Items',
        small_parcel: 'Clothes / Fashion',
        large_parcel: 'Electronics',
        groceries:    'Groceries',
        large_items: 'Large Items (5–15kg)',
        bulk:         'Bulk Goods',
      };
      const catValue = document.getElementById('pkgCat')?.value;
      const catLabel = catLabels[catValue] || '—';

      _orderFormData = {
        pickup: {
          address:  pkuAddr,
          city:     document.getElementById('pkuCity')?.value,
          zone:     _pkuZoneData.zoneId,
          zoneName: _pkuZoneData.zoneName,
          lat:      _pkuZoneData.lat,
          lng:      _pkuZoneData.lng,
          phone:    document.getElementById('pkuPhone')?.value,
        },
        dropoff: {
          address:  dlvAddr,
          city:     document.getElementById('dlvCity')?.value,
          zone:     _dlvZoneData.zoneId,
          zoneName: _dlvZoneData.zoneName,
          lat:      _dlvZoneData.lat,
          lng:      _dlvZoneData.lng,
          phone:    document.getElementById('dlvPhone')?.value,
        },
        packageType:  catValue,
        packageLabel: catLabel,
        speed:        document.getElementById('pkgSpeed')?.selectedOptions[0]?.text,
        weight:       parseFloat(document.getElementById('pkgWt')?.value || 1),
        itemValue:    parseFloat(document.getElementById('pkgVal')?.value || 0),
        notes:        document.getElementById('pkgNotes')?.value,
        fees:         _quotedFees,
        totalDisplay: fmt(_quotedTotal),
      };

      document.getElementById('confirmSummary').innerHTML = `
        <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Pickup</span><span style="font-weight:600">${_orderFormData.pickup.address}</span></div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Pickup Zone</span><span style="font-weight:600;color:var(--success)">📍 ${_orderFormData.pickup.zoneName}</span></div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Delivery</span><span style="font-weight:600">${_orderFormData.dropoff.address}</span></div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Delivery Zone</span><span style="font-weight:600;color:var(--success)">📍 ${_orderFormData.dropoff.zoneName}</span></div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Package</span><span style="font-weight:600">${_orderFormData.packageLabel}</span></div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Speed</span><span style="font-weight:600">${_orderFormData.speed}</span></div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Weight</span><span style="font-weight:600">${_orderFormData.weight} kg</span></div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Distance</span><span style="font-weight:600">${_quotedFees.distanceKm} km</span></div>
        ${_orderFormData.itemValue > 0 ? `<div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Insurance value</span><span>${fmt(_orderFormData.itemValue)}</span></div>` : ''}
        <div style="display:flex;justify-content:space-between;border-top:1.5px solid var(--border);padding-top:10px;margin-top:4px">
          <span style="font-weight:700">Total</span>
          <span style="font-weight:800;color:var(--red);font-size:16px">${_orderFormData.totalDisplay}</span>
        </div>`;

      setT('walletBalPM', fmt(_walletBalance));
      document.getElementById('ostep1').style.display = 'none';
      document.getElementById('ostep2').style.display = 'block';
      updOP(2);
    };

    window.prevOStep = function() {
      document.getElementById('ostep2').style.display = 'none';
      document.getElementById('ostep1').style.display = 'block';
      updOP(1);
    };

    // ─────────────────────────────────────────────
    // doPlaceOrder — FIXED
    // FIX 1: No semicolon after if(payMethod === 'paystack')
    // FIX 2: payload built before PaystackPop.setup() so onSuccess can reference it
    // FIX 3: handler.openIframe() called
    // FIX 4: Function closes properly — helper functions are NOT nested inside it
    // ─────────────────────────────────────────────
    window.doPlaceOrder = async function() {
      const payMethod = document.querySelector('input[name="pm"]:checked')?.value || 'paystack';
      const btn = document.getElementById('payNowBtn');
      btn.disabled = true;
      btn.textContent = 'Processing…';

      // Build payload first — must exist before any callback references it
      const speedLabel = document.getElementById('pkgSpeed')?.value || 'express';
      const catLabel   = document.getElementById('pkgCat')?.value   || 'small_parcel';

      const payload = {
        pickup: {
          address:      _orderFormData.pickup.address,
          city:         _orderFormData.pickup.city,
          contactPhone: _orderFormData.pickup.phone,
          zone:         _orderFormData.pickup.zone,
          coordinates:  { lat: _orderFormData.pickup.lat, lng: _orderFormData.pickup.lng },
        },
        delivery: {
          address:      _orderFormData.dropoff.address,
          city:         _orderFormData.dropoff.city,
          contactPhone: _orderFormData.dropoff.phone,
          zone:         _orderFormData.dropoff.zone,
          coordinates:  { lat: _orderFormData.dropoff.lat, lng: _orderFormData.dropoff.lng },
        },
        package: {
          category:      catLabel,
          weight:        _orderFormData.weight,
          speed:         speedLabel,
          declaredValue: _orderFormData.itemValue,
          insured:       _orderFormData.itemValue > 0,
          notes:         _orderFormData.notes,
        },
        payment:        { method: payMethod },
        assignmentMode: 'auto',
      };

      // ── PAYSTACK INLINE FLOW ────────────────────────────────────────────────
      // FIX: No semicolon here — was `if(payMethod === 'paystack');{` before
      if (payMethod === 'paystack') {
         // Add this guard
      if (typeof PaystackPop === 'undefined') {
        showToast('Payment system not loaded. Please refresh the page.', 'error');
        btn.disabled = false;
        btn.textContent = 'Pay & Place Order →';
        return;
      }
        try {
          const handler = PaystackPop.setup({
            key:      'pk_test_67a9e5178c90d95e96c91ea77cf33332c1065838',
            email:    OS.currentUser?.email,
            amount:   Math.round(_quotedTotal * 100), // kobo — Paystack requires this
            currency: 'NGN',
            ref:      `OS-${Date.now()}`,
            metadata: { orderData: JSON.stringify(_orderFormData) },

            onSuccess: async (transaction) => {
              btn.textContent = 'Creating order…';
              try {
                const { Orders } = await import('../js/api.js');
                const order = await Orders.create({
                  ...payload,
                  payment: { method: 'paystack', reference: transaction.reference },
                });
                _currentOrder = order;
                document.getElementById('ostep2').style.display = 'none';
                document.getElementById('ostep3').style.display = 'block'; // FIX: was "dsiplay" typo
                setT('newOrderCode', order.orderCode || order._id);
                updOP(3);
                pollOrderStatus(order._id);
              } catch (e) {
                showToast('Payment received but order failed — contact support', 'error');
                btn.disabled = false;
                btn.textContent = 'Pay & Place Order →';
              }
            },

            onCancel: () => {
              showToast('Payment cancelled', 'warning');
              btn.disabled = false;
              btn.textContent = 'Pay & Place Order →';
            },
          });

          handler.openIframe(); // FIX: was missing — modal never opened before

        } catch (e) {
          showToast(e.message || 'Could not start payment', 'error');
          btn.disabled = false;
          btn.textContent = 'Pay & Place Order →';
        }

        return; // Stop here — don't fall through to wallet/COD flow
      }

      // ── WALLET / COD FLOW ───────────────────────────────────────────────────
      try {
        const { Orders } = await import('../js/api.js');
        const order = await Orders.create(payload);
        _currentOrder = order;

        document.getElementById('ostep2').style.display = 'none';
        document.getElementById('ostep3').style.display = 'block';
        setT('newOrderCode', order.orderCode || order._id);
        updOP(3);

        pollOrderStatus(order._id);
        startCancelTimer(new Date(order.createdAt));
      } catch (e) {
        showToast(e.message || 'Could not place order. Try again.', 'error');
        btn.disabled = false;
        btn.textContent = 'Pay & Place Order →';
      }
    }; // ← doPlaceOrder ends HERE — everything below is correctly outside it

    // ─────────────────────────────────────────────
    // POLL ORDER STATUS
    // ─────────────────────────────────────────────
    async function pollOrderStatus(orderId) {
      const { Orders } = await import('../js/api.js');
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        if (attempts > 40) { clearInterval(poll); return; }
        try {
          const order = await Orders.getOne(orderId);
          _currentOrder = order;
          if (order.status === 'accepted' || order.rider) {
            clearInterval(poll);
            document.getElementById('ostep3').style.display = 'none';
            document.getElementById('ostep4').style.display = 'block';
            setT('confirmedOrderCode', order.orderCode || order._id);
            updOP(4);
            showToast('🛵 Rider found and on the way!', 'success');
          }
        } catch { /* keep polling */ }
      }, 5000);
    }

    window.goToTrack = () => cPanel('track', document.querySelector('[data-panel=track]'));

    window.resetOrderForm = function() {
      document.getElementById('ostep4').style.display = 'none';
      document.getElementById('ostep1').style.display = 'block';
      updOP(1);
      ['pkuAddr','dlvAddr','pkgVal','pkgNotes'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      _pkuZoneData = null;
      _dlvZoneData = null;
      ['pkuZoneBadge','dlvZoneBadge'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });
      ['pkuZone','dlvZone'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      calcOrderPrice();
    };

    function updOP(s) {
      for (let i = 1; i <= 4; i++) {
        const el = document.getElementById('ost' + i);
        if (!el) continue;
        el.classList.remove('active', 'done');
        if (i < s)  el.classList.add('done');
        if (i === s) el.classList.add('active');
      }
      for (let i = 1; i <= 3; i++) {
        const el = document.getElementById('opl' + i);
        if (el) el.classList.toggle('done', i < s);
      }
    }

    // ─────────────────────────────────────────────
    // CANCEL TIMER
    // ─────────────────────────────────────────────
    function startCancelTimer(orderCreatedAt) {
      if (_cancelInterval) clearInterval(_cancelInterval);
      const FREE_MS   = 5 * 60 * 1000;
      const orderTime = new Date(orderCreatedAt).getTime();
      const timerEl   = document.getElementById('cancelTimer');
      if (timerEl) timerEl.style.display = 'block';

      function tick() {
        const remaining = FREE_MS - (Date.now() - orderTime);
        const countEl   = document.getElementById('cancelCountdown');
        const cancelBtn = document.getElementById('cancelOrderBtn');
        if (remaining > 0) {
          const m = Math.floor(remaining / 60000);
          const s = Math.floor((remaining % 60000) / 1000);
          if (countEl) {
            countEl.textContent = `${m}:${String(s).padStart(2, '0')}`;
            countEl.style.color = remaining < 60000 ? 'var(--warning)' : 'var(--success)';
          }
        } else {
          clearInterval(_cancelInterval);
          if (countEl) countEl.textContent = '0:00';
          if (cancelBtn) {
            cancelBtn.textContent = 'Cancel (50% fee applies)';
            cancelBtn.style.borderColor = 'var(--danger)';
            cancelBtn.style.color       = 'var(--danger)';
          }
        }
      }
      tick();
      _cancelInterval = setInterval(tick, 1000);
    }

    window.cancelActiveOrder = async function() {
      const countEl = document.getElementById('cancelCountdown');
      const isLate  = countEl?.textContent === '0:00';
      const msg     = isLate
        ? 'Late cancellation: 50% of the delivery fee will be charged. Continue?'
        : 'Cancel this delivery for free?';
      if (!confirm(msg)) return;
      try {
        const { Orders } = await import('../js/api.js');
        const orderId = _currentOrder?._id;
        if (!orderId) { showToast('No active order found', 'error'); return; }
        await Orders.cancel(orderId, 'Customer cancelled');
        showToast('Order cancelled successfully', 'info');
        if (_cancelInterval) clearInterval(_cancelInterval);
        document.getElementById('cancelTimer').style.display = 'none';
        loadOverview();
      } catch (e) { showToast(e.message, 'error'); }
    };

    // ─────────────────────────────────────────────
    // TRACKING
    // ─────────────────────────────────────────────
    async function loadTracking() {
      try {
        const { Orders } = await import('../js/api.js');
        const res    = await Orders.getAll({ status: 'in-transit,accepted,pending', limit: 1 });
        const orders = res.orders || res;
        const order  = orders[0] || _currentOrder;

        if (!order) {
          document.getElementById('track-empty').style.display  = 'block';
          document.getElementById('track-active').style.display = 'none';
          return;
        }

        _currentOrder = order;
        document.getElementById('track-empty').style.display  = 'none';
        document.getElementById('track-active').style.display = 'block';

        setT('track-order-code',   order.orderCode || order._id);
        setT('track-route',        `${order.pickup?.address || '…'} → ${order.dropoff?.address || '…'}`);
        setT('track-status-badge', order.status);

        const etaDate = order.estimatedDelivery
          ? new Date(order.estimatedDelivery)
          : new Date(Date.now() + 20 * 60000);
        setT('track-eta', `${etaDate.getHours().toString().padStart(2,'0')}:${etaDate.getMinutes().toString().padStart(2,'0')}`);

        if (order.rider) {
          const riderCard = document.getElementById('track-rider-card');
          const riderName = order.rider.name || `${order.rider.firstName} ${order.rider.lastName}`;
          riderCard.style.display = 'flex';
          setT('track-rider-av',   riderName.substring(0, 2).toUpperCase());
          setT('track-rider-name', riderName);
          setT('track-rider-meta', `⭐ ${order.rider.rating?.toFixed(1) || '—'} · ${order.rider.vehicleType || 'Motorcycle'} 🛵`);
        }

        buildTimeline(order);

        document.getElementById('track-pkg-info').style.display = 'block';
        document.getElementById('track-pkg-details').innerHTML = `
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Category</span><span>${order.package?.category || '—'}</span></div>
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Weight</span><span>${order.package?.weight || '—'} kg</span></div>
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Amount Paid</span><span style="color:var(--red);font-weight:700">${fmt(order.totalAmount)}</span></div>
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Platform Fee</span><span style="color:var(--warning)">${fmt(order.platformFee)} (5%)</span></div>`;

        if (['pending','accepted'].includes(order.status) && order.createdAt) {
          startCancelTimer(new Date(order.createdAt));
        }

        setTimeout(() => initTrackMap(order), 300);

        if (window.OS?.socket) {
          OS.socket.on('orderUpdate', updated => {
            if (updated._id === order._id) {
              _currentOrder = updated;
              buildTimeline(updated);
              setT('track-status-badge', updated.status);
              if (updated.rider?.location) updateRiderOnMap(updated.rider.location.lat, updated.rider.location.lng);
            }
          });
        }
      } catch (e) {
        console.error('loadTracking:', e);
        document.getElementById('track-empty').style.display  = 'block';
        document.getElementById('track-active').style.display = 'none';
      }
    }

    function buildTimeline(order) {
      const steps = [
        { key: 'placed',    icon: '✓', title: 'Order Placed & Paid',  desc: 'Payment confirmed',                    time: order.createdAt },
        { key: 'accepted',  icon: '✓', title: 'Rider Assigned',        desc: 'Rider accepted the job',               time: order.acceptedAt },
        { key: 'picked_up', icon: '✓', title: 'Package Picked Up',     desc: `From ${order.pickup?.address || '…'}`, time: order.pickedUpAt },
        { key: 'transit',   icon: '🛵', title: 'In Transit',            desc: 'Heading to destination',               time: null },
        { key: 'delivered', icon: '🏁', title: 'Delivered',             desc: 'Awaiting confirmation',                time: order.deliveredAt },
      ];

      const statusOrder = ['pending','accepted','picked_up','in-transit','delivered'];
      const currentIdx  = statusOrder.indexOf(order.status);
      const tl = document.getElementById('track-timeline');
      if (!tl) return;

      tl.innerHTML = steps.map((s, i) => {
        const done   = i < currentIdx;
        const active = i === currentIdx;
        const t = s.time ? new Date(s.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        return `
        <div class="tl-item ${done ? 'done' : active ? 'active' : ''}">
          <div class="tl-left">
            <div class="tl-dot">${done ? '✓' : s.icon}</div>
            ${i < steps.length - 1 ? '<div class="tl-line"></div>' : ''}
          </div>
          <div class="tl-body">
            <div class="tl-title">${s.title}</div>
            <div class="tl-desc">${s.desc}</div>
            ${t ? `<div class="tl-time">${t}</div>` : ''}
          </div>
        </div>`;
      }).join('');
    }

    function initTrackMap(order) {
      if (cMaps['cTrackMap']) { cMaps['cTrackMap'].remove(); delete cMaps['cTrackMap']; }
      const el = document.getElementById('cTrackMap');
      if (!el) return;

      const pickupLat  = order.pickup?.location?.coordinates?.[1]  || 7.3850;
      const pickupLng  = order.pickup?.location?.coordinates?.[0]  || 3.9177;
      const dropoffLat = order.dropoff?.location?.coordinates?.[1] || 7.4140;
      const dropoffLng = order.dropoff?.location?.coordinates?.[0] || 3.9068;

      const map = L.map('cTrackMap', { zoomControl: false, attributionControl: false })
        .setView([(pickupLat + dropoffLat) / 2, (pickupLng + dropoffLng) / 2], 13);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);

      const dot = c => L.divIcon({
        className: '',
        html: `<div style="width:12px;height:12px;border-radius:50%;background:${c};border:2.5px solid #fff;box-shadow:0 0 0 3px ${c}44"></div>`,
        iconSize: [12,12], iconAnchor: [6,6],
      });
      const bikeIcon = L.divIcon({
        className: '',
        html: '<div style="font-size:18px;line-height:1">🛵</div>',
        iconSize: [20,20], iconAnchor: [10,10],
      });

      L.marker([pickupLat,  pickupLng],  { icon: dot('#f59e0b') }).addTo(map).bindPopup('📦 Pickup');
      L.marker([dropoffLat, dropoffLng], { icon: dot('#3b82f6') }).addTo(map).bindPopup('🏁 Delivery');
      L.polyline([[pickupLat, pickupLng], [dropoffLat, dropoffLng]], {
        color: 'rgba(231,76,60,.3)', weight: 3, dashArray: '8,5',
      }).addTo(map);

      const riderLat = order.rider?.location?.lat || pickupLat;
      const riderLng = order.rider?.location?.lng || pickupLng;
      cRiderMarker = L.marker([riderLat, riderLng], { icon: bikeIcon }).addTo(map);
      cMaps['cTrackMap'] = map;
    }

    function updateRiderOnMap(lat, lng) {
      if (cRiderMarker) cRiderMarker.setLatLng([lat, lng]);
    }

    // ─────────────────────────────────────────────
    // MY ORDERS
    // ─────────────────────────────────────────────
    window.loadMyOrders = async function() {
      const tbody = document.getElementById('my-orders-tbody');
      if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:30px">Loading…</td></tr>`;
      try {
        const { Orders } = await import('../js/api.js');
        const status = document.getElementById('ordersFilter')?.value || '';
        const res    = await Orders.getAll({ ...(status && { status }), limit: 50 });
        const orders = res.orders || res;

        if (!tbody) return;
        if (!orders.length) {
          tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:40px">
            <div style="font-size:32px;margin-bottom:10px">📦</div>
            <div>No orders yet.</div>
            <button class="btn btn-primary btn-sm" style="margin-top:10px" onclick="cPanel('order',document.querySelector('[data-panel=order]'))">Place Your First Order</button>
          </td></tr>`;
          return;
        }

        tbody.innerHTML = orders.map(o => `
          <tr>
            <td><span class="mono" style="color:var(--red);font-size:12px">${o.orderCode || o._id}</span></td>
            <td>${o.pickup?.address || '…'} → ${o.dropoff?.address || '…'}</td>
            <td>${o.package?.category || '—'}</td>
            <td class="mono">${fmt(o.totalAmount)}</td>
            <td><span class="badge ${statusBadge(o.status)}">${o.status}</span></td>
            <td style="color:var(--text3);font-size:12px">${timeAgo(o.createdAt)}</td>
            <td>
              ${['pending','accepted'].includes(o.status)
                ? `<button class="btn btn-ghost btn-sm" onclick="cPanel('track',document.querySelector('[data-panel=track]'))">Track</button>`
                : o.status === 'delivered' && !o.rated
                ? `<button class="btn btn-ghost btn-sm" onclick="rateOrder('${o._id}')">Rate</button>`
                : '—'}
            </td>
          </tr>`).join('');
      } catch (e) {
        if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--danger);padding:20px">${e.message}</td></tr>`;
      }
    };

    window.rateOrder = function(orderId) {
      const rating = prompt('Rate your delivery (1–5 stars):');
      if (!rating || isNaN(rating)) return;
      const comment = prompt('Any comments? (optional)') || '';
      import('../js/api.js').then(({ Orders }) => {
        Orders.rate(orderId, parseInt(rating), comment)
          .then(() => { showToast('Thanks for your rating! ⭐', 'success'); loadMyOrders(); })
          .catch(e => showToast(e.message, 'error'));
      });
    };

    // ─────────────────────────────────────────────
    // WALLET
    // ─────────────────────────────────────────────
    async function loadWallet() {
      try {
        const { Wallet } = await import('../js/api.js');
        const data = await Wallet.get();
        _walletBalance = data.balance || 0;
        setT('wallet-bal', fmt(_walletBalance));
        setT('wallet-id',  `Account: ${data.accountNumber || data._id?.slice(-8).toUpperCase() || '—'}`);
      } catch (e) { console.error('loadWallet:', e); }
    }

    async function loadWalletBalance() {
      try {
        const { Wallet } = await import('../js/api.js');
        const data = await Wallet.get();
        _walletBalance = data.balance || 0;
        setT('walletBalPM', fmt(_walletBalance));
        setT('ov-wallet',   fmt(_walletBalance));
      } catch { /* silent */ }
    }

    async function loadTransactions() {
      const el = document.getElementById('tx-list');
      if (el) el.innerHTML = '<div style="text-align:center;color:var(--text3);padding:20px">Loading…</div>';
      try {
        const { Wallet } = await import('../js/api.js');
        const res = await Wallet.transactions({ limit: 20 });
        const txs = res.transactions || res;

        if (!el) return;
        if (!txs.length) {
          el.innerHTML = '<div style="text-align:center;color:var(--text3);font-size:13px;padding:30px">No transactions yet</div>';
          return;
        }
        el.innerHTML = txs.map(t => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid rgba(226,232,240,.5)">
            <div>
              <div style="font-size:13px;font-weight:600">${t.description || t.type}</div>
              <div style="font-size:11px;color:var(--text3)">${timeAgo(t.createdAt)}</div>
            </div>
            <span class="mono" style="color:${t.type === 'credit' ? 'var(--success)' : 'var(--danger)'};font-weight:600">
              ${t.type === 'credit' ? '+' : '-'}${fmt(t.amount)}
            </span>
          </div>`).join('');
      } catch (e) {
        if (el) el.innerHTML = `<div style="color:var(--danger);font-size:13px;text-align:center;padding:20px">${e.message}</div>`;
      }
    }

    window.initTopup = async function() {
      const amt = parseFloat(document.getElementById('fundAmt')?.value);
      if (!amt || amt < 100) { showToast('Minimum top-up is ₦100', 'warning'); return; }
      try {
        const { Wallet } = await import('../js/api.js');
        const data = await Wallet.topup(amt);
        if (data.authorizationUrl) {
          window.open(data.authorizationUrl, '_blank');
          showToast('Complete payment in the Paystack window. Wallet updates automatically.', 'info');
          setTimeout(loadWallet, 10000);
        } else {
          showToast('Could not initiate payment. Check Paystack config.', 'error');
        }
      } catch (e) { showToast(e.message, 'error'); }
    };

    window.openWithdraw = function() {
      const amt = prompt(`Enter withdrawal amount (available: ${fmt(_walletBalance)}):`);
      if (!amt || isNaN(amt)) return;
      showToast('Withdrawal feature — connect bank account in settings', 'info');
    };

    // ─────────────────────────────────────────────
    // AIRTIME
    // ─────────────────────────────────────────────
    async function loadAirtimeRates() {
      try {
        const { Admin } = await import('../js/api.js');
        const { config } = await Admin.getConfig();
        if (config?.airtimeRates) {
          const rates   = config.airtimeRates;
          const rateMap = { MTN: rates.mtn, Airtel: rates.airtel, Glo: rates.glo, '9mobile': rates['9mobile'] };
          document.querySelectorAll('.net-btn').forEach(btn => {
            const name = btn.querySelector('.net-name')?.textContent;
            const r    = rateMap[name];
            if (r) btn.onclick = () => cSelNet(btn, r / 100, name);
          });
          setT('a2cRateDisp', `₦100 → ₦${Math.round(_a2cRate * 100)}`);
        }
      } catch { /* use hardcoded defaults */ }
    }

    window.cSelNet = function(el, rate, name) {
      document.querySelectorAll('.net-btn').forEach(b => b.classList.remove('selected'));
      el.classList.add('selected');
      _a2cRate    = rate;
      _a2cNetwork = name;
      setT('netName',     name);
      setT('a2cRateDisp', `₦100 → ₦${Math.round(rate * 100)}`);
      calcA2C();
    };

    window.calcA2C = function() {
      const amt = parseFloat(document.getElementById('a2cAmt')?.value || 0);
      const res = Math.round(amt * _a2cRate);
      const box = document.getElementById('a2cResult');
      if (amt >= 100) {
        if (box) box.style.display = 'block';
        setT('a2cResultAmt', fmt(res));
      } else {
        if (box) box.style.display = 'none';
      }
    };

    window.submitAirtime = async function() {
      const amt = parseFloat(document.getElementById('a2cAmt')?.value || 0);
      if (amt < 100) { showToast('Minimum airtime conversion is ₦100', 'warning'); return; }
      try {
        const { Wallet } = await import('../js/api.js');
        await Wallet.airtime({ network: _a2cNetwork, amount: amt });
        showToast(`✅ ₦${Math.round(amt * _a2cRate).toLocaleString()} will be credited to your wallet after confirmation.`, 'success');
        document.getElementById('a2cAmt').value = '';
        document.getElementById('a2cResult').style.display = 'none';
        loadWallet();
      } catch (e) { showToast(e.message, 'error'); }
    };

    // ─────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────
    function statusBadge(s) {
      return {
        pending:      'badge-amber',
        accepted:     'badge-blue',
        'in-transit': 'badge-amber',
        delivered:    'badge-green',
        cancelled:    'badge-red',
        disputed:     'badge-red',
      }[s] || 'badge-gray';
    }

    function timeAgo(dateStr) {
      if (!dateStr) return '—';
      const diff = Date.now() - new Date(dateStr).getTime();
      const m    = Math.floor(diff / 60000);
      if (m < 1)  return 'just now';
      if (m < 60) return `${m}m ago`;
      const h = Math.floor(m / 60);
      if (h < 24) return `${h}h ago`;
      return `${Math.floor(h / 24)}d ago`;
    }

    // ─────────────────────────────────────────────
    // SOCKET.IO  — runs on page load, not inside doPlaceOrder
    // ─────────────────────────────────────────────
    if (window.OS?.socket) {
      OS.socket.on('orderUpdate', order => {
        if (_currentOrder && order._id === _currentOrder._id) {
          _currentOrder = order;
          setT('ov-active', ['pending','accepted','in-transit'].includes(order.status) ? '1' : '0');
        }
      });
      OS.socket.on('riderLocation', ({ orderId, lat, lng }) => {
        if (_currentOrder?._id === orderId) updateRiderOnMap(lat, lng);
      });
    }

    // ─────────────────────────────────────────────
    // INITIAL LOAD — runs on page load, not inside doPlaceOrder
    // ─────────────────────────────────────────────
    loadOverview();
  }
};
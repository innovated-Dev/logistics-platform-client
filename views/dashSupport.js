// ==================== SUPPORT DASHBOARD ====================
export const SupportDashView = {
  render(container) {
    const u = OS.currentUser || { name:'Support Agent', initials:'SP', color:'#e74c3c', role:'support' };
    container.innerHTML = buildSupportHTML(u);
    injectSupportStyles();
    initSupportLogic(u);
  }
};

// ─── HTML ───────────────────────────────────────────────────
function buildSupportHTML(u) {
  return `
  <div class="dash-wrapper" style="background:#f8fafc">
    <div class="dash-topbar" style="background:linear-gradient(135deg,#1a0a0a,#2d1515)">
      <div class="dtb-logo">Off<span>Scape</span> <span style="font-size:11px;font-weight:600;color:rgba(231,76,60,.5);margin-left:4px">SUPPORT</span></div>
      <div class="dash-nav-tabs">
        <button class="dash-nav-tab active" onclick="sPanel('chat',this)"    data-panel="s-chat">🤖 AI Assistant</button>
        <button class="dash-nav-tab"         onclick="sPanel('tickets',this)" data-panel="s-tickets">🎫 Tickets</button>
        <button class="dash-nav-tab"         onclick="sPanel('monitor',this)" data-panel="s-monitor">📡 Live Monitor</button>
        <button class="dash-nav-tab"         onclick="sPanel('lookup',this)"  data-panel="s-lookup">🔍 User Lookup</button>
        <button class="dash-nav-tab"         onclick="sPanel('kb',this)"      data-panel="s-kb">📚 Knowledge Base</button>
      </div>
      <div class="dtb-right">
        <span class="badge badge-green"><span class="pulse-dot"></span> On Duty</span>
        <span class="role-badge support">🤖 SUPPORT</span>
        <div class="dtb-avatar" style="background:var(--red)">${u.initials}</div>
        <button class="btn btn-ghost btn-sm" onclick="OS.logout()">← Exit</button>
      </div>
    </div>

    <div class="dash-content" style="padding:0;max-width:100%">

      <!-- AI CHAT -->
      <div id="sp-chat" class="dash-panel active" style="display:flex;flex-direction:column;height:calc(100vh - 58px)">
        <div style="display:flex;flex:1;overflow:hidden">

          <!-- Conversation list -->
          <div class="support-sidebar">
            <div style="padding:14px;border-bottom:1px solid var(--border)">
              <div style="font-size:13px;font-weight:700;margin-bottom:8px">Active Conversations</div>
              <input class="form-input" placeholder="Search chats..." style="font-size:12px;padding:8px 10px">
            </div>
            <div style="overflow-y:auto;flex:1">${convList()}</div>
            <div style="padding:12px;border-top:1px solid var(--border);font-size:11px;color:var(--text3);text-align:center">🤖 AI handles Tier-1 · You handle Tier-2+</div>
          </div>

          <!-- Chat window -->
          <div style="flex:1;display:flex;flex-direction:column;min-width:0">

            <!-- Chat header -->
            <div style="padding:14px 20px;border-bottom:1px solid var(--border);background:var(--white);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
              <div style="display:flex;align-items:center;gap:12px">
                <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#fff">AO</div>
                <div>
                  <div style="font-size:14px;font-weight:700">Amaka Osei <span class="role-badge customer" style="font-size:9px;padding:2px 6px">Customer</span></div>
                  <div style="font-size:11px;color:var(--text3)">Lagos · ORD-LAG-2847 · 3 orders total</div>
                </div>
              </div>
              <div style="display:flex;gap:8px;align-items:center">
                <span class="badge badge-green" id="aiStatusBadge"><span class="pulse-dot"></span> AI Active</span>
                <button class="btn btn-ghost btn-sm" onclick="toggleAI()" id="aiToggleBtn">👤 Take Over</button>
                <button class="btn btn-ghost btn-sm" onclick="showToast('Viewing Amaka Osei profile...','info')">👁 View Profile</button>
              </div>
            </div>

            <!-- Messages -->
            <div id="chatMessages" style="flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:14px;background:#f8fafc">
              <div class="chat-bubble system"><div class="bubble-inner">🤖 AI Assistant activated. Responding on behalf of OffScape Support.</div></div>
              <div class="chat-bubble user">
                <div class="bubble-inner">Hi, my package hasn't moved in 2 hours. Order ORD-LAG-2847. The rider shows as in transit but nothing is updating on the map.</div>
                <div class="bubble-meta">Amaka Osei · 2:34 PM</div>
              </div>
              <div class="chat-bubble ai">
                <div class="bubble-inner">Hi Amaka! 👋 I can see your order <strong>ORD-LAG-2847</strong> (Dugbe Market → Bodija Estate).<br><br>Your rider <strong>Olawale Taiwo</strong> is currently at Ring Road, moving towards Bodija — about <strong>8 minutes away</strong>. The map may have had a brief GPS sync delay, but delivery is actively progressing.<br><br>Is there anything else you'd like me to check on this order?</div>
                <div class="bubble-meta">🤖 OffScape AI · 2:34 PM</div>
              </div>
              <div class="chat-bubble user">
                <div class="bubble-inner">Ok thanks. What if the rider doesn't deliver? Can I get a refund?</div>
                <div class="bubble-meta">Amaka Osei · 2:36 PM</div>
              </div>
              <div class="chat-bubble ai">
                <div class="bubble-inner">Absolutely! OffScape has full buyer protection:<br><br>✅ <strong>Failed delivery:</strong> 100% refund to your OffScape wallet within 24 hours<br>✅ <strong>Damaged goods:</strong> Claim via insurance if selected at checkout<br>✅ <strong>Rider no-show:</strong> Automatic reassignment + compensation<br><br>Would you like me to open a dispute now, or wait a bit longer?</div>
                <div class="bubble-meta">🤖 OffScape AI · 2:36 PM</div>
              </div>
            </div>

            <!-- Input -->
            <div style="padding:14px 20px;border-top:1px solid var(--border);background:var(--white)">
              <div id="agentBanner" style="display:none;background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.2);border-radius:8px;padding:8px 12px;margin-bottom:10px;font-size:12px;color:var(--blue);font-weight:600">
                👤 You are in control — AI paused. Type your reply below.
              </div>
              <div id="quickReplies" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
                ${['Check order status','Process refund','Escalate to agent','Assign new rider','Contact rider'].map(r=>`<button class="quick-chip" onclick="useQuickReply('${r}')">${r}</button>`).join('')}
              </div>
              <div style="background:rgba(139,92,246,.04);border:1px solid rgba(139,92,246,.15);border-radius:8px;padding:10px 12px;margin-bottom:10px;font-size:11px;color:#8b5cf6">
                🤖 <strong>Live AI powered by Claude:</strong> Type any customer support query and hit Send — the AI responds in real time.
              </div>
              <div style="display:flex;gap:10px;align-items:flex-end">
                <textarea id="chatInput" placeholder="Type a message or simulate a customer query..." rows="2"
                  style="flex:1;border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:10px 14px;font-size:14px;font-family:'Plus Jakarta Sans',sans-serif;resize:none;outline:none;transition:border-color .2s"
                  onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendSupportMessage()}"
                  onfocus="this.style.borderColor='var(--red)'"
                  onblur="this.style.borderColor='var(--border)'"></textarea>
                <button class="btn btn-primary" onclick="sendSupportMessage()" id="sendBtn" style="height:44px;padding:0 20px;flex-shrink:0">
                  <span id="sendBtnTxt">Send</span>
                  <div class="auth-spinner" id="sendSpinner" style="display:none;width:14px;height:14px;border-width:2px"></div>
                </button>
              </div>
              <div style="font-size:11px;color:var(--text3);margin-top:6px">Shift+Enter for new line · Enter to send</div>
            </div>
          </div>
        </div>
      </div>

      <!-- TICKETS -->
      <div id="sp-tickets" class="dash-panel" style="padding:24px">
        <div style="font-family:'Switzer',sans-serif;font-size:20px;font-weight:800;margin-bottom:4px">Support Tickets 🎫</div>
        <div style="font-size:13px;color:var(--text2);margin-bottom:20px">All open, in-progress and resolved support cases</div>
        <div class="stats-grid" style="margin-bottom:20px">
          <div class="stat-card" style="border-left:4px solid var(--red)"><div class="sv" style="color:var(--red)">14</div><div class="sl">Open</div><div class="ss">Needs attention</div></div>
          <div class="stat-card" style="border-left:4px solid var(--warning)"><div class="sv" style="color:var(--warning)">8</div><div class="sl">In Progress</div><div class="ss">Agent handling</div></div>
          <div class="stat-card" style="border-left:4px solid var(--success)"><div class="sv" style="color:var(--success)">127</div><div class="sl">Resolved Today</div><div class="ss">AI closed 94%</div></div>
          <div class="stat-card" style="border-left:4px solid var(--blue)"><div class="sv">3.2m</div><div class="sl">Avg Response</div><div class="ss">AI: &lt;5s · Human: 3.2m</div></div>
        </div>
        <div class="dash-card" style="margin-bottom:14px">
          <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;align-items:center">
            <div class="card-head" style="margin-bottom:0;flex:1">Open & In-Progress Tickets</div>
            <select class="input-sel" style="width:auto"><option>All Priority</option><option>🔴 Urgent</option><option>🟡 Medium</option><option>🟢 Low</option></select>
            <select class="input-sel" style="width:auto"><option>All Types</option><option>Refund</option><option>Delivery Issue</option><option>Payment</option></select>
            <button class="btn btn-primary btn-sm" onclick="sPanel('chat',document.querySelector('[data-panel=s-chat]'))">🤖 Open AI Chat</button>
          </div>
          <div class="table-wrap">
            <table class="dash-table">
              <thead><tr><th>Ticket</th><th>User</th><th>Role</th><th>Issue</th><th>Priority</th><th>Assigned</th><th>Status</th><th>Age</th><th>Actions</th></tr></thead>
              <tbody>
                ${[
                  ['TKT-001','Amaka Osei','Customer','Delivery not showing on map','🔴 Urgent','AI Bot','badge-amber','In Progress','2m'],
                  ['TKT-002','Balogun Traders','Merchant','Rider abandoned shipment','🔴 Urgent','You','badge-red','Open','8m'],
                  ['TKT-003','Kehinde Adeyemi','Rider','Payout not received','🟡 Medium','AI Bot','badge-amber','In Progress','22m'],
                  ['TKT-004','Chioma Osei','Customer','Wrong item delivered','🔴 Urgent','Unassigned','badge-red','Open','35m'],
                  ['TKT-005','Tunde Fashola','Customer','Airtime conversion failed','🟡 Medium','AI Bot','badge-amber','In Progress','1h'],
                  ['TKT-006','Fashion Hub Ltd.','Merchant','Billing discrepancy','🟡 Medium','Unassigned','badge-red','Open','2h'],
                  ['TKT-007','Adekunle Sule','Rider','Account suspension appeal','🟢 Low','You','badge-green','Resolved','3h'],
                ].map(t=>`<tr>
                  <td><span class="mono" style="color:var(--red);font-size:11px">${t[0]}</span></td>
                  <td style="font-size:13px;font-weight:600">${t[1]}</td>
                  <td><span class="role-badge ${t[2].toLowerCase()}" style="font-size:9px">${t[2]}</span></td>
                  <td style="font-size:12px;max-width:160px">${t[3]}</td>
                  <td style="font-size:12px">${t[4]}</td>
                  <td style="font-size:12px">${t[5]}</td>
                  <td><span class="badge ${t[6]}">${t[7]}</span></td>
                  <td style="font-size:11px;color:var(--text3)">${t[8]}</td>
                  <td>
                    <div style="display:flex;gap:4px">
                      <button class="btn btn-ghost btn-sm" onclick="sPanel('chat',document.querySelector('[data-panel=s-chat]'));showToast('Opening ${t[0]}','info')">Open</button>
                      ${t[7]==='Open'?`<button class="btn btn-sm" style="background:#8b5cf6;color:#fff;border-color:#8b5cf6" onclick="showToast('${t[0]} assigned to AI','success')">🤖 AI</button>`:''}
                    </div>
                  </td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
        <div class="dash-card">
          <div class="card-head">Recently Resolved (Today)</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
            ${[
              ['TKT-000','Refund processed — ₦2,100 returned','✅ Customer satisfied','AI'],
              ['TKT-099','Rider reassigned after no-show','✅ Delivered on time','AI'],
              ['TKT-098','Airtime conversion corrected','✅ ₦780 credited','Agent'],
              ['TKT-097','Wrong route — merchant updated','✅ Issue noted','Agent'],
              ['TKT-096','Payment reversal processed','✅ Resolved via Paystack','AI'],
              ['TKT-095','Rider complaint resolved','✅ Reinstated after appeal','Agent'],
            ].map(([id,summary,outcome,by])=>`
            <div style="background:rgba(16,185,129,.04);border:1px solid rgba(16,185,129,.15);border-radius:8px;padding:12px">
              <div class="mono" style="font-size:11px;color:var(--red);margin-bottom:4px">${id}</div>
              <div style="font-size:12px;font-weight:600;margin-bottom:4px">${summary}</div>
              <div style="font-size:11px;color:var(--success)">${outcome}</div>
              <div style="font-size:10px;color:var(--text3);margin-top:4px">Closed by: ${by==='AI'?'🤖 AI':'👤 Agent'}</div>
            </div>`).join('')}
          </div>
        </div>
      </div>

      <!-- LIVE MONITOR -->
      <div id="sp-monitor" class="dash-panel" style="padding:24px">
        <div style="font-family:'Switzer',sans-serif;font-size:20px;font-weight:800;margin-bottom:4px">Live Platform Monitor 📡</div>
        <div style="font-size:13px;color:var(--text2);margin-bottom:20px">Real-time activity view across Lagos & Ibadan</div>
        <div class="stats-grid" style="margin-bottom:20px">
          <div class="stat-card" style="border-left:4px solid var(--success)"><div class="sv" style="color:var(--success)" id="liveOrders">1,247</div><div class="sl">Active Orders</div><div class="ss"><span class="pulse-dot" style="color:var(--success)"></span> Live</div></div>
          <div class="stat-card" style="border-left:4px solid var(--blue)"><div class="sv" style="color:var(--blue)" id="liveRiders">843</div><div class="sl">Riders Online</div><div class="ss">of 2,400 registered</div></div>
          <div class="stat-card" style="border-left:4px solid var(--warning)"><div class="sv" style="color:var(--warning)">3</div><div class="sl">Disputed Orders</div><div class="ss">Needs agent review</div></div>
          <div class="stat-card" style="border-left:4px solid var(--red)"><div class="sv" id="liveChats">22</div><div class="sl">Active Chats</div><div class="ss">AI: 20 · Agent: 2</div></div>
        </div>
        <div class="g2">
          <div class="dash-card">
            <div class="card-head">Platform Activity Log <span class="badge badge-green"><span class="pulse-dot"></span> Live</span></div>
            <div id="activityLog" style="display:flex;flex-direction:column;gap:6px;max-height:380px;overflow-y:auto">${activityLog()}</div>
          </div>
          <div>
            <div class="dash-card" style="margin-bottom:14px">
              <div class="card-head">System Status</div>
              ${[
                ['🟢','Paystack Payment API','Healthy','18ms'],
                ['🟢','GPS Tracking Service','Healthy','&lt;5ms'],
                ['🟢','SMS Gateway (Termii)','Healthy','Normal'],
                ['🟢','AI Support (Claude)','Healthy','Active'],
                ['🟡','Database Read Replica','Warning','High load'],
                ['🟢','CDN / Assets','Healthy','Fast'],
              ].map(([dot,svc,stat,detail])=>`
              <div style="display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid rgba(226,232,240,.5)">
                <div style="display:flex;align-items:center;gap:8px"><span>${dot}</span><span style="font-size:13px;font-weight:600">${svc}</span></div>
                <div style="display:flex;align-items:center;gap:8px">
                  <span style="font-size:11px;color:var(--text3)">${detail}</span>
                  <span class="badge ${stat==='Healthy'?'badge-green':stat==='Warning'?'badge-amber':'badge-red'}" style="font-size:10px">${stat}</span>
                </div>
              </div>`).join('')}
            </div>
            <div class="dash-card" style="margin-bottom:14px">
              <div class="card-head">🚨 Active Alerts</div>
              ${[
                ['🔴','ORD-IBD-0418','Rider has not moved in 45 mins — possible abandonment','Investigate'],
                ['🟡','ORD-LAG-2845','Customer requesting refund — payment reversal pending','Process'],
                ['🟡','Lagos Island Zone','Low rider coverage (12 active) — below threshold','Alert'],
              ].map(([sev,ref,msg,action])=>`
              <div style="background:${sev==='🔴'?'rgba(239,68,68,.05)':'rgba(245,158,11,.05)'};border:1px solid ${sev==='🔴'?'rgba(239,68,68,.15)':'rgba(245,158,11,.15)'};border-radius:8px;padding:12px;margin-bottom:8px">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
                  <div>
                    <div style="font-size:12px;font-weight:700;margin-bottom:3px">${sev} ${ref}</div>
                    <div style="font-size:12px;color:var(--text2)">${msg}</div>
                  </div>
                  <button class="btn btn-ghost btn-sm" style="flex-shrink:0;font-size:11px" onclick="showToast('Action taken on ${ref}','success')">${action}</button>
                </div>
              </div>`).join('')}
            </div>
            <div class="dash-card">
              <div class="card-head">Quick Actions</div>
              <div style="display:flex;flex-direction:column;gap:8px">
                <button class="btn btn-ghost btn-full" onclick="showToast('Broadcasting to all riders...','info')">📢 Broadcast to All Riders</button>
                <button class="btn btn-ghost btn-full" onclick="showToast('Generating incident report...','info')">📋 Generate Incident Report</button>
                <button class="btn btn-ghost btn-full" onclick="showToast('Escalating to engineering...','info')">🔧 Escalate to Engineering</button>
                <button class="btn btn-danger btn-full" onclick="if(confirm('Send emergency broadcast?')){showToast('🚨 Emergency broadcast sent to 12,840 users.','error')}">🚨 Emergency Broadcast</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- USER LOOKUP -->
      <div id="sp-lookup" class="dash-panel" style="padding:24px">
        <div style="font-family:'Switzer',sans-serif;font-size:20px;font-weight:800;margin-bottom:4px">User Lookup 🔍</div>
        <div style="font-size:13px;color:var(--text2);margin-bottom:20px">Search any user, order, or rider by name, phone, email, or order ID</div>
        <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap">
          <input class="form-input" id="lookupInput" placeholder="Search by name, phone, email, or order ID..." style="flex:1;min-width:240px">
          <select class="input-sel" style="width:auto"><option>All Types</option><option>Customers</option><option>Merchants</option><option>Riders</option><option>Orders</option></select>
          <button class="btn btn-primary" onclick="showToast('Search results loading...','info')">Search</button>
        </div>
        <div class="g2">
          <div>
            <div class="card-head">Recent Lookups</div>
            ${[
              {init:'AO',name:'Amaka Osei',role:'customer',meta:'amaka@email.com · +234 801 234 5678',city:'Lagos',color:'#3b82f6',count:'28 orders'},
              {init:'BT',name:'Balogun Traders',role:'merchant',meta:'info@balogun.ng · +234 802 000 1234',city:'Lagos',color:'#f59e0b',count:'143 shipments'},
              {init:'KA',name:'Kehinde Adeyemi',role:'rider',meta:'kehinde@email.com · +234 803 456 7890',city:'Lagos',color:'#10b981',count:'340 deliveries'},
            ].map(u=>`
            <div style="display:flex;align-items:center;gap:12px;padding:14px;background:var(--white);border:1.5px solid var(--border);border-radius:var(--radius);margin-bottom:10px;cursor:pointer;transition:border-color .2s" onclick="showUserCard('${u.name}','${u.role}','${u.color}','${u.init}','${u.count}')" onmouseover="this.style.borderColor='var(--red)'" onmouseout="this.style.borderColor='var(--border)'">
              <div style="width:44px;height:44px;border-radius:50%;background:${u.color};display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:#fff;flex-shrink:0">${u.init}</div>
              <div style="flex:1">
                <div style="font-size:14px;font-weight:700">${u.name} <span class="role-badge ${u.role}" style="font-size:9px;padding:2px 6px">${u.role}</span></div>
                <div style="font-size:11px;color:var(--text3);margin-top:2px">${u.meta}</div>
                <div style="font-size:11px;color:var(--text3)">📍 ${u.city} · ${u.count}</div>
              </div>
              <div class="icon-btn">→</div>
            </div>`).join('')}
          </div>
          <div id="userCardPanel">
            <div class="dash-card" style="text-align:center;padding:48px 20px;color:var(--text3)">
              <div style="font-size:40px;margin-bottom:12px">🔍</div>
              <div style="font-size:14px;font-weight:600">Click a user to see their full profile</div>
              <div style="font-size:12px;margin-top:6px">Order history, account status, and agent actions appear here</div>
            </div>
          </div>
        </div>
      </div>

      <!-- KNOWLEDGE BASE -->
      <div id="sp-kb" class="dash-panel" style="padding:24px">
        <div style="font-family:'Switzer',sans-serif;font-size:20px;font-weight:800;margin-bottom:4px">Knowledge Base 📚</div>
        <div style="font-size:13px;color:var(--text2);margin-bottom:20px">Support scripts, FAQs and escalation procedures — also fed to the AI assistant</div>
        <div class="g2">
          <div>
            ${[
              {icon:'💳',title:'Payments & Refunds',count:14,arts:['How to process a full refund','Partial refund procedure','Paystack dispute resolution','Wallet credit vs card refund','Refund SLA timelines']},
              {icon:'📦',title:'Delivery Issues',count:18,arts:['Rider abandoned shipment','Package not picked up','Wrong item delivered','Delivery to wrong address','Package damage claim']},
              {icon:'🛵',title:'Rider Management',count:12,arts:['KYC verification checklist','Rider suspension policy','Payout failure resolution','Low rating intervention','Rider reinstatement']},
              {icon:'🏪',title:'Merchant Support',count:9,arts:['Merchant billing disputes','Platform fee explanation','How to post a shipment','Merchant account suspension','Business wallet issues']},
            ].map(cat=>`
            <div class="dash-card" style="margin-bottom:14px">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
                <div style="font-size:22px">${cat.icon}</div>
                <div><div style="font-size:14px;font-weight:700">${cat.title}</div><div style="font-size:11px;color:var(--text3)">${cat.count} articles</div></div>
              </div>
              <div style="display:flex;flex-direction:column;gap:4px">
                ${cat.arts.map(art=>`
                <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:var(--bg);border-radius:6px;cursor:pointer;font-size:12px" onclick="showToast('Opening: ${art}','info')">
                  <span>📄 ${art}</span><span style="color:var(--red)">→</span>
                </div>`).join('')}
              </div>
              <button class="btn btn-ghost btn-full" style="margin-top:10px;font-size:12px" onclick="showToast('Viewing all ${cat.title} articles','info')">View all ${cat.count} →</button>
            </div>`).join('')}
          </div>
          <div>
            <div class="dash-card" style="margin-bottom:14px">
              <div class="card-head">🤖 AI System Prompt</div>
              <div style="background:var(--navy);border-radius:8px;padding:16px;font-family:'DM Mono',monospace;font-size:11px;color:rgba(255,255,255,.7);line-height:1.8;max-height:300px;overflow-y:auto">
                You are a friendly OffScape Logistics support agent in Lagos/Ibadan, Nigeria.<br><br>
                <span style="color:#a78bfa">## You can:</span><br>
                - Check order status &amp; provide live updates<br>
                - Explain refund policy (100% for failed deliveries)<br>
                - Help with airtime conversion (MTN 78%, Airtel 75%, Glo 72%, 9mobile 70%)<br>
                - Explain 5% platform fee — riders keep 95%<br>
                - Guide users through booking and tracking<br><br>
                <span style="color:#a78bfa">## Escalate to human when:</span><br>
                - Fraud suspected · Refund &gt; ₦10,000<br>
                - Legal threats · Rider safety concerns<br>
                - Repeated unresolved issues<br><br>
                <span style="color:#a78bfa">## Tone:</span><br>
                Warm, Nigerian-friendly, professional. Use ₦. Always offer further help.
              </div>
              <button class="btn btn-ghost btn-full" style="margin-top:10px;font-size:12px" onclick="showToast('AI prompt editor opening...','info')">✏️ Edit AI Prompt</button>
            </div>
            <div class="dash-card">
              <div class="card-head">⚡ Quick Response Scripts</div>
              <div style="display:flex;flex-direction:column;gap:8px">
                ${[
                  ['Delay Apology','We sincerely apologize for the delay. Our team is actively monitoring and will update you within 10 minutes.'],
                  ['Refund Confirmation','Your refund has been processed and will appear in your OffScape wallet within 24 hours.'],
                  ['Rider Reassignment','We have reassigned a new rider to your order. They will reach the pickup point shortly.'],
                  ['Escalation Notice','This case has been escalated to our senior support team. You will receive a follow-up within 1 hour.'],
                ].map(([title,script])=>`
                <div style="padding:10px;background:var(--bg);border-radius:8px;border:1px solid var(--border)">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
                    <span style="font-size:12px;font-weight:700">${title}</span>
                    <button class="btn btn-ghost btn-sm" style="font-size:11px" onclick="useScript('${script.replace(/'/g,"\\'")}')">Use →</button>
                  </div>
                  <div style="font-size:11px;color:var(--text2);line-height:1.5">${script}</div>
                </div>`).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div><!-- /dash-content -->

    <nav class="mobile-bottom-nav">
      <div class="mbn-inner">
        <button class="mbn-item active" onclick="sPanel('chat',this)"    data-mpanel="s-chat"><span class="mbn-icon">🤖</span>AI Chat</button>
        <button class="mbn-item"         onclick="sPanel('tickets',this)" data-mpanel="s-tickets"><span class="mbn-icon">🎫</span>Tickets</button>
        <button class="mbn-item"         onclick="sPanel('monitor',this)" data-mpanel="s-monitor"><span class="mbn-icon">📡</span>Monitor</button>
        <button class="mbn-item"         onclick="sPanel('lookup',this)"  data-mpanel="s-lookup"><span class="mbn-icon">🔍</span>Lookup</button>
        <button class="mbn-item"         onclick="sPanel('kb',this)"      data-mpanel="s-kb"><span class="mbn-icon">📚</span>KB</button>
      </div>
    </nav>
  </div>`;
}

// ─── INIT LOGIC ─────────────────────────────────────────────
function initSupportLogic(u) {

  // Panel switcher
  window.sPanel = function(panel, el) {
    document.querySelectorAll('.dash-panel').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('sp-' + panel);
    if (target) { target.classList.add('active'); target.style.display = panel === 'chat' ? 'flex' : 'block'; }
    document.querySelectorAll('.dash-panel').forEach(p => { if (!p.classList.contains('active')) p.style.display = 'none'; });
    document.querySelectorAll('.dash-nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.mbn-item').forEach(t => t.classList.remove('active'));
    if (el?.dataset?.panel)  document.querySelector(`[data-panel="${el.dataset.panel}"]`)?.classList.add('active');
    if (el?.dataset?.mpanel) document.querySelector(`[data-mpanel="${el.dataset.mpanel}"]`)?.classList.add('active');
  };

  // AI toggle
  let aiActive = true;
  window.toggleAI = function() {
    aiActive = !aiActive;
    const badge  = document.getElementById('aiStatusBadge');
    const btn    = document.getElementById('aiToggleBtn');
    const banner = document.getElementById('agentBanner');
    if (badge)  { badge.className = aiActive ? 'badge badge-green' : 'badge badge-blue'; badge.innerHTML = aiActive ? '<span class="pulse-dot"></span> AI Active' : '👤 Agent Mode'; }
    if (btn)    btn.textContent = aiActive ? '👤 Take Over' : '🤖 Hand to AI';
    if (banner) banner.style.display = aiActive ? 'none' : 'block';
    showToast(aiActive ? '🤖 AI assistant re-activated.' : '👤 You have taken over this conversation.', 'info');
  };

  // Send message
  window.sendSupportMessage = async function() {
    const input   = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const spinner = document.getElementById('sendSpinner');
    const sendTxt = document.getElementById('sendBtnTxt');
    const msgs    = document.getElementById('chatMessages');
    const msg     = input?.value?.trim();
    if (!msg || !msgs) return;

    // User bubble
    msgs.appendChild(makeBubble('user', msg, aiActive ? 'Simulated Customer' : u.name));
    input.value = '';
    scrollChat();

    if (!aiActive) return; // agent mode — no AI

    // Typing indicator
    const typing = makeBubble('ai', null, '🤖 OffScape AI', true);
    msgs.appendChild(typing);
    scrollChat();

    sendBtn.disabled = true;
    if (spinner) { spinner.style.display = 'block'; }
    if (sendTxt) { sendTxt.style.display = 'none'; }

    try {
      const reply = await callClaude(msg);
      typing.remove();
      msgs.appendChild(makeBubble('ai', reply, '🤖 OffScape AI'));
      scrollChat();
    } catch (err) {
      typing.remove();
      msgs.appendChild(makeBubble('system', '⚠️ AI temporarily unavailable. Please type your reply manually or try again in a moment.', 'System'));
      scrollChat();
    } finally {
      sendBtn.disabled = false;
      if (spinner) spinner.style.display = 'none';
      if (sendTxt) sendTxt.style.display = 'inline';
    }
  };

  // Claude API call
  async function callClaude(userMessage) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `You are a friendly customer support agent for OffScape Logistics — a delivery marketplace in Lagos and Ibadan, Nigeria.

Key facts: 5% platform fee on all deliveries, riders keep 95%. Payment via Paystack or OffScape Wallet. Airtime conversion rates: MTN 78%, Airtel 75%, Glo 72%, 9mobile 70%. Full refund for failed deliveries within 24hrs. Cities: Lagos and Ibadan only.

Keep responses concise, warm and Nigerian-friendly. Use ₦ for currency. Always end with an offer to help further.`,
        messages: [{ role: 'user', content: userMessage }]
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.content?.find(b => b.type === 'text')?.text || 'Let me help you with that.';
  }

  // Bubble factory
  function makeBubble(type, text, author, typing = false) {
    const div = document.createElement('div');
    div.className = `chat-bubble ${type}`;
    if (typing) {
      div.innerHTML = `<div class="bubble-inner"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div><div class="bubble-meta">${author} is typing...</div>`;
    } else {
      const safe = (text || '').replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
      const time = new Date().toLocaleTimeString('en-NG',{hour:'2-digit',minute:'2-digit'});
      div.innerHTML = `<div class="bubble-inner">${safe}</div><div class="bubble-meta">${author} · ${time}</div>`;
    }
    return div;
  }

  function scrollChat() {
    const m = document.getElementById('chatMessages'); if(m) m.scrollTop = m.scrollHeight;
  }

  // Quick reply / script
  window.useQuickReply = function(t) { const i=document.getElementById('chatInput'); if(i){i.value=t;i.focus();} };
  window.useScript = function(t) { sPanel('chat',document.querySelector('[data-panel=s-chat]')); setTimeout(()=>useQuickReply(t),150); };

  // User card
  window.showUserCard = function(name, role, color, init, count) {
    const panel = document.getElementById('userCardPanel'); if(!panel) return;
    panel.innerHTML = `
      <div class="dash-card">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">
          <div style="width:56px;height:56px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:#fff">${init}</div>
          <div><div style="font-size:18px;font-weight:800">${name}</div><span class="role-badge ${role}">${role}</span><div style="font-size:12px;color:var(--text3);margin-top:4px">Lagos · Active account</div></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;font-size:13px;margin-bottom:16px">
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Activity</span><span class="mono" style="font-weight:700">${count}</span></div>
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Member Since</span><span>Jan 2025</span></div>
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Account Status</span><span class="badge badge-green">Active</span></div>
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text2)">Open Tickets</span><span>1 open</span></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <button class="btn btn-primary btn-full" onclick="sPanel('chat',document.querySelector('[data-panel=s-chat]'));showToast('Opening chat with ${name}','success')">💬 Open Support Chat</button>
          <button class="btn btn-ghost btn-full" onclick="showToast('Viewing order history for ${name}','info')">📋 View Order History</button>
          <button class="btn btn-ghost btn-full" onclick="showToast('Issuing wallet credit to ${name}','success')">💰 Issue Wallet Credit</button>
          <button class="btn btn-danger btn-full" onclick="showToast('Account flagged for review','error')">🚩 Flag Account</button>
        </div>
      </div>`;
  };

  // Conv list clicks
  document.querySelectorAll('.conv-item').forEach(item => {
    item.addEventListener('click', function() {
      document.querySelectorAll('.conv-item').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Live counters
  setInterval(() => {
    const elo = document.getElementById('liveOrders'); if(elo) elo.textContent = (1200+Math.floor(Math.random()*100)).toLocaleString();
    const elr = document.getElementById('liveRiders'); if(elr) elr.textContent = (820+Math.floor(Math.random()*40)).toLocaleString();
    const elc = document.getElementById('liveChats');  if(elc) elc.textContent = (18+Math.floor(Math.random()*8)).toLocaleString();
  }, 5000);

  // Activity log live feed
  const logItems = [
    ['ORD-LAG','New order placed','Ikeja → Lekki'],
    ['ORD-IBD','Delivery confirmed','Dugbe → Bodija'],
    ['USR','New rider signup','Lagos · Pending KYC'],
    ['ORD-LAG','Payment received','₦3,400 via Paystack'],
    ['ORD-LAG','Rider accepted job','0.8km from pickup'],
    ['ORD-IBD','Order cancelled','Refund initiated'],
    ['USR','Customer registered','Ibadan · Active'],
  ];
  let logIdx = 0;
  setInterval(() => {
    const log = document.getElementById('activityLog'); if(!log) return;
    const item = logItems[logIdx++ % logItems.length];
    const el = document.createElement('div');
    el.style.cssText = 'display:flex;gap:8px;align-items:center;padding:7px 10px;background:var(--white);border-radius:6px;border:1px solid var(--border);font-size:11px;animation:fadeUp .3s ease';
    el.innerHTML = `<span class="mono" style="color:var(--red);min-width:80px">${item[0]}-${2800+Math.floor(Math.random()*100)}</span><span style="flex:1;font-weight:600">${item[1]}</span><span style="color:var(--text3)">${item[2]}</span><span style="color:var(--text3);white-space:nowrap">just now</span>`;
    log.insertBefore(el, log.firstChild);
    if (log.children.length > 12) log.lastChild?.remove();
  }, 2500);
}

// ─── PARTIAL HTML GENERATORS ────────────────────────────────
function convList() {
  return [
    {init:'AO',name:'Amaka Osei',role:'Customer',last:"My package hasn't moved...",time:'2m',unread:2,color:'#3b82f6',active:true},
    {init:'BT',name:'Balogun Traders',role:'Merchant',last:'Rider abandoned my shipment',time:'8m',unread:1,color:'#f59e0b',active:false},
    {init:'KA',name:'Kehinde Adeyemi',role:'Rider',last:'Payout not received',time:'22m',unread:0,color:'#10b981',active:false},
    {init:'CO',name:'Chioma Osei',role:'Customer',last:'Wrong item delivered',time:'35m',unread:3,color:'#8b5cf6',active:false},
    {init:'TF',name:'Tunde Fashola',role:'Customer',last:'Airtime conversion failed',time:'1h',unread:0,color:'#e74c3c',active:false},
    {init:'FH',name:'Fashion Hub Ltd.',role:'Merchant',last:'Billing discrepancy issue',time:'2h',unread:0,color:'#f59e0b',active:false},
  ].map(c=>`
  <div class="conv-item${c.active?' active':''}">
    <div style="position:relative;flex-shrink:0">
      <div style="width:38px;height:38px;border-radius:50%;background:${c.color};display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#fff">${c.init}</div>
      ${c.unread>0?`<div style="position:absolute;top:-2px;right:-2px;width:16px;height:16px;background:var(--red);border-radius:50%;font-size:9px;font-weight:800;color:#fff;display:flex;align-items:center;justify-content:center;border:2px solid #fff">${c.unread}</div>`:''}
    </div>
    <div style="flex:1;min-width:0">
      <div style="display:flex;justify-content:space-between"><span style="font-size:13px;font-weight:700">${c.name}</span><span style="font-size:10px;color:var(--text3)">${c.time}</span></div>
      <div style="font-size:11px;color:var(--text3)">${c.role}</div>
      <div style="font-size:11px;color:var(--text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.last}</div>
    </div>
  </div>`).join('');
}

function activityLog() {
  return [
    ['ORD-LAG-2849','In Transit','Balogun → Lekki','just now'],
    ['ORD-IBD-0420','Delivered','Bodija → UI Rd','18s ago'],
    ['USR-NEW','Customer registered','Ibadan · Active','32s ago'],
    ['ORD-LAG-2848','Payment received','₦3,400 via Paystack','1m ago'],
    ['ORD-LAG-2847','Picked Up','Rider en route','1m ago'],
    ['USR-RDR','Rider signup','Lagos · Pending KYC','2m ago'],
    ['ORD-IBD-0419','Order cancelled','Refund initiated','3m ago'],
    ['ORD-LAG-2845','Delivered','Yaba → VI','4m ago'],
  ].map(([ref,event,detail,time])=>`
  <div style="display:flex;gap:8px;align-items:center;padding:7px 10px;background:var(--white);border-radius:6px;border:1px solid var(--border);font-size:11px">
    <span class="mono" style="color:var(--red);min-width:90px">${ref}</span>
    <span style="flex:1;font-weight:600">${event}</span>
    <span style="color:var(--text3)">${detail}</span>
    <span style="color:var(--text3);white-space:nowrap;margin-left:6px">${time}</span>
  </div>`).join('');
}

// ─── STYLES ─────────────────────────────────────────────────
function injectSupportStyles() {
  if (document.getElementById('support-styles')) return;
  const s = document.createElement('style');
  s.id = 'support-styles';
  s.textContent = `
    .support-sidebar { width:260px;border-right:1px solid var(--border);background:var(--white);display:flex;flex-direction:column;flex-shrink:0; }
    .conv-item { display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer;border-bottom:1px solid rgba(226,232,240,.5);transition:background .15s; }
    .conv-item:hover { background:var(--bg); }
    .conv-item.active { background:rgba(231,76,60,.04);border-left:3px solid var(--red); }
    .chat-bubble { display:flex;flex-direction:column;max-width:72%; }
    .chat-bubble.user   { align-self:flex-end;align-items:flex-end; }
    .chat-bubble.ai     { align-self:flex-start;align-items:flex-start; }
    .chat-bubble.system { align-self:center;align-items:center;max-width:90%; }
    .bubble-inner { padding:10px 14px;border-radius:14px;font-size:13px;line-height:1.55; }
    .chat-bubble.user   .bubble-inner { background:var(--red);color:#fff;border-bottom-right-radius:4px; }
    .chat-bubble.ai     .bubble-inner { background:var(--white);border:1.5px solid var(--border);color:var(--text);border-bottom-left-radius:4px; }
    .chat-bubble.system .bubble-inner { background:rgba(139,92,246,.08);border:1px solid rgba(139,92,246,.2);color:#8b5cf6;font-size:12px;border-radius:8px; }
    .bubble-meta { font-size:10px;color:var(--text3);margin-top:4px;padding:0 4px; }
    .typing-indicator { display:flex;gap:4px;align-items:center;padding:4px 0; }
    .typing-dot { width:7px;height:7px;border-radius:50%;background:var(--text3);animation:typingBounce 1.2s infinite; }
    .typing-dot:nth-child(2){animation-delay:.2s}.typing-dot:nth-child(3){animation-delay:.4s}
    @keyframes typingBounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
    .quick-chip { padding:5px 12px;border-radius:50px;border:1.5px solid var(--border);background:var(--white);font-size:12px;font-weight:600;cursor:pointer;transition:all .15s;font-family:'Plus Jakarta Sans',sans-serif;color:var(--text); }
    .quick-chip:hover { border-color:var(--red);color:var(--red); }
    @media(max-width:768px){ .support-sidebar{display:none;} }
  `;
  document.head.appendChild(s);
}

# OffScape Logistics — Complete Frontend Documentation

**Version:** 1.0  
**Architecture:** Vanilla JS Single-Page Application (SPA)  
**Total files:** 17  
**Total lines of code:** ~5,900  
**Cities served:** Ibadan & Lagos, Nigeria  

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & Design Philosophy](#2-architecture--design-philosophy)
3. [File Structure](#3-file-structure)
4. [Design System & CSS Architecture](#4-design-system--css-architecture)
5. [The SPA Router — app.js](#5-the-spa-router--appjs)
6. [Global State — window.OS](#6-global-state--windowos)
7. [Authentication Layer](#7-authentication-layer)
8. [API Client — api.js](#8-api-client--apijs)
9. [Landing Page](#9-landing-page)
10. [Sign In View](#10-sign-in-view)
11. [Sign Up View](#11-sign-up-view)
12. [Customer Dashboard](#12-customer-dashboard)
13. [Merchant Dashboard](#13-merchant-dashboard)
14. [Rider Dashboard](#14-rider-dashboard)
15. [Admin Dashboard](#15-admin-dashboard)
16. [Support Dashboard](#16-support-dashboard)
17. [The Five Role Tags](#17-the-five-role-tags)
18. [GPS & Live Tracking System](#18-gps--live-tracking-system)
19. [Responsive Design & Mobile Behaviour](#19-responsive-design--mobile-behaviour)
20. [Backend Contract — Every Plug Point](#20-backend-contract--every-plug-point)
21. [Global Utilities Reference](#21-global-utilities-reference)
22. [How to Run Locally](#22-how-to-run-locally)

---

## 1. Project Overview

OffScape is a logistics marketplace built for Lagos and Ibadan. It connects three primary participants — **customers** who need packages delivered, **merchants** who need to ship goods, and **riders** who perform the deliveries — under a single platform that charges a 5% platform fee on every transaction. Two support roles — **admin** and **support agent** — operate the platform from behind the scenes.

The frontend is a pure vanilla JavaScript SPA. There is no React, no Vue, no build step, no bundler, and no `node_modules` on the frontend. You open `index.html` in a browser and everything works. This was an intentional choice: it makes the codebase simple to understand, easy to modify, and trivial to deploy to any static file host.

The frontend is **entirely complete** and currently runs on mock data. Every place where real data needs to come from a backend is marked as a `showToast()` call or a hardcoded array. The `js/api.js` file defines the full API surface as a set of `async` functions ready to be called — you simply replace the mock with the real call and the UI responds.

---

## 2. Architecture & Design Philosophy

The application follows a simple three-layer mental model. The **router** (`app.js`) owns the URL and decides which view to render. The **views** (`js/views/*.js`) each own a single page — they render HTML into the `#app-container` div and attach their own event listeners. The **API client** (`js/api.js`) and **auth state** (`js/auth.js`) are shared utilities that all views import when they are ready to talk to a backend.

Every view is a plain JavaScript object that exports a single `render(container)` method. When the router activates a route, it calls `View.render(document.getElementById('app-container'))`, and the view takes over that DOM node completely. This approach means there is zero dependency between views — the Customer dashboard has no idea the Rider dashboard exists, and they cannot interfere with each other's event listeners.

Dashboards are loaded **lazily** using dynamic `import()`. The first time you navigate to `/dashboard/customer`, the browser downloads `dashCustomer.js`. On every subsequent visit it uses a cached reference from the `DashCache` object in `app.js`, so there is no second network round-trip. This keeps the initial page load fast even though the total codebase is large.

The design system uses CSS custom properties defined in `css/global.css`. Every colour, radius, shadow and transition in the project references a `var(--name)`. The primary brand colours are OffScape's red (`#e74c3c`) and navy (`#071620`), exactly matching the existing OffScape website. This means if you ever need to change the brand colour, you change two variables and the entire application updates.

---

## 3. File Structure

```
offscape/
│
├── index.html                  ← SPA shell — the only HTML file
│
├── css/
│   ├── global.css              ← Reset, variables, nav, footer, buttons, badges, toasts
│   ├── auth.css                ← Sign in & sign up page styles
│   ├── landing.css             ← Landing page sections
│   └── dashboard.css           ← All shared dashboard component styles
│
├── js/
│   ├── app.js                  ← Router, global state (window.OS), toast utility
│   ├── api.js                  ← API client — all fetch calls in one place
│   ├── auth.js                 ← JWT token & user object persistence
│   │
│   └── views/
│       ├── landing.js          ← Public marketing page
│       ├── signin.js           ← Sign in with role selector (all 5 roles)
│       ├── signup.js           ← Sign up with dynamic role-specific fields
│       ├── dashCustomer.js     ← Customer dashboard (6 panels)
│       ├── dashMerchant.js     ← Merchant dashboard (6 panels)
│       ├── dashRider.js        ← Rider dashboard (5 panels)
│       ├── dashAdmin.js        ← Admin dashboard (6 panels)
│       └── dashSupport.js      ← Support & AI chatbot dashboard (5 panels)
│
├── FRONTEND_DOCS.md            ← This file
└── BACKEND_GUIDE.md            ← Node.js backend integration guide
```

`index.html` is the only HTML file in the project. It contains the persistent chrome — the sticky header, the mobile drawer, the footer, and the global toast container — and a single `<main id="app-container">` element where every view injects its HTML at runtime. This element is the application's entire canvas.

---
offscape frontend
css folder
auth
dashaboard
global
landing

js folder
api
auth

views folder
dashAdmin
dashCustomer
dashMerchant
dashRider
dashSupport
fogotpassword
kycpending
landing
resetpassword
signin
signup
verifyemail

root
app

root structure
index


## 4. Design System & CSS Architecture

The design system lives in `css/global.css` as a single `:root` block of CSS custom properties. Understanding these variables is the key to understanding the visual language of the entire application.

**Colour palette:**

```css
--red:       #e74c3c   /* Primary brand — buttons, links, accents */
--red-dark:  #c0392b   /* Button hover states */
--red-light: rgba(231,76,60,0.12)  /* Soft backgrounds for selected states */
--navy:      #071620   /* Header, auth left panel, wallet card */
--navy2:     #0e1f2e   /* Slightly lighter navy for cards */
--navy3:     #1c2e3d   /* Hover states on dark surfaces */
--text:      #1e293b   /* Primary body text */
--text2:     #64748b   /* Secondary labels, descriptions */
--text3:     #94a3b8   /* Tertiary — timestamps, meta info */
--border:    #e2e8f0   /* Default card and input borders */
--bg:        #f8fafc   /* Page background, input backgrounds */
--success:   #10b981   /* Green — delivered, online, verified */
--warning:   #f59e0b   /* Amber — in transit, pending, medium priority */
--danger:    #ef4444   /* Red — cancelled, error, suspended */
--blue:      #3b82f6   /* Customer role colour, info states */
```

**Role-specific colours** are intentionally distinct so a user can immediately orient themselves:

```css
--customer-color: #3b82f6   /* Blue */
--merchant-color: #f59e0b   /* Amber */
--rider-color:    #10b981   /* Green */
--admin-color:    #8b5cf6   /* Purple */
--support-color:  #e74c3c   /* Red */
```

**Typography** uses three Google Fonts: `Syne` (800 weight) for all headings and large numbers, giving a strong editorial character; `Plus Jakarta Sans` for all body text and UI labels; and `DM Mono` for order IDs, amounts in monospace context, and code-like values. These are loaded from Google Fonts in `index.html`.

The CSS files are loaded in a specific order in `index.html`: `global.css` first (reset and shared tokens), then `auth.css`, `landing.css`, and `dashboard.css`. Because auth pages and dashboard pages never coexist, there is no CSS conflict. The body-level classes `auth-page` and `dash-page` (set by the router) are used to hide the global header and footer when they are not needed, rather than conditionally mounting them.

---

## 5. The SPA Router — app.js

`app.js` is the heart of the application. It runs first, creates the global `window.OS` state object, registers the global click handler, and then calls `Router._render(location.pathname)` to boot the correct view for the current URL.

**The route table** maps URL paths to named route strings:

```javascript
routes: {
  '/':                   'home',
  '/home':               'home',
  '/signin':             'signin',
  '/signup':             'signup',
  '/dashboard/customer': 'dash:customer',
  '/dashboard/merchant': 'dash:merchant',
  '/dashboard/rider':    'dash:rider',
  '/dashboard/admin':    'dash:admin',
  '/dashboard/support':  'dash:support',
}
```

When `Router.go('/dashboard/customer')` is called, it pushes the path to the browser's history stack via `history.pushState`, then calls `_render`. Inside `_render`, the route string `'dash:customer'` is detected as a dashboard route (it starts with `'dash:'`), the role is extracted, and `_loadDash('customer', container)` is called.

**The auth guard** inside `_loadDash` is the only security enforcement on the frontend. If `OS.currentUser` is `null` when a dashboard route is requested, the router immediately redirects to `/signin`. This guard will become meaningful once the auth state is wired to a real backend — once `AuthState.restore()` (in `auth.js`) rehydrates the user from `localStorage` on page load, this guard will correctly allow or block access on refresh.

**Navigation** throughout the application works through a single global `click` event listener delegated from `document`. Any element in any view can have a `data-nav="/path"` attribute, and clicking it will call `Router.go(path)` without any further code. This means views do not need to import the router — they simply render a `<button data-nav="/signup">` and navigation happens automatically.

**Browser back and forward** buttons are handled by listening to the `popstate` event and calling `Router._render(location.pathname)`. This means the application is fully history-aware — the back button works correctly between pages.

---

## 6. Global State — window.OS

`window.OS` is a deliberately minimal global object that carries just enough state for the application to function. It has two properties and two methods:

`OS.currentUser` holds the currently logged-in user object once authentication succeeds. Its shape matches what the backend will return from the login endpoint:

```javascript
{
  id:       'mongodb-object-id',     // set by backend
  name:     'Amaka Osei',
  role:     'customer',              // 'customer' | 'merchant' | 'rider' | 'admin' | 'support'
  email:    'amaka@email.com',
  city:     'lagos',                 // 'lagos' | 'ibadan'
  initials: 'AO',                   // derived from first + last name initials
  color:    '#3b82f6'               // role colour, used for avatar backgrounds
}
```

`OS.logout()` clears `currentUser`, calls `AuthState.clear()` to remove the token from localStorage, and navigates to `/home`.

`OS.enterDashboard(role)` is called by the signin and signup views after successful authentication. It simply calls `Router.go('/dashboard/' + role)`.

`window.Router` is also exposed globally so that view files can trigger navigation programmatically without importing `app.js`. In practice this is mostly used by the logout buttons and post-action redirections within dashboards.

---

## 7. Authentication Layer

Authentication is split across three files, each with a distinct responsibility.

**`js/auth.js`** manages persistence. `AuthState.save(token, user)` stores the JWT and the user object in `localStorage` under the keys `os_token` and `os_user`, and simultaneously sets `OS.currentUser`. `AuthState.restore()` is called at app boot — it reads those keys, parses the user, and rehydrates `OS.currentUser`. If the token is expired, the backend will reject the first authenticated request, and that rejection will need to trigger `AuthState.clear()` and a redirect to signin. `AuthState.isLoggedIn()` returns a boolean — useful for the auth guard in the router.

**`js/views/signin.js`** renders the sign-in page. The left panel shows OffScape branding and a features list. The right panel contains a role selector (all five roles: customer, merchant, rider, admin, support), an email/phone input, a password input with a show/hide toggle, and a remember-me checkbox. The form currently runs a simulated `setTimeout` mock that creates a demo user object and calls `OS.enterDashboard(selectedRole)`. The mock block is the only thing that needs to be replaced when wiring to the backend — the form validation, error display, button loading state, and routing are all already written.

**`js/views/signup.js`** renders the sign-up page. It shows three roles for public registration (customer, merchant, rider) — admin and support accounts are created directly in the database. When a role is selected, role-specific fields appear dynamically using `.visible` CSS class toggling: merchant accounts show business name, type, address, and CAC number fields; rider accounts show vehicle type, plate number, NIN, and guarantor fields. The password field has a live strength meter with four levels (weak/fair/good/strong) driven by checking length, uppercase, numbers, and symbols. Again, only the mock `setTimeout` block needs replacing.

The **backend contract** for both auth views is identical: the backend should respond with `{ token, user }` where `token` is a JWT and `user` matches the `OS.currentUser` shape described above.

---

## 8. API Client — api.js

`js/api.js` is the single file through which all communication with the backend will flow. It exports six namespaced objects, each grouping related endpoints. Every method returns a `Promise` — they are all async by nature of using `fetch`.

The internal `api(method, path, body)` function handles the mechanics: it reads the JWT from `localStorage`, attaches it as a `Bearer` token in the `Authorization` header, calls `fetch`, parses the JSON response, and throws a meaningful error if the HTTP status is not OK. All views call these exported methods rather than calling `fetch` directly, which means error handling, auth headers, and the base URL are configured in exactly one place.

The six namespaces and their methods are:

`Auth` — `login(email, password, role)`, `signup(payload)`, `me()`. These are the only unauthenticated endpoints (no token attached on login/signup).

`Orders` — `create(payload)`, `getAll()`, `getById(id)`, `cancel(id)`, `confirm(id)`. The `confirm` endpoint is called by the customer to confirm successful delivery, which triggers the rider payout on the backend.

`Riders` — `getAvailable(lat, lng)`, `acceptJob(orderId)`, `updateLocation(lat, lng)`, `goOnline()`, `goOffline()`. These are called exclusively from the Rider dashboard.

`Wallet` — `getBalance()`, `getHistory()`, `initTopup(amount)`, `withdraw(payload)`, `convertAirtime(payload)`. `initTopup` will return a Paystack authorization URL to redirect the user to.

`Admin` — `getStats()`, `getUsers(params)`, `getOrders(params)`, `suspendUser(id)`, `approveKYC(id)`. These methods should only be callable by users whose `role` is `'admin'` — enforcement is on the backend, but the frontend only ever calls them from the Admin dashboard.

`Support` — `getTickets()`, `createTicket(payload)`, `closeTicket(id)`.

**To change the backend URL**, edit the single constant at the top of `api.js`:

```javascript
const BASE_URL = 'http://localhost:4000/api';
// Change to: 'https://your-server.render.com/api'
```

---

## 9. Landing Page

`js/views/landing.js` renders the complete public marketing page. It is injected into `#app-container` when the user visits `/` or `/home`. The global header and footer defined in `index.html` remain visible on this route.

The landing page has six sections. The **hero** section uses a full-height dark panel with the OffScape navy/navy2 gradient, a subtle grid overlay, a radial glow effect in red, an eyebrow badge ("Live in Ibadan & Lagos"), a large headline, subtext, two CTA buttons, and a stats bar showing platform metrics (2,400+ riders, 8k+ daily deliveries, 4.2 min pickup time, ₦0 setup fee).

The **features grid** presents six feature cards in a responsive auto-fit grid: Live GPS Tracking, Paystack Payments, Airtime & Data → Cash, Verified Riders Only, Merchant Marketplace, and Instant Payouts. Each card has an icon, heading, and description.

The **how it works** section has three tabs — For Customers, For Merchants, For Riders — each revealing a four-step grid. Tab switching is handled by the `window.switchHowTab(el, id)` function defined inside the view's `render()` method.

The **role CTA cards** section shows three role cards (Customer, Merchant, Rider) with distinct colour schemes, each linking to `/signup` with a styled button.

The **testimonials grid** shows four cards in a 2×2 layout with customer quotes.

The **final CTA** section is a dark gradient band with a large headline and two buttons.

All buttons and links in the landing page use `data-nav` attributes and are handled by the global click delegate in `app.js` — no JavaScript inside the landing view is needed for navigation.

---

## 10. Sign In View

`js/views/signin.js` renders the sign-in page in a full-height two-column grid (left brand panel, right form panel) with the `.auth-container` layout defined in `auth.css`. The global header and footer are hidden on this route.

The **role selector** at the top of the form is a visual grid of five cards — Customer, Merchant, Rider, Admin, and Support. Clicking a card removes the `active` class from all cards and adds it to the clicked one, updating the `selectedRole` local variable. This role variable is what gets passed to the backend login endpoint, because the same email could theoretically exist as both a customer and a merchant account.

The **email/phone field** accepts either format. The **password field** has a show/hide toggle button (`👁️/🙈`) that flips the input's `type` between `password` and `text`. The **remember me checkbox** is rendered but currently has no backend-wired behaviour — when the backend is connected, checking this box should affect whether the JWT is stored in `localStorage` (persistent) or `sessionStorage` (session-only).

The **form submission handler** `window.handleSignIn(event)` currently:

1. Validates that both fields are filled, shows an inline error if not.
2. Sets the button to a loading state (disables it, shows spinner, changes text).
3. Runs a 1200ms `setTimeout` mock that creates a demo user and calls `OS.enterDashboard(selectedRole)`.

The mock block (steps 3 onward) is the exact block to replace with a real API call.

**WhatsApp shortcut** at the bottom opens a pre-filled `wa.me` link — a low-friction way for users in Nigeria to reach support without an account.

---

## 11. Sign Up View

`js/views/signup.js` renders the sign-up page in the same two-column auth layout. It offers three public roles (Customer, Merchant, Rider).

**Dynamic role fields** appear and disappear as the user switches roles. Merchant fields include: business name, business type (dropdown), business address, and CAC registration number (optional). Rider fields include: vehicle type (dropdown), vehicle model, plate number, NIN, guarantor name, and guarantor phone. This conditional display is implemented by toggling the `.visible` class on a div with class `.role-fields`, which is set to `display:none` by default in `auth.css` and `display:flex` when `.visible` is applied.

**The password strength meter** evaluates four criteria — length ≥8, contains uppercase, contains a number, contains a symbol — and scores the password from 0 to 4. The `pw-strength-fill` div's width and background colour update live as the user types: 0%/transparent for empty, 25%/red for weak, 50%/amber for fair, 75%/blue for good, 100%/green for strong.

**Form validation** checks that all base fields (first name, last name, email, phone, password) are filled and that the password is at least 8 characters before allowing submission. More granular validation (email format, phone format, NIN format) is commented out but can be added per field using the `data-validate` attribute pattern already on the inputs.

The mock `setTimeout` block is in the same structural position as in signin — replace it with a real `Auth.signup(payload)` call once the backend is ready.

---

## 12. Customer Dashboard

`js/views/dashCustomer.js` is the most feature-rich dashboard for end users. It renders inside the `#app-container` and manages six panels: Overview, Place Order, Track Order, My Orders, Wallet, and Airtime → Cash. The global header and footer are hidden on all dashboard routes.

**Navigation** works through the `.dash-topbar` horizontal tab bar on desktop (hidden below 768px) and the `.mobile-bottom-nav` fixed bottom navigation bar on mobile (hidden above 768px). The `window.cPanel(panel, el)` function switches between panels by toggling `active` CSS classes. It also triggers map initialisation when navigating to `track` or `overview` panels.

**Overview panel** shows four stat cards (active orders, total spent, all-time deliveries, wallet balance), a mini map with the live rider marker on an Ibadan route, a quick actions column, and a recent orders list. Every stat card value is a hardcoded mock number ready to be replaced.

**Place Order panel** implements a four-step flow using the `.order-progress` component. Step 1 collects pickup details (city, address, sender phone), delivery details (city, address, recipient phone), and package info (category, speed, weight, item value for insurance). The `window.calcOrderPrice()` function recalculates the price breakdown live as the user changes any dropdown or input — it computes base fee from category, applies a speed multiplier, adds weight surcharge above 2kg, calculates the 5% platform fee, and optionally adds insurance. Step 2 shows a confirmation summary and three payment method options (Paystack, OffScape Wallet, Pay on Delivery). Step 3 shows a success screen. The `nextOStep()`, `prevOStep()`, and `doPayment()` functions manage step transitions.

**Track Order panel** shows a full-size Leaflet map centred on Ibadan with three markers: a pickup marker (amber) at Dugbe Market coordinates, a delivery marker (blue) at Bodija Estate coordinates, and a rider emoji marker (🛵) that animates along the `RIDER_ROUTE` array every 3 seconds using `setInterval`. Below the map is the delivery timeline component showing five status stages with done/active/pending visual states, and the rider info card with call and message buttons.

**My Orders panel** renders an HTML `<table>` with the class `.dash-table`. Each row contains the order ID in monospace red, route, package type, amount, a colour-coded status badge, and date. This table is populated from a hardcoded array — replace with `await Orders.getAll()`.

**Wallet panel** shows the wallet card (navy gradient with ₦ watermark), a fund-via-Paystack form with preset amount chips (₦1,000, ₦2,000, ₦5,000, ₦10,000), and a transaction history list. All values are mock.

**Airtime → Cash panel** has two sections. The airtime converter shows a network selector grid (MTN, Airtel, Glo, 9mobile), a rate display that updates when a network is selected (`cSelNet(el, rate, name)`), an amount input that shows the calculated wallet credit live (`calcA2C()`), and a confirm button. The data bundle converter shows a bundle size selector whose value drives `calcDataConv()`. Both have recent conversion history lists.

---

## 13. Merchant Dashboard

`js/views/dashMerchant.js` manages six panels: Overview, Post Shipment, Active Deliveries, History, Wallet, and Analytics. Navigation uses `window.mPanel(panel, el)`.

**Overview panel** shows four stat cards (active shipments, monthly revenue, deliveries done, platform fees paid), two active delivery job cards with pickup/delivery routes and rider info, and a live Leaflet map (`mOverviewMap`) showing the merchant's store, a customer location, and a rider in transit.

**Post Shipment panel** is split into a form column (goods description, category, weight, quantity, value, fragile handling, pickup address, delivery address, customer name and phone, deadline) and a pricing/rider column. The pricing column shows a live price breakdown and a list of three nearby available riders with Assign buttons. The pricing mode selector (auto-match, budget, open bidding) is rendered but currently has no dynamic logic — it will drive the backend matching algorithm.

**Active Deliveries panel** shows up to three concurrent job cards with full route display and inline call/map icon buttons, alongside a second map (`mActiveMap`) showing all active riders simultaneously.

**History panel** shows a searchable, filterable table with columns for order ID, route, goods, amount, platform fee (shown in amber to keep fee transparency visible), rider, status, and date.

**Wallet panel** is identical in structure to the customer wallet but with a higher balance and a "business escrow" account label. It adds a monthly fee summary card breaking down gross revenue, platform fees, and net revenue, plus a full transaction log including both customer payments and platform fee deductions on each.

**Analytics panel** has a weekly delivery volume bar chart (the last bar for "Today" is always highlighted with the `.today` class), a top routes breakdown with percentage progress bars, a top riders table with an assign shortcut, and a package category breakdown.

---

## 14. Rider Dashboard

`js/views/dashRider.js` manages five panels: Dashboard (overview), Available Jobs, Active Delivery, Earnings, and My Profile. Navigation uses `window.rPanel(panel, el)`.

**Dashboard panel** shows four stat cards (today's earnings, trips today, rating, monthly earnings), a top job request card with full route info and earnings breakdown, an online/offline toggle, a GPS map showing the rider's current position and a nearby pickup point, and a today's summary row (online time, distance, avg rating, net earned).

The **online/offline toggle** is a styled div that responds to `window.toggleOnline()`. It toggles the background between green and `--border2`, moves the knob via inline style, updates the status badge in the topbar, and shows a toast. When wiring to the backend, `toggleOnline` should call `Riders.goOnline()` or `Riders.goOffline()`.

**Available Jobs panel** lists five job cards sorted by distance. Each card shows the job title, order ID, time since posted, gross pay and net pay after fee, from/to addresses with distances, estimated time, weight, speed type, and the platform fee deduction note. Each card has an Accept and a Skip button. `window.acceptJobById(id, title, net)` sets the active job state and navigates to the Active Delivery panel.

**Active Delivery panel** has two states. When no job is accepted, it shows an empty state with a "Browse Available Jobs" button. When a job is accepted, it shows the delivery destination card, package info card, earnings breakdown, three action buttons (Confirm Delivery, Call, Message, Report Issue), and a full-size navigation map (`rActiveMap`) with the rider marker animating along the route. `window.confirmDelivery()` clears the active state and returns to the empty state.

**Earnings panel** shows the weekly bar chart (identical in structure to the merchant analytics chart), the rider wallet card with instant withdrawal form (bank selector, amount field, preset chips), and a recent trips table showing gross/fee/net for each delivery.

**Profile panel** is a two-column layout. The left column has an editable personal info form and a vehicle details form. The right column has the online toggle card, a KYC document verification table (all five documents showing ✓ Verified), and a performance stats table (rating, completion rate, on-time rate, total deliveries, and top rider badge).

---

## 15. Admin Dashboard

`js/views/dashAdmin.js` manages six panels: Overview, All Orders, Users, Riders, Finance, and Settings. The topbar gradient is purple/dark-indigo rather than red/navy to visually distinguish admin from other roles. Navigation uses `window.aPanel(panel, el)`.

**Overview panel** has four KPI cards (platform revenue today, active orders live, riders online, platform fees today), a live order feed div (`#liveFeed`) that auto-prepends new entries every 3.5 seconds via `setInterval`, a city breakdown bar chart (Lagos 68% / Ibadan 32%), an hourly volume bar chart, a platform health monitor table (API latency, Paystack, GPS, SMS, DB), and a recent signups table with approve/reject actions per pending KYC rider.

**All Orders panel** has search, city, status, and date-range filters, and a 10-column table showing every order across all users with customer, merchant, rider, route, GMV, fee, status, city, and action buttons. A "Resolve" button appears on disputed orders.

**Users panel** manages customers and merchants. Four stat cards show total users, customer count, merchant count, and 30-day active percentage. The user table has columns for name, role badge, city, order count, spend/revenue, join date, status, and action buttons (View, Suspend/Reactivate/Approve depending on current status).

**Riders panel** has two sub-sections: a KYC verification queue table where admins can approve or reject pending riders, and an active riders table showing real-time trip count, earnings, and in-transit status per rider with a Suspend button per row.

**Finance panel** has four KPI cards (GMV, platform revenue, rider payouts, pending payouts), a monthly revenue bar chart, a pending payouts queue where each rider's outstanding payout can be triggered individually or all at once via "Process All Payouts", and a full transaction ledger table.

**Settings panel** has four sections: platform fee editor (percentage inputs for standard fee and express premium), airtime conversion rates grid (one input per network), city/zone configuration, integrations status panel (Paystack, GPS, SMS, Claude AI, Analytics), and notification toggle switches.

---

## 16. Support Dashboard

`js/views/dashSupport.js` is the most structurally unique dashboard. It has a persistent split-pane layout inside the AI Assistant panel, and five total panels: AI Assistant, Tickets, Live Monitor, User Lookup, and Knowledge Base. Navigation uses `window.sPanel(panel, el)`.

**AI Assistant panel** is a full-height flex layout that shows a conversation sidebar on the left and a chat window on the right. The sidebar shows a list of six active conversations with role labels, unread message badges, and last-message previews. The chat window has a header (user name, role badge, order reference, AI Active badge, Take Over button), a scrollable messages area, and a text input area.

The messages area uses three bubble variants: `.chat-bubble.user` (red background, right-aligned), `.chat-bubble.ai` (white with border, left-aligned), and `.chat-bubble.system` (purple tint, centred). A typing indicator uses three `.typing-dot` elements animated with a staggered bounce (`typingBounce` keyframe).

**The AI assistant is wired live to the Anthropic Claude API.** `window.sendSupportMessage()` appends a user bubble, shows the typing indicator, and calls `callClaude(message)` which `fetch`es `https://api.anthropic.com/v1/messages` with `claude-sonnet-4-20250514`. The system prompt instructs Claude to act as an OffScape support agent, citing the 5% fee, refund policy, airtime conversion rates, and escalation triggers. The response text is rendered as a new AI bubble. If the API call fails, a system bubble with a fallback message appears instead.

`window.toggleAI()` switches between AI mode and agent mode. In agent mode, the AI status badge changes to "Agent Mode" (blue), a blue banner appears above the input, and `sendSupportMessage()` skips the API call — the agent's reply is injected directly as a user bubble.

Quick reply chips auto-fill the input field. The "Use →" buttons on Knowledge Base scripts call `window.useScript(text)` which navigates to the chat panel and fills the input.

**Tickets panel** shows four stat cards, a filterable ticket table, and a 6-card resolved-today grid.

**Live Monitor panel** has four counters that update every 5 seconds via `setInterval` (fluctuating slightly around realistic values), an activity log that prepends a new event every 2.5 seconds, a system status table, an active alerts section with action buttons, and a quick actions column including an emergency broadcast button gated behind a `confirm()` dialog.

**User Lookup panel** shows a search bar, three recent lookup cards, and an empty profile panel on the right. Clicking a recent lookup card calls `window.showUserCard(name, role, color, init, count)` which injects a full profile card with four action buttons into the right panel.

**Knowledge Base panel** shows four category cards (Payments, Delivery Issues, Rider Management, Merchant Support), each with five drillable article links, a view-all button, the AI system prompt displayed in a dark terminal-style box, and four quick response script cards.

---

## 17. The Five Role Tags

Every dashboard renders a role badge in the topbar. These badges use the `.role-badge` class with a role-specific modifier:

```html
<span class="role-badge customer">🛍️ CUSTOMER</span>
<span class="role-badge merchant">🏪 MERCHANT</span>
<span class="role-badge rider">🛵 RIDER</span>
<span class="role-badge admin">🔐 ADMIN</span>
<span class="role-badge support">🤖 SUPPORT</span>
```

Each modifier maps to a colour defined by the role variables in the CSS. They also appear in the Users, Riders, and Support tables to visually distinguish record types at a glance. The role badge pattern is intentionally reusable — any view can render one with just a class name.

---

## 18. GPS & Live Tracking System

The GPS simulation is built on Leaflet.js (`leaflet@1.9.4`), loaded from the unpkg CDN in `index.html`. OpenStreetMap tiles are fetched from CartoDB's light tile server (`basemaps.cartocdn.com/light_all`).

Each dashboard that uses a map defines its own map registry object (`cMaps`, `mMaps`, `rMaps`) to track active Leaflet instances. Before creating a new map, the code checks whether a map already exists for that element ID, removes it if so, and creates a fresh one. This prevents the "Map container already initialized" error that Leaflet throws if you try to initialise the same div twice.

**Custom markers** are Leaflet `divIcon` instances — small HTML divs with inline styles rather than PNG images. This keeps dependencies zero and allows colour to be set programmatically. Pickup markers are amber, delivery markers are blue, and rider markers are a 🛵 emoji.

**The rider route simulation** uses an array of `[lat, lng]` waypoints and a `setInterval` that advances the marker one waypoint every 2–3 seconds. In `dashCustomer.js`, the `RIDER_ROUTE` array traces a path across Ibadan from Dugbe Market coordinates toward Bodija Estate. The current step index (`cRiderStep`) is maintained in module scope and is shared between the mini map on the overview panel and the full map on the tracking panel.

**When the real backend is connected**, you remove the `setInterval` simulation and add a Socket.IO listener instead:

```javascript
// Add this inside initTrackMap(), alongside your existing Leaflet setup
const socket = io('https://your-server.render.com');
socket.emit('watch:order', realOrderId);
socket.on('rider:moved', ({ lat, lng }) => rm.setLatLng([lat, lng]));
```

The rest of the map code — marker creation, polyline, popup binding — stays exactly as written.

---

## 19. Responsive Design & Mobile Behaviour

The application has three distinct layout modes: desktop (≥1024px), tablet (768px–1023px), and mobile (<768px).

**On desktop**, dashboards show the horizontal `.dash-nav-tabs` tab bar across the top of the content area. The landing page shows a full four-column footer grid and the full hero stats bar. The auth pages show the two-column left/right split. The support dashboard shows the conversation sidebar.

**On tablet**, the footer collapses to a two-column grid. The hero stats wrap onto two rows. The auth left panel is hidden and the form takes full width. The dashboard two-column grid (`g2`) collapses to single column.

**On mobile** (<768px), the `.dash-nav-tabs` bar is hidden entirely and replaced by the `.mobile-bottom-nav` fixed footer nav. The `dashboard.css` adds 80px of bottom padding to `.dash-content` to prevent content from being obscured by this nav bar. The hamburger button in the header triggers the slide-in `.mobile-drawer`. Stats grids collapse from four columns to two columns. The support conversation sidebar is hidden on mobile.

The mobile bottom nav mirrors the top tabs exactly in terms of what `cPanel` / `mPanel` / `rPanel` calls it makes — the `data-mpanel` attribute on each button matches the `data-panel` attribute on the corresponding top tab, and the active state is managed across both sets of elements in the panel switcher function.

---

## 20. Backend Contract — Every Plug Point

This section catalogs every single location in the frontend where a real backend call needs to be substituted. The pattern is always the same: find the `showToast` mock or hardcoded data, replace it with an `await ApiNamespace.method()` call, handle the result.

**Authentication (signin.js and signup.js)**

Both views have a mock `setTimeout` block inside their submit handlers. The backend must return `{ token: string, user: { id, name, role, email, city, initials } }` from both `POST /api/auth/login` and `POST /api/auth/signup`. After a successful response, call `AuthState.save(token, user)` then `OS.enterDashboard(user.role)`.

**Customer dashboard (dashCustomer.js)**

The order placement flow (`doPayment()`) should call `Orders.create(payload)` where `payload` collects all form field values. The mock currently just shows a success toast. The real call should also handle the Paystack redirect when `paymentMethod === 'paystack'` — the backend returns an `authorization_url` which you redirect to with `window.location.href = authorization_url`. Order history (`cp-orders` panel) should populate from `await Orders.getAll()`. Wallet balance should come from `await Wallet.getBalance()`. Airtime conversion should call `await Wallet.convertAirtime({ network, amount })`. The wallet top-up "Pay with Paystack" button should call `await Wallet.initTopup(amount)` and redirect.

**Merchant dashboard (dashMerchant.js)**

The Post Shipment "Post Shipment & Match Rider" button should call `Orders.create({ ...formData, merchant: OS.currentUser.id })`. Active deliveries should come from `Orders.getAll()`. Analytics and revenue numbers should come from a merchant-specific stats endpoint you define (suggest `GET /api/merchant/stats`). The Assign rider buttons should call a rider assignment endpoint (suggest `PATCH /api/orders/:id/assign` with a `riderId` body).

**Rider dashboard (dashRider.js)**

Available jobs should come from `Riders.getAvailable(lat, lng)` where `lat` and `lng` come from `navigator.geolocation.getCurrentPosition`. The Accept button should call `Riders.acceptJob(orderId)`. The Confirm Delivery button should call `Orders.confirm(orderId)`. The online/offline toggle should call `Riders.goOnline()` and `Riders.goOffline()`. Earnings history should populate from `Wallet.getHistory()`. The Withdraw button should call `Wallet.withdraw({ bankCode, accountNumber, amount })`.

**Admin dashboard (dashAdmin.js)**

The Overview KPI numbers should come from `Admin.getStats()`. The orders table should be populated from `Admin.getOrders({ city, status, page })`. User tables should come from `Admin.getUsers({ role, status, search })`. Approve KYC buttons should call `Admin.approveKYC(riderId)`. Suspend/reactivate buttons should call `Admin.suspendUser(userId)`. The Finance payout queue should come from a `GET /api/admin/payouts` endpoint you define.

**Support dashboard (dashSupport.js)**

The AI chat is already live and needs no backend change. Ticket data should come from `Support.getTickets()`. User lookup search should call `Admin.getUsers({ search: query })`. Ticket close/assign buttons should call `Support.closeTicket(id)`. Live monitor counters should come from a websocket or a polling `GET /api/admin/stats` call.

---

## 21. Global Utilities Reference

These functions are available on `window` from any view without importing anything.

`window.showToast(msg, type)` — Appends a toast notification to `#toast-container`. `type` is `'success'` | `'error'` | `'info'` | `'warning'`. The toast auto-removes after 3500ms with a fade-out transition. Defined in `app.js`.

`window.OS` — Global state object. `OS.currentUser` is the logged-in user. `OS.logout()` clears state and goes home. `OS.enterDashboard(role)` navigates to the correct dashboard. Defined in `app.js`.

`window.Router` — The router instance. `Router.go('/path')` is the primary navigation method. `Router._render(path)` re-renders the current path without pushing a history entry (used by the `popstate` handler). Defined in `app.js`.

`window.cPanel(panel, el)` — Customer dashboard panel switcher. Defined inside `CustomerDashView.render()`.

`window.mPanel(panel, el)` — Merchant dashboard panel switcher. Defined inside `MerchantDashView.render()`.

`window.rPanel(panel, el)` — Rider dashboard panel switcher. Defined inside `RiderDashView.render()`.

`window.aPanel(panel, el)` — Admin dashboard panel switcher. Defined inside `AdminDashView.render()`.

`window.sPanel(panel, el)` — Support dashboard panel switcher. Defined inside `SupportDashView.render()`.

All five panel switchers follow the same signature: `panel` is the string ID suffix (e.g., `'overview'`), and `el` is the clicked DOM element whose `data-panel` or `data-mpanel` attribute is used to synchronise the active state between the top tab bar and the mobile bottom nav.

---

## 22. How to Run Locally

Because there is no build step, running the frontend locally requires only a static file server — a bare `file://` URL will not work because ES modules (`import`/`export`) are blocked by the browser's CORS policy on the `file:` protocol.

**Option 1 — Python (zero dependencies):**

```bash
cd offscape
python3 -m http.server 3000
# Visit http://localhost:3000
```

**Option 2 — Node.js `serve` package:**

```bash
npx serve offscape -p 3000
# Visit http://localhost:3000
```

**Option 3 — VS Code Live Server:**

Install the Live Server extension, right-click `index.html`, and choose "Open with Live Server". It will also auto-reload on save.

**Demo login** — The current mock accepts any non-empty email and password. Select a role card and click Sign In. The application will simulate a 1.2 second authentication delay and redirect you to the selected role's dashboard.

**Testing all five roles in sequence** — Open five browser tabs, each at `http://localhost:3000/signin`, select a different role in each, and sign in. You will see how the topbar colour, role badge, navigation tabs, and dashboard content differ for each role.

**Production deployment** — Copy the `offscape/` folder to any static host. On Cloudflare Pages, Netlify, or Vercel, set the 404 fallback to `/index.html` so that deep links like `https://yoursite.com/dashboard/customer` are handled by the SPA router rather than returning a 404 from the server.

---

*OffScape Frontend Documentation — Written alongside the codebase, reflecting its exact implementation as built.*
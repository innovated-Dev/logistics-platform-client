// ==================== API.JS — Fixed ====================
// All fixes applied:
// 1. Role-split auth endpoints
// 2. Email-based login (not phone)
// 3. Orders.confirm(id, otp) with OTP param
// 4. Orders.arrivedAtDelivery method added
// 5. Riders.uploadKycDoc FormData uploader added
// 6. Wallet.getBalance alias + settleCodDebit + getCodDebit
// 7. Zones.getAll alias

const BASE_URL = window.OS?.BASE_URL || 'http://localhost:4000';

async function api(method, path, body) {
  const token = localStorage.getItem('os_token');
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  };
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  if (body && !['GET', 'HEAD'].includes(method)) opts.body = JSON.stringify(body);

  const res  = await fetch(`${BASE_URL}/api${path}`, opts);
  const data = await res.json();

  if (!res.ok) {
    // Create error with message but ALSO attach the full response data
    const err = new Error(data.message || data.error || `Request failed (${res.status})`);
    // Copy all response fields onto the error object
    // This means err.emailUnverified, err.kycPending etc. all work in catch blocks
    Object.assign(err, data);
    throw err;
  }
  return data.data ?? data;
}

// ── FIX 1, 2: AUTH — role-split endpoints, email-based login ──
export const AuthAPI = {
  // Signup by role
  signupCustomer: (body) => api('POST', '/auth/customer/signup', body),
  signupMerchant: (body) => api('POST', '/auth/merchant/signup', body),
  signupRider:    (body) => api('POST', '/auth/rider/signup',    body),

  // Login by role — sends { email, password }
  loginCustomer: (email, password) => api('POST', '/auth/customer/login', { email, password }),
  loginMerchant: (email, password) => api('POST', '/auth/merchant/login', { email, password }),
  loginRider:    (email, password) => api('POST', '/auth/rider/login',    { email, password }),

  // Common auth flows
  logout:             ()           => api('POST',  '/auth/logout'),
  forgotPassword:     (email)      => api('POST',  '/auth/forgot-password', { email }),
  verifyResetOTP:     (email, otp) => api('POST',  '/auth/verify-reset-otp', { email, otp }),
  resendResetOTP:     (email)      => api('POST',  '/auth/resend-reset-otp', { email }),
  resetPassword:      (password, passwordConfirm) =>
                                      api('POST',  '/auth/reset-password', { password, passwordConfirm }),
  verifyEmail:        (token)      => api('GET',   `/auth/verify-email?token=${token}`),
  resendVerification: (email)           => api('POST',  '/auth/resend-verification'),
  getMe:              ()           => api('GET',   '/auth/me'),
  refresh:            ()           => api('POST',  '/auth/refresh'),
  changePassword:     (currentPassword, newPassword) =>
                                      api('PATCH', '/auth/change-password', { currentPassword, newPassword }),
};

// ── ORDERS — FIX 3, 4 ──
export const Orders = {
  create:              (body)                => api('POST',  '/orders', body),
  quote:               (body)               => api('POST',  '/orders/quote', body),
  getAll:              (params = {})         => api('GET',   `/orders?${new URLSearchParams(params)}`),
  getOne:              (id)                  => api('GET',   `/orders/${id}`),
  cancel:              (id, reason)          => api('PATCH', `/orders/${id}/cancel`, { reason }),
  // FIX 3: confirm now accepts otp for COD orders
  confirm:             (id, otp)             => api('PATCH', `/orders/${id}/confirm`, otp ? { otp } : {}),
  // FIX 4: arrivedAtDelivery was missing entirely
  arrivedAtDelivery:   (id)                  => api('PATCH', `/orders/${id}/arrived`),
  rate:                (id, rating, comment) => api('PATCH', `/orders/${id}/rate`, { rating, comment }),
  submitBid:           (id, amount, note)    => api('POST',  `/orders/${id}/bid`, { amount, note }),
};

// ── WALLET — FIX 6 ──
export const Wallet = {
  get:           ()             => api('GET',  '/wallet'),
  // FIX 6a: alias — rider dashboard calls Wallet.getBalance()
  getBalance:    ()             => api('GET',  '/wallet'),
  topup:         (amount)       => api('POST', '/wallet/topup', { amount }),
  verifyTopup:   (ref)          => api('GET',  `/wallet/verify?ref=${ref}`),
  withdraw:      (body)         => api('POST', '/wallet/withdraw', body),
  verifyBank:    (body)         => api('POST', '/wallet/verify-bank', body),
  listBanks:     ()             => api('GET',  '/wallet/banks'),
  airtime:       (body)         => api('POST', '/wallet/airtime', body),
  transactions:  (params = {})  => api('GET',  `/wallet/transactions?${new URLSearchParams(params)}`),
  // FIX 6b: COD debit methods were missing
  getCodDebit:   ()             => api('GET',  '/wallet/cod-debit'),
  settleCodDebit:()             => api('POST', '/wallet/settle-cod'),
};

// ── RIDERS — FIX 5 ──
export const Riders = {
  // FIX 5: uploadKycDoc didn't exist — KycPendingView calls this
  uploadKycDoc: (documentType, file) => {
    const token = localStorage.getItem('os_token');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('documentType', documentType);
    return fetch(`${BASE_URL}/api/riders/kyc/upload`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}` },
      body:    fd,
      credentials: 'include',
    })
      .then(r => r.json())
      .then(d => {
        if (!d.success) throw new Error(d.message || 'Upload failed');
        return d;
      });
  },
  getKycStatus:    ()          => api('GET',   '/riders/kyc/status'),
  setStatus:       (status)    => api('PATCH', '/riders/status', { status }),
  updateLocation:  (lat, lng, orderId) =>
                                  api('PATCH', '/riders/location', { lat, lng, orderId }),
  getEarnings:     (period)    => api('GET',   `/riders/earnings?period=${period || 'today'}`),
};

// ── ZONES — FIX 7 ──
export const Zones = {
  // FIX 7: rider dashboard calls Zones.getAll(city) — alias for getByCity
  getAll:       (city = 'ibadan') =>
                  api('GET', `/zones?city=${encodeURIComponent(city.toLowerCase())}`),
  getByCity:    (city = 'ibadan') =>
                  api('GET', `/zones?city=${encodeURIComponent(city.toLowerCase())}`),
  getZone:      (address, city)   => api('POST', '/zones/geocode', { address, city }),
  resolveLatLng:(lat, lng)        => api('GET',  `/zones/resolve?lat=${lat}&lng=${lng}`),
};

// ── ADMIN ──
export const Admin = {
  getStats:          ()           => api('GET',   '/admin/stats'),
  getFinance:        (period)     => api('GET',   `/admin/finance${period ? `?period=${period}` : ''}`),
  getUsers:          (params)     => api('GET',   `/admin/users?${new URLSearchParams(params)}`),
  suspendUser:       (id)         => api('PATCH', `/admin/users/${id}/suspend`),
  reactivateUser:    (id)         => api('PATCH', `/admin/users/${id}/reactivate`),
  getOrders:         (params)     => api('GET',   `/admin/orders?${new URLSearchParams(params)}`),
  getDisputes:       ()           => api('GET',   '/admin/disputes'),
  resolveDispute:    (orderId, resolution) =>
                                     api('PATCH', `/admin/disputes/${orderId}/resolve`, { resolution }),
  getKycQueue:       ()           => api('GET',   '/admin/kyc-queue'),
  approveKYC:        (id, body)   => api('PATCH', `/admin/riders/${id}/kyc-approve`, body || {}),
  rejectKYC:         (id, reason) => api('PATCH', `/admin/riders/${id}/kyc-reject`, { reason }),
  getCompensationPool: ()         => api('GET',   '/admin/compensation-pool'),
  topupPool:         (amount)     => api('POST',  '/admin/compensation-pool/topup', { amount }),
  getConfig:         ()           => api('GET',   '/admin/config'),
  updateConfig:      (data)       => api('PATCH', '/admin/config', data),
  getZones:          ()           => api('GET',   '/admin/zones'),
  createZone:        (body)       => api('POST',  '/admin/zones', body),
};

// ── SUPPORT ──
export const Support = {
  getTickets:   ()           => api('GET',  '/support/tickets'),
  createTicket: (body)       => api('POST', '/support/tickets', body),
  sendMessage:  (id, message) => api('POST', `/support/tickets/${id}/message`, { message }),
  closeTicket:  (id, note)   => api('PATCH', `/support/tickets/${id}/close`, { note }),
  escalate:     (id, context) => api('POST', `/support/tickets/${id}/escalate`, { context }),
};
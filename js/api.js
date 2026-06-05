// ==================== API.JS — Fixed ====================
// All fixes applied:
// 1. Role-split auth endpoints
// 2. Email-based login (not phone)
// 3. Orders.confirm(id, otp) with OTP param
// 4. Orders.arrivedAtDelivery method added
// 5. pickmans.uploadKycDoc FormData uploader added
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
  signupPickman:    (body) => api('POST', '/auth/pickman/signup',    body),

  // Login by role — sends { email, password }
  loginCustomer: (email, password) => api('POST', '/auth/customer/login', { email, password }),
  loginMerchant: (email, password) => api('POST', '/auth/merchant/login', { email, password }),
  loginPickman:    (email, password) => api('POST', '/auth/pickman/login',    { email, password }),

  // Common auth flows
  logout:             ()           => api('POST',  '/auth/logout'),
  forgotPassword:     (email)      => api('POST',  '/auth/forgot-password', { email }),
  verifyResetOTP:     (email, otp) => api('POST',  '/auth/verify-reset-otp', { email, otp }),
  resendResetOTP:     (email)      => api('POST',  '/auth/resend-reset-otp', { email }),
  resetPassword:      (password, passwordConfirm) =>
                                      api('POST',  '/auth/reset-password', { password, passwordConfirm }),
  verifyEmail:        (token)      => api('GET',   `/auth/verify-email?token=${token}`),
  resendVerification: (email) => api('POST', '/auth/resend-verification', { email }),
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
  // FIX 6a: alias — pickman dashboard calls Wallet.getBalance()
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

// ── pickmanS — FIX 5 ──
export const Pickmen = {

    getKycRequirements: async () => {
      const res = await api('GET', '/kyc/requirements');
      // Backend returns 'documents', frontend expects 'docs'
      return { docs: res.documents || res.docs, ...res };
    },
    submitKyc:          () => api('POST', '/kyc/submit'),
    getKycStatus:       () => api('GET', '/kyc/status'),
    uploadKycDoc: (docKey, file) => {
    const token = localStorage.getItem('os_token');
    const fd = new FormData();
    fd.append('document', file);
    fd.append('docKey', docKey);
    return fetch(`${BASE_URL}/api/kyc/upload`, {
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
  setStatus:       (status)    => api('PATCH', '/pickmen/status', { status }),
  updateLocation:  (lat, lng, orderId) =>
                                  api('PATCH', '/pickmen/location', { lat, lng, orderId }),
  getEarnings:     (period)    => api('GET',   `/pickmen/earnings?period=${period || 'today'}`),
};

// ── ZONES  ──
export const Zones = {
  // FIX 7: pickman dashboard calls Zones.getAll(city) — alias for getByCity
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
  getKycQueue:     ()              => api('GET',  '/admin/kyc/pending'),
  getKycApp:       (id)            => api('GET',  `/admin/kyc/${id}`),
  getKycDocument:  (id, docKey)    => api('GET',  `/admin/kyc/${id}/document/${docKey}`),
  approveKYC:      (id)            => api('POST', `/admin/kyc/${id}/approve`),
  rejectKYC:       (id, reason)    => api('POST', `/admin/kyc/${id}/reject`, { reason }),
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
import api from './axios'

// ── Auth ─────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh')
}

// ── Products ─────────────────────────────────────────────
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getBySlug: (slug) => api.get(`/products/slug/${slug}`),
  getFilterMeta: () => api.get('/products/filters/meta'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`)
}

// ── Categories ───────────────────────────────────────────
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getBySlug: (slug) => api.get(`/categories/${slug}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`)
}

// ── Search ───────────────────────────────────────────────
export const searchAPI = {
  autocomplete: (q) => api.get('/search', { params: { q, limit: 8 } }),
  fullSearch: (params) =>
    api.get('/search', { params: { ...params, full: 'true' } })
}

// ── Cart ─────────────────────────────────────────────────
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart/add', data),
  update: (data) => api.put('/cart/update', data),
  remove: (productId) => api.delete(`/cart/remove/${productId}`),
  clear: () => api.delete('/cart/clear')
}

// ── Wishlist ─────────────────────────────────────────────
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  getIds: () => api.get('/wishlist/ids'),
  toggle: (productId) => api.post(`/wishlist/toggle/${productId}`)
}

// ── Orders ───────────────────────────────────────────────
export const orderAPI = {
  place: (data) => api.post('/orders', data),
  track: (params) => api.get('/orders/track', { params }),
  getMyOrders: (params) => api.get('/orders/my', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.patch(`/orders/${id}/cancel`),
  return: (id, data) => api.post(`/orders/${id}/return`, data)
}

// ── Admin ────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, data) =>
    api.patch(`/admin/orders/${id}/status`, data),
  handleReturn: (id, data) => api.patch(`/admin/orders/${id}/return`, data),
  getProducts: (params) => api.get('/admin/products', { params }),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, data) => api.patch(`/admin/users/${id}/role`, data)
}

import api from './axios'

// Called after login to merge guest cart into user cart
export const mergeCartOnLogin = async (userId, sessionId) => {
  // The backend handles merge logic via the sessionId header
  // which is already attached by the axios interceptor
  await api.get('/cart')
}

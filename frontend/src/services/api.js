import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8090',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Unwrap response data globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --- API SERVICES ---

export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
};

export const accountAPI = {
  create: (data) => api.post('/api/accounts', data),
  getByUser: (userId) => api.get(`/api/accounts/user/${userId}`),
  getBalance: (accountNo) => api.get(`/api/accounts/${accountNo}/balance`),
  deposit: (data) => api.post('/api/accounts/deposit', data),
  withdraw: (data) => api.post('/api/accounts/withdraw', data),
};

export const transactionAPI = {
  transfer: (data) => api.post('/api/transactions/transfer', data),
  getHistory: (accountNo) => api.get(`/api/transactions/account/${accountNo}`),
};

export const notificationAPI = {
  getByUser: (userId) => api.get(`/api/notifications/user/${userId}`),
  markAsRead: (id) => api.patch(`/api/notifications/${id}/read`),
};

export default api;
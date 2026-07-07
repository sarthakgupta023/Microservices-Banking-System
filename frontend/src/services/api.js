import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8090',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (d) => api.post('/api/auth/register', d),
  login:    (d) => api.post('/api/auth/login', d),
};

export const accountAPI = {
  create:     (d) => api.post('/api/accounts', d),
  getByUser:  (id) => api.get(`/api/accounts/user/${id}`),
  getBalance: (no) => api.get(`/api/accounts/balance/${no}`),
  deposit:    (d) => api.put('/api/accounts/deposit', d),
  withdraw:   (d) => api.put('/api/accounts/withdraw', d),
};

export const transactionAPI = {
  transfer:   (d) => api.post('/api/transactions/transfer', d),
  getHistory: (no) => api.get(`/api/transactions/account/${no}`),
};

export default api;
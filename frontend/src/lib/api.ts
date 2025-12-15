import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/api/auth/login', { username, password });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },

  checkAuth: async () => {
    const response = await api.get('/api/auth/check');
    return response.data;
  },
};

// Registration API
export const registrationAPI = {
  checkCoupon: async (couponNo: string) => {
    const response = await api.get(`/api/registrations/check-coupon/${couponNo}`);
    return response.data;
  },

  searchSimilarNames: async (query: string) => {
    const response = await api.get('/api/registrations/search', {
      params: { query },
    });
    return response.data;
  },

  createRegistration: async (data: { couponNo: string; name: string; mobileNo: string }) => {
    const response = await api.post('/api/registrations', data);
    return response.data;
  },

  getAllRegistrations: async (page: number = 1, limit: number = 50) => {
    const response = await api.get('/api/registrations', {
      params: { page, limit },
    });
    return response.data;
  },

  deleteRegistration: async (couponNo: string) => {
    const response = await api.delete(`/api/registrations/${couponNo}`);
    return response.data;
  },

  getDeletedRegistrations: async (page: number = 1, limit: number = 50) => {
    const response = await api.get('/api/registrations/deleted/all', {
      params: { page, limit },
    });
    return response.data;
  },
};

export default api;

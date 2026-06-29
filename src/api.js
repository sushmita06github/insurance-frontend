import axios from 'axios';

const api = axios.create({
  baseURL: 'https://claims-management-system-626r.onrender.com', // Adjust the port if needed
});

// Add token to every request if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
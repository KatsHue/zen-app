import axios from 'axios';

// baseURL relativa: en dev, Vite hace proxy de /api -> localhost:5000
// en producción, el frontend se sirve desde el mismo origen que la API.
const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // imprescindible para enviar/recibir la cookie httpOnly
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

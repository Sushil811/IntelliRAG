import axios from 'axios';
import { BACKEND_URL } from './config';

/**
 * Pre-configured Axios instance with Base URL & Authorization Interceptor
 */
export const apiClient = axios.create({
  baseURL: BACKEND_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('intellirag_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

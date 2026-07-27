/**
 * Central Backend API Configuration
 * Ensures the API base URL always includes the '/api' prefix
 */
const getApiBaseUrl = (): string => {
  let url = import.meta.env.VITE_API_BASE_URL || 'https://intellirag-an5d.onrender.com/api';
  url = url.trim().replace(/\/+$/, '');
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};

export const BACKEND_URL = getApiBaseUrl();

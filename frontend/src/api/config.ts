/**
 * Central Backend API Configuration
 * Reads VITE_API_BASE_URL environment variable with fallback to local backend server
 */
export const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

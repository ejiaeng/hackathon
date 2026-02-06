// Frontend-to-backend communication config
// Rule: Use Windows local IP (not localhost) for physical device testing
// Replace '192.168.1.X' with your actual backend machine's IP address

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.X:8080';

export const getApiUrl = (endpoint: string) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

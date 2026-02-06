export const getApiUrl = (endpoint: string) => {
  // In a real scenario, you might want to load this from an environment variable
  // or use a specific logic to determine the host.
  // For Capacitor apps on Android, the emulator host is 10.0.2.2.
  // For physical devices, you need the actual local IP of your machine.
  
  const host = process.env.NEXT_PUBLIC_API_HOST || '10.0.2.2'; 
  const port = process.env.NEXT_PUBLIC_API_PORT || '8080';
  
  // Clean up endpoint to ensure it starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `http://${host}:${port}${cleanEndpoint}`;
};

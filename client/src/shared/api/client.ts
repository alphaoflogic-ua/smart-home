import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = (window as any)._accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url?.includes('/auth/login') && 
      !originalRequest.url?.includes('/auth/register') && 
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      
      try {
        // Try to get refreshToken from localStorage (or handle as needed)
        const refreshToken = localStorage.getItem('refreshToken');
        
        const { data } = await axios.post('/api/auth/refresh', { refreshToken }, { withCredentials: true });
        (window as any)._accessToken = data.accessToken;
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        (window as any)._accessToken = null;
        localStorage.removeItem('refreshToken');
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

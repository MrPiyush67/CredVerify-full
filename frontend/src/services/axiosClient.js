import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env?.VITE_API_URL || 'http://localhost:5000/api/',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});


//request 
axiosClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

//response
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      // Dispatch event so UI/store can react
      if (typeof window !== 'undefined' && window?.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
      // Stash redirect path for post-login
      try {
        const currentPath = window?.location?.pathname;
        if (currentPath && currentPath !== '/' && !currentPath.startsWith('/auth')) {
          sessionStorage.setItem('redirectAfterLogin', currentPath);
        }
      } catch (_) { }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;

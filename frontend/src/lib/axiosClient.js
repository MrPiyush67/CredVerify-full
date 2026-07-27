import axios from 'axios';
import { queryClient } from './queryClient.js';

export const axiosClient = axios.create({
  baseURL: import.meta.env?.VITE_API_URL || 'http://localhost:8003/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

//response
axiosClient.interceptors.response.use(
  (response) => {
    // console.log(response);
    console.log(response.data.data);
    return response.data.data;
  },
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      queryClient.setQueryData(['me'], null);
    }

    return Promise.reject(error);
  },
);

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '@/lib/axiosClient.js';

export const useGetMe = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => axiosClient.get('/user/me'),
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => axiosClient.post('/auth/login', data),
    onSuccess: (response) => {
      queryClient.setQueryData(['me'], response);
    },
  });
};

export const useSignup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => axiosClient.post('/auth/signup', data),
    onSuccess: (response) => {
      queryClient.setQueryData(['me'], response);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => axiosClient.post('/auth/logout'),
    onSuccess: () => {
      queryClient.setQueryData(['me'], null);
    },
  });
};

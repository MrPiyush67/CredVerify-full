import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMe, login, logout, signup } from '../services/authService';

export const useGetMe = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      queryClient.setQueryData(['me'], response);
    },
  });
};

export const useSignup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signup,
    onSuccess: (response) => {
      queryClient.setQueryData(['me'], response);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(['me'], null);
    },
  });
};

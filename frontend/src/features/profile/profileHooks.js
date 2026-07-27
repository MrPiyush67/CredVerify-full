import { axiosClient } from '@/lib/axiosClient.js';
import { useQuery } from '@tanstack/react-query';

export const useGetUser = (username) => {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => axiosClient.get(`/user/${username}`),
  });
};

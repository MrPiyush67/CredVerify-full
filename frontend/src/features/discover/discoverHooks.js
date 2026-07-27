import { axiosClient } from '@/lib/axiosClient.js';
import { useQuery } from '@tanstack/react-query';

export const useGetUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: (filters = {}) =>
      axiosClient.get('/user/users', {
        params: filters, // {skip: 20/40/60.. , limit: 20}
      }),
  });
};

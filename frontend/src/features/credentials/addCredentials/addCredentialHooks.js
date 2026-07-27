import { axiosClient } from '@/lib/axiosClient.js';
import { useQuery } from '@tanstack/react-query';

export const useGetOrgs = () => {
  return useQuery({
    queryKey: ['orgs'],
    queryFn: () => axiosClient.get('/organization/allOrgs'),
  });
};

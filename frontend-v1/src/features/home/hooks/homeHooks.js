import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../services/userService.js';

export const useGetUsers = (filters) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => getUsers(filters),
  });
};

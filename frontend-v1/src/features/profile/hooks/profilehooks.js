import { useQuery } from '@tanstack/react-query';
import { getUser } from '../services/profileService.js';

export const useGetUser = (username) => {
  return useQuery({
    queryKey: ['profile', username],
    queryFn: () => getUser(username),
  });
};

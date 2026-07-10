import { axiosClient } from '@/shared/lib/api-client.js';

export const getUsers = (filters = {}) =>
  axiosClient.get('/user/users', {
    params: filters, // {skip: 20/40/60.. , limit: 20}
  });

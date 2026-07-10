import { axiosClient } from '@/shared/lib/api-client.js';

export const getUser = (username) => axiosClient.get(`/user/${username}`);

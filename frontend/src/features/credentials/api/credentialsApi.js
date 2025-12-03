import axiosClient from '@services/axiosClient';
import ENDPOINTS from '@services/endpoints';

export const getCredentials = (params) => {
  return axiosClient.get(ENDPOINTS.CREDENTIALS.LIST, { params });
};

export const getPendingCredentials = (params) => {
  return axiosClient.get(ENDPOINTS.CREDENTIALS.PENDING, { params });
};

export const getCredential = (id) => {
  return axiosClient.get(ENDPOINTS.CREDENTIALS.GET(id));
};

export const createCredential = (data) => {
  return axiosClient.post(ENDPOINTS.CREDENTIALS.CREATE, data);
};

export const updateCredential = (id, data) => {
  return axiosClient.patch(ENDPOINTS.CREDENTIALS.UPDATE(id), data);
};

export const deleteCredential = (id) => {
  return axiosClient.delete(ENDPOINTS.CREDENTIALS.DELETE(id));
};

export const verifyCredential = (id) => {
  return axiosClient.post(ENDPOINTS.CREDENTIALS.VERIFY(id));
};

export const rejectCredential = (id, reason) => {
  return axiosClient.post(ENDPOINTS.CREDENTIALS.REJECT(id), { reason });
};

export const getCredentialStats = () => {
  return axiosClient.get(ENDPOINTS.CREDENTIALS.STATS);
};

export const requestVerification = (id) => {
  return axiosClient.post(ENDPOINTS.CREDENTIALS.REQUEST_VERIFICATION(id));
};

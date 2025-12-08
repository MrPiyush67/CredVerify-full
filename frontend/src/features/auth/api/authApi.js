import axiosClient from '@services/axiosClient';
import ENDPOINTS from '@services/endpoints';

// to make sure only these 3 roles gets passed to backend
const roleKey = (role) => (
  (role === 'regulator' || role === 'employer') ? role : 'learner'
);

export const login = async ({ email, password, role }) => {
  const key = roleKey(role);
  const res = await axiosClient.post(ENDPOINTS.AUTH.LOGIN, { email, password, role: key });
  return res.data;
};

export const signup = async ({ name, email, password, role, companyName }) => {
  const key = roleKey(role);
  const payload = key === 'employer'
    ? { name, email, password, role: key, companyName }
    : { name, email, password, role: key };
  const res = await axiosClient.post(ENDPOINTS.AUTH.SIGNUP, payload);
  return res.data;
};

export const refreshToken = async () => {
  const res = await axiosClient.post(ENDPOINTS.AUTH.REFRESH);
  return res.data;
};

export const logout = async () => {
  try {
    await axiosClient.post(ENDPOINTS.AUTH.LOGOUT);
  } catch (_) {
    // ignore network errors on logout
  }
};

export const me = async (role) => {
  try {
    const res = await axiosClient.get(ENDPOINTS.AUTH.ME);
    return res.data;
  } catch (e) {
    // If /auth/me fails, we cannot recover - user needs to login again
    throw e;
  }
};

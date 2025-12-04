import axiosClient from '@services/axiosClient';

const digilockerApi = {
  // Start OAuth flow
  startAuth: () => {
    // Check if user is authenticated by testing a protected endpoint first
    const backendUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : 'http://localhost:5000';

    const authUrl = `${backendUrl}/api/digilocker/auth`;

    // Direct navigation - cookies will be sent automatically
    window.location.href = authUrl;
  },

  // Fetch user's Digilocker files
  getFiles: async () => {
    const response = await axiosClient.get('/digilocker/files');
    return response.data;
  },

  // Import selected files to credentials
  importFiles: async (files) => {
    const response = await axiosClient.post('/digilocker/import', { files });
    return response.data;
  },
};

export default digilockerApi;

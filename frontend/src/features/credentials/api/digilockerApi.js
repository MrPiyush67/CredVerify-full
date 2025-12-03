import axiosClient from '@services/axiosClient';

const digilockerApi = {
  // Start OAuth flow
  startAuth: () => {
    console.log('\n========================================');
    console.log('🚀 [API] Starting DigiLocker OAuth flow');
    console.log('========================================');
    
    // Check if user is authenticated by testing a protected endpoint first
    const backendUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : 'http://localhost:5000';
    
    const authUrl = `${backendUrl}/api/digilocker/auth`;
    console.log('🔗 [API] Redirecting to:', authUrl);
    console.log('========================================\n');
    
    // Direct navigation - cookies will be sent automatically
    window.location.href = authUrl;
  },

  // Fetch user's Digilocker files
  getFiles: async () => {
    console.log('📄 [API] Fetching DigiLocker files...');
    const response = await axiosClient.get('/digilocker/files');
    console.log('✅ [API] Files fetched:', response.data);
    return response.data;
  },

  // Import selected files to credentials
  importFiles: async (files) => {
    console.log('\n========================================');
    console.log('📤 [API] Importing files to backend');
    console.log('========================================');
    console.log('📄 Files count:', files.length);
    console.log('📄 Files:', files.map(f => ({ name: f.name, uri: f.uri })));
    console.log('========================================\n');
    
    const response = await axiosClient.post('/digilocker/import', { files });
    
    console.log('\n========================================');
    console.log('✅ [API] Import response received');
    console.log('========================================');
    console.log('Response data:', response.data);
    console.log('========================================\n');
    
    return response.data;
  },
};

export default digilockerApi;

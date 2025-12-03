// Validate required OAuth parameters
export function validateOAuthParams(params) {
  const { response_type, client_id, redirect_uri } = params;
  
  if (!response_type || !client_id || !redirect_uri) {
    return {
      valid: false,
      error: 'Missing required parameters: response_type, client_id, or redirect_uri'
    };
  }
  
  return { valid: true };
}

// Validate client credentials
export function validateClientCredentials(clientId, clientSecret, expectedId, expectedSecret) {
  if (clientId !== expectedId || clientSecret !== expectedSecret) {
    return {
      valid: false,
      error: 'Invalid client credentials'
    };
  }
  
  return { valid: true };
}

/**
 * API Key Authentication Middleware
 * Used to authenticate Python scripts and other automated services
 */

/**
 * Validates API key from request body or headers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const validateApiKey = (req, res, next) => {
  try {
    // Get API key from body or header
    const apiKey = req.body.apiKey || req.headers['x-api-key'];

    // Check if API key exists
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key is required. Please provide it in request body or x-api-key header.'
      });
    }

    // Validate API key against environment variable
    const validApiKey = process.env.PYTHON_SCRIPT_API_KEY;

    if (!validApiKey) {
      console.error('PYTHON_SCRIPT_API_KEY is not configured in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error. Please contact administrator.'
      });
    }

    if (apiKey !== validApiKey) {
      // Log failed authentication attempt (without exposing the key)
      console.warn(`[API Key Auth] Invalid API key attempt from IP: ${req.ip}`);

      return res.status(401).json({
        success: false,
        message: 'Invalid API key. Access denied.'
      });
    }

    // Remove API key from body to prevent it from being logged or passed further
    if (req.body.apiKey) {
      delete req.body.apiKey;
    }

    // Log successful authentication
    console.log(`[API Key Auth] Authenticated request from IP: ${req.ip} for ${req.method} ${req.path}`);

    // API key is valid, proceed to next middleware
    next();
  } catch (error) {
    console.error('[API Key Auth] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during authentication.'
    });
  }
};

/**
 * Optional: Rate limiting for API key authenticated requests
 * This can be added to prevent abuse from automated scripts
 */
export const apiKeyRateLimiter = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();

    // Clean up old entries
    for (const [key, value] of requests.entries()) {
      if (now - value.resetTime > windowMs) {
        requests.delete(key);
      }
    }

    // Get or create request counter for this IP
    if (!requests.has(ip)) {
      requests.set(ip, {
        count: 0,
        resetTime: now
      });
    }

    const requestData = requests.get(ip);

    // Reset counter if window has passed
    if (now - requestData.resetTime > windowMs) {
      requestData.count = 0;
      requestData.resetTime = now;
    }

    // Increment counter
    requestData.count++;

    // Check if limit exceeded
    if (requestData.count > maxRequests) {
      console.warn(`[Rate Limit] API key request limit exceeded for IP: ${ip}`);
      return res.status(429).json({
        success: false,
        message: `Too many requests. Maximum ${maxRequests} requests per ${windowMs / 60000} minutes allowed.`,
        retryAfter: Math.ceil((requestData.resetTime + windowMs - now) / 1000)
      });
    }

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - requestData.count);
    res.setHeader('X-RateLimit-Reset', new Date(requestData.resetTime + windowMs).toISOString());

    next();
  };
};

export default validateApiKey;

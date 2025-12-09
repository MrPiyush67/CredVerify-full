/**
 * AI Chat Service
 * Integrates with Groq API for AI-powered chat
 */

import axios from 'axios';
import ChatHistory from './chatHistory.model.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-70b-versatile';

/**
 * Get chat response from Groq AI
 * @param {string} userMessage - User's message
 * @param {Array} conversationHistory - Previous conversation messages
 * @param {string} userId - User ID for context
 */
export const getChatResponse = async (userMessage, conversationHistory = [], userId) => {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key is not configured. Please set GROQ_API_KEY in environment variables.');
  }

  try {
    // Build conversation context
    const systemMessage = {
      role: 'system',
      content: `You are a helpful AI assistant integrated into CredVerify, a credential verification platform. 
      You help users with:
      - Understanding their credentials and qualifications
      - Answering questions about credential verification
      - Providing guidance on NSQF (National Skills Qualifications Framework) levels
      - Explaining NCRF (National Credit Framework) equivalencies
      - Helping with credential management and organization
      - Career guidance based on credentials
      
      Be professional, concise, and helpful. Focus on credential-related topics.`,
    };

    // Format conversation history for Grok API
    const messages = [
      systemMessage,
      ...conversationHistory
        .slice(-10) // Keep last 10 messages for context
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      {
        role: 'user',
        content: userMessage,
      },
    ];

    // Call Groq API
    const response = await axios.post(
      GROQ_API_URL,
      {
        messages,
        model: GROQ_MODEL,
        stream: false,
        temperature: 0.7,
        max_tokens: 1024,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        timeout: 30000, // 30 second timeout
      }
    );

    const aiMessage = response.data.choices[0].message.content;

    // Save to chat history
    await saveChatInteraction(userId, userMessage, aiMessage);
    return aiMessage;
  } catch (error) {
    console.error('Groq API Error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      throw new Error('Invalid Groq API key. Please check your configuration.');
    }

    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    if (error.response?.data?.error?.includes('credits') || error.response?.status === 402) {
      throw new Error('Insufficient API credits. Please check your Groq API account.');
    } throw new Error('Insufficient API credits. Please add credits to your Grok API account at https://console.x.ai/');
  }

  // Only use fallback for network errors or complete API unavailability
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
    const fallbackMessage = generateFallbackResponse(userMessage);
    await saveChatInteraction(userId, userMessage, fallbackMessage);
    return fallbackMessage;
  }

  // For other errors, throw to let the controller handle
  throw new Error(error.response?.data?.error?.message || 'Failed to get AI response. Please try again.');
}

/**
 * Generate fallback response when API is unavailable
 */
const generateFallbackResponse = (userMessage) => {
  const lowerMessage = userMessage.toLowerCase();

  // NSQF related queries
  if (lowerMessage.includes('nsqf') || lowerMessage.includes('level')) {
    return `NSQF (National Skills Qualifications Framework) has 10 levels:
- Level 1-2: Basic skills
- Level 3-5: Skilled workers (ITI, Diploma)
- Level 6-8: Advanced skills (Bachelor's, Master's)
- Level 9-10: Research & expertise (PhD, Post-doctoral)

Each level represents increasing complexity and responsibility in skills and knowledge.`;
  }

  // NCRF related queries
  if (lowerMessage.includes('ncrf') || lowerMessage.includes('credit')) {
    return `NCRF (National Credit Framework) enables credit accumulation and transfer:
- Credits represent learning outcomes
- 1 credit = 10 hours of learning
- Credits can be transferred between institutions
- Helps in flexible learning pathways

This framework integrates school, vocational, and higher education.`;
  }

  // Verification related queries
  if (lowerMessage.includes('verify') || lowerMessage.includes('verification')) {
    return `To verify credentials on CredVerify:
1. Upload your certificate (PDF, JPG, PNG)
2. Our AI extracts key information
3. System validates against blockchain records
4. Get instant verification status

All verified credentials are stored securely with blockchain proof.`;
  }

  // Upload related queries
  if (lowerMessage.includes('upload') || lowerMessage.includes('add')) {
    return `To add credentials:
1. Click "Add Credential" button
2. Choose upload method (File upload, URL, or DigiLocker)
3. Upload your certificate
4. AI will extract: Title, Issuer, Date, Skills
5. Review and submit for verification

Supported formats: PDF, JPG, PNG`;
  }

  // Career/Job queries
  if (lowerMessage.includes('job') || lowerMessage.includes('career')) {
    return `Your credentials can help you find relevant jobs:
- Verified credentials increase employer trust
- Match your skills with job requirements
- Browse job listings in the Jobs section
- Apply directly with your credential portfolio

Keep your credentials updated for better job matches!`;
  }

  // Default helpful response
  return `I'm here to help with your credentials! I can assist with:

📜 Understanding NSQF levels and NCRF credits
✅ Credential verification process
📤 Uploading and managing certificates
💼 Career guidance based on your qualifications
🔍 Finding relevant job opportunities

What specific aspect would you like to know more about?

Note: AI service is temporarily offline. Please check your internet connection.`;
};

/**
 * Save chat interaction to database
 */
const saveChatInteraction = async (userId, userMessage, aiResponse) => {
  try {
    await ChatHistory.create({
      user: userId,
      userMessage,
      aiResponse,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to save chat history:', error);
    // Don't throw error - chat history saving is not critical
  }
};

/**
 * Get user's chat history
 */
export const getUserChatHistory = async (userId, limit = 50) => {
  try {
    const history = await ChatHistory.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .select('userMessage aiResponse timestamp');

    return history;
  } catch (error) {
    console.error('Failed to fetch chat history:', error);
    return [];
  }
};

/**
 * Clear user's chat history
 */
export const clearUserChatHistory = async (userId) => {
  try {
    await ChatHistory.deleteMany({ user: userId });
  } catch (error) {
    console.error('Failed to clear chat history:', error);
    throw new Error('Failed to clear chat history');
  }
};

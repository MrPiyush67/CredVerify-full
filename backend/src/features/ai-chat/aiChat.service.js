/**
 * AI Chat Service
 * Integrates with Groq API for AI-powered chat
 */

import axios from 'axios';
import ChatHistory from './chatHistory.model.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

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
    // Check if user is requesting a learning roadmap
    const isRoadmapRequest = detectRoadmapRequest(userMessage);
    const isNumericSelection = /^[1-9]$/.test(userMessage.trim());
    const isFinalRoadmapGeneration = userMessage.includes('Generate final roadmap for:');
    
    // Handle final roadmap generation (when user clicks Generate button)
    if (isFinalRoadmapGeneration) {
      const pathMatch = userMessage.match(/Generate final roadmap for: (.+)$/);
      if (pathMatch) {
        const selectionPath = pathMatch[1].split(' → ');
        const roadmapData = await generateDetailedRoadmap(selectionPath, userId);
        return roadmapData;
      }
    }
    
    // Check if previous message was roadmap options
    const previousMessage = conversationHistory[conversationHistory.length - 1];
    const isPreviousRoadmapOptions = previousMessage?.content?.includes('ROADMAP_OPTIONS:');
    const isInteractiveRoadmap = previousMessage?.content?.includes('INTERACTIVE_ROADMAP_OPTIONS:');
    
    // Handle interactive roadmap selection (multi-level)
    if (isNumericSelection && isInteractiveRoadmap) {
      const selection = parseInt(userMessage.trim());
      const roadmapData = await handleInteractiveRoadmapSelection(
        selection,
        previousMessage.content,
        conversationHistory,
        userId
      );
      return roadmapData;
    }
    
    // Legacy: If user selected a number after roadmap options, generate the roadmap
    if (isNumericSelection && isPreviousRoadmapOptions) {
      const selection = parseInt(userMessage.trim());
      const roadmapData = await generateRoadmapFromSelection(selection, previousMessage.content, userId);
      return roadmapData;
    }
    
    // If it's a roadmap request, start interactive roadmap flow
    if (isRoadmapRequest) {
      const roadmapOptions = await startInteractiveRoadmap(userMessage, userId);
      return roadmapOptions;
    }
    
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
      - Providing learning roadmaps and skill development paths
      
      When users ask for learning paths or roadmaps, provide 2-5 specific, relevant options they can choose from.
      
      Be professional, concise, and helpful. Focus on credential-related topics.`,
    };

    // Format conversation history for Groq API
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
      throw new Error('Insufficient API credits. Please add credits to your Groq API account at https://console.groq.com/');
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
}

/**
 * Detect if user is requesting a learning roadmap
 */
const detectRoadmapRequest = (message) => {
  const lowerMessage = message.toLowerCase();
  const roadmapKeywords = [
    'roadmap', 'learning path', 'how to learn', 'study path',
    'career path', 'what should i learn', 'guide to learn',
    'learning guide', 'skill path', 'course path'
  ];
  return roadmapKeywords.some(keyword => lowerMessage.includes(keyword));
};

/**
 * Start interactive multi-level roadmap generation
 */
const startInteractiveRoadmap = async (userMessage, userId) => {
  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        messages: [
          {
            role: 'system',
            content: `You are a career advisor helping users explore learning paths. Based on the user's query, provide 4-5 HIGH-LEVEL, BROAD categories or domains they can explore.

CRITICAL FORMATTING RULES:
- Use simple, clean text - NO asterisks (*), NO markdown formatting, NO bullet points
- Write descriptions as plain sentences
- Use "and" instead of commas for lists
- Keep each description to ONE clear sentence

IMPORTANT: 
- Extract the MAIN TOPIC from user's question
- Provide 4-5 DIFFERENT APPROACHES or SPECIALIZATIONS within that topic
- DO NOT provide generic categories - be specific to what the user asked
- Each option should lead to a distinct learning path

Response format (EXACT FORMAT REQUIRED):
INTERACTIVE_ROADMAP_OPTIONS:
LEVEL: 1
TOPIC: [Exact topic from user's query]

1. [Specific Path/Specialization] - [One clean sentence describing the focus]
2. [Specific Path/Specialization] - [One clean sentence describing the focus]
3. [Specific Path/Specialization] - [One clean sentence describing the focus]
4. [Specific Path/Specialization] - [One clean sentence describing the focus]
5. [Specific Path/Specialization] - [One clean sentence describing the focus]

Select a number to dive deeper!`
          },
          { role: 'user', content: userMessage }
        ],
        model: GROQ_MODEL,
        temperature: 0.8,
        max_tokens: 400,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        timeout: 30000,
      }
    );

    const optionsText = response.data.choices[0].message.content;
    await saveChatInteraction(userId, userMessage, optionsText);
    return optionsText;
  } catch (error) {
    console.error('Error starting interactive roadmap:', error);
    throw new Error('Failed to start interactive roadmap. Please try again.');
  }
};

/**
 * Handle interactive roadmap selection across multiple levels
 */
const handleInteractiveRoadmapSelection = async (selection, previousOptionsText, conversationHistory, userId) => {
  try {
    // Extract current level and topic
    const levelMatch = previousOptionsText.match(/LEVEL:\s*(\d+)/);
    const topicMatch = previousOptionsText.match(/TOPIC:\s*(.+)/);
    
    // Ensure level is within bounds (1-5)
    let currentLevel = levelMatch ? parseInt(levelMatch[1]) : 1;
    currentLevel = Math.min(Math.max(currentLevel, 1), 5);
    
    const currentTopic = topicMatch ? topicMatch[1].trim() : 'Learning Path';
    
    // Validate selection is between 1 and 5
    if (selection < 1 || selection > 5) {
      return "Invalid selection. Please choose a number between 1 and 5.";
    }
    
    // Extract the selected option
    const lines = previousOptionsText.split('\n');
    const selectedLine = lines.find(line => line.trim().startsWith(`${selection}.`));
    
    if (!selectedLine) {
      return "Invalid selection. Please choose a valid number from the options.";
    }

    // Extract selection path from conversation history
    const selectionPath = extractSelectionPath(conversationHistory, selectedLine);
    
    // Generate next level options
    const nextLevel = Math.min(Math.max(currentLevel + 1, 1), 5);
    
    // If we've reached level 5, offer to generate the final roadmap
    if (currentLevel >= 5) {
      return JSON.stringify({
        type: 'GENERATE_ROADMAP_PROMPT',
        level: 5,
        topic: currentTopic,
        selectionPath: selectionPath,
        message: `Perfect! You have completed your selection path:\n\n${selectionPath.join(' → ')}\n\nClick the button below to generate and download your personalized learning roadmap.`,
        showGenerateButton: true
      });
    }
    
    // Ensure we don't exceed level 5
    if (nextLevel > 5) {
      return JSON.stringify({
        type: 'GENERATE_ROADMAP_PROMPT',
        level: 5,
        topic: currentTopic,
        selectionPath: selectionPath,
        message: `You've reached the maximum selection depth. Click below to generate your roadmap.`,
        showGenerateButton: true
      });
    }
    
    const response = await axios.post(
      GROQ_API_URL,
      {
        messages: [
          {
            role: 'system',
            content: `You are a career advisor providing progressively MORE SPECIFIC learning options based on the user's selection path.

Current selection path: ${selectionPath.join(' → ')}
Current level: ${nextLevel} of 5

CRITICAL FORMATTING RULES:
- Use simple, clean text - NO asterisks (*), NO markdown formatting, NO bullet points
- Write descriptions as plain sentences
- Use "and" instead of commas for lists
- Keep each description to ONE clear sentence
- DO NOT repeat numbers from previous levels - always use 1, 2, 3, 4, 5 for THIS level

IMPORTANT:
- User selected: "${selectedLine}"
- Provide 4-5 MORE SPECIFIC sub-topics, specializations, or focus areas WITHIN their selection
- Each option should be narrower and more detailed than the previous level
- Options should be DIRECTLY RELATED to their last selection
- Make each level progressively more granular and specific

Response format (EXACT FORMAT REQUIRED):
INTERACTIVE_ROADMAP_OPTIONS:
LEVEL: ${nextLevel}
TOPIC: ${currentTopic}
PATH: ${selectionPath.join(' → ')}

1. [More Specific Topic] - [One clean sentence describing the detailed focus area]
2. [More Specific Topic] - [One clean sentence describing the detailed focus area]
3. [More Specific Topic] - [One clean sentence describing the detailed focus area]
4. [More Specific Topic] - [One clean sentence describing the detailed focus area]
5. [More Specific Topic] - [One clean sentence describing the detailed focus area]

${nextLevel < 5 ? 'Select a number to continue!' : 'Select a number to generate your roadmap!'}`
          },
          {
            role: 'user',
            content: `I selected: ${selectedLine}. What are the next, more specific options within this area?`
          }
        ],
        model: GROQ_MODEL,
        temperature: 0.7,
        max_tokens: 500,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        timeout: 30000,
      }
    );

    const optionsText = response.data.choices[0].message.content;
    await saveChatInteraction(userId, `Selected option ${selection}: ${selectedLine}`, optionsText);
    return optionsText;
  } catch (error) {
    console.error('Error handling interactive roadmap selection:', error);
    console.error('Error details:', error.response?.data || error.message);
    console.error('Selection:', selection);
    console.error('Current level:', currentLevel);
    return "Sorry, I encountered an error. Please try again.";
  }
};

/**
 * Extract the full selection path from conversation history
 */
const extractSelectionPath = (conversationHistory, currentSelection) => {
  const path = [];
  
  for (let i = conversationHistory.length - 1; i >= 0; i--) {
    const msg = conversationHistory[i];
    if (msg.role === 'user' && /^[1-9]$/.test(msg.content.trim())) {
      // Find the corresponding assistant message
      if (i > 0) {
        const assistantMsg = conversationHistory[i - 1];
        if (assistantMsg.content.includes('INTERACTIVE_ROADMAP_OPTIONS:')) {
          const lines = assistantMsg.content.split('\n');
          const selectedNum = parseInt(msg.content.trim());
          const selectedLine = lines.find(line => line.trim().startsWith(`${selectedNum}.`));
          if (selectedLine) {
            const selection = selectedLine.split('-')[0].replace(/^\d+\.\s*/, '').trim();
            path.unshift(selection);
          }
        }
      }
    }
  }
  
  // Add current selection
  const currentSelectionText = currentSelection.split('-')[0].replace(/^\d+\.\s*/, '').trim();
  path.push(currentSelectionText);
  
  return path;
};

/**
 * Generate final detailed roadmap based on selection path
 */
const generateDetailedRoadmap = async (selectionPath, userId) => {
  try {
    const pathString = selectionPath.join(' → ');
    
    const response = await axios.post(
      GROQ_API_URL,
      {
        messages: [
          {
            role: 'system',
            content: `You are an expert learning path designer. Create a detailed, structured learning roadmap.

Generate a comprehensive 5-7 step roadmap for: ${pathString}

CRITICAL FORMATTING RULES:
- NO asterisks (*), NO markdown formatting, NO bullet points in any field
- Use plain text descriptions
- Write complete sentences
- Use commas and "and" for lists, not bullet points

Return ONLY valid JSON in this EXACT format (no extra text, no code blocks):
{
  "type": "ROADMAP",
  "title": "[Specific Title based on path]",
  "description": "[One complete sentence overview with NO asterisks]",
  "steps": [
    {
      "title": "[Step Name - plain text only]",
      "description": "[What they will learn and achieve - complete sentence, NO asterisks]",
      "duration": "[Realistic timeframe: X weeks or X months]",
      "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"]
    }
  ]
}

Requirements:
- 5-7 progressive steps from beginner to advanced
- Each step builds on previous knowledge
- Realistic duration estimates (weeks or months)
- 4-5 specific topics per step as simple strings
- Practical, actionable content
- Industry-relevant skills
- NO markdown or special formatting anywhere`
          },
          {
            role: 'user',
            content: `Create a detailed roadmap for: ${pathString}`
          }
        ],
        model: GROQ_MODEL,
        temperature: 0.7,
        max_tokens: 1500,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        timeout: 30000,
      }
    );

    let roadmapText = response.data.choices[0].message.content.trim();
    
    // Clean up response if AI added markdown code blocks
    if (roadmapText.startsWith('```json')) {
      roadmapText = roadmapText.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (roadmapText.startsWith('```')) {
      roadmapText = roadmapText.replace(/```\n?/, '').replace(/\n?```$/, '');
    }
    
    // Validate JSON
    try {
      JSON.parse(roadmapText);
    } catch (e) {
      console.error('Invalid JSON from AI:', roadmapText);
      // Return fallback roadmap
      return JSON.stringify({
        type: "ROADMAP",
        title: pathString,
        description: "A comprehensive learning path to master this topic",
        steps: [
          {
            title: "Fundamentals",
            description: "Master the core concepts and basics",
            duration: "4 weeks",
            topics: ["Basic Concepts", "Core Principles", "Essential Tools", "Best Practices"]
          },
          {
            title: "Intermediate Skills",
            description: "Build practical skills and understanding",
            duration: "6 weeks",
            topics: ["Advanced Concepts", "Real-world Applications", "Common Patterns", "Problem Solving"]
          },
          {
            title: "Advanced Topics",
            description: "Explore advanced concepts and techniques",
            duration: "6 weeks",
            topics: ["Advanced Patterns", "Optimization", "Scalability", "Performance"]
          },
          {
            title: "Practical Projects",
            description: "Build real-world projects to solidify learning",
            duration: "4 weeks",
            topics: ["Project Planning", "Implementation", "Testing", "Deployment"]
          },
          {
            title: "Expert Level",
            description: "Master expert-level concepts and contribute to the field",
            duration: "8 weeks",
            topics: ["System Design", "Architecture", "Leadership", "Innovation"]
          }
        ]
      });
    }
    
    await saveChatInteraction(userId, `Generate roadmap for: ${pathString}`, roadmapText);
    return roadmapText;
  } catch (error) {
    console.error('Error generating detailed roadmap:', error);
    // Return fallback
    return JSON.stringify({
      type: "ROADMAP",
      title: "Learning Roadmap",
      description: "A structured path to achieve your learning goals",
      steps: [
        {
          title: "Foundation",
          description: "Build a strong foundation in core concepts",
          duration: "4 weeks",
          topics: ["Basics", "Fundamentals", "Core Concepts", "Getting Started"]
        },
        {
          title: "Skill Development",
          description: "Develop practical skills through hands-on practice",
          duration: "6 weeks",
          topics: ["Practical Skills", "Tools & Technologies", "Hands-on Practice", "Real Examples"]
        },
        {
          title: "Advanced Learning",
          description: "Explore advanced topics and best practices",
          duration: "6 weeks",
          topics: ["Advanced Concepts", "Best Practices", "Optimization", "Industry Standards"]
        },
        {
          title: "Project Work",
          description: "Apply knowledge through real-world projects",
          duration: "5 weeks",
          topics: ["Project Planning", "Implementation", "Testing", "Documentation"]
        },
        {
          title: "Mastery",
          description: "Achieve mastery and expert-level understanding",
          duration: "8 weeks",
          topics: ["Expert Techniques", "System Design", "Architecture", "Leadership"]
        }
      ]
    });
  }
};

/**
 * Generate roadmap options for user to choose from (LEGACY - keeping for compatibility)
 */
const generateRoadmapOptions = async (userMessage, userId) => {
  // Redirect to new interactive flow
  return await startInteractiveRoadmap(userMessage, userId);
};

/**
 * Generate roadmap visualization from user selection (LEGACY)
 */
const generateRoadmapFromSelection = async (selection, previousOptionsText, userId) => {
  // This is kept for backwards compatibility but not actively used
  return await handleInteractiveRoadmapSelection(selection, previousOptionsText, [], userId);
};

/**
 * Fallback roadmap options when API fails
 */
const getFallbackRoadmapOptions = (userMessage) => {
  return `ROADMAP_OPTIONS:
1. Data Science & Machine Learning - Master data analysis, ML algorithms, and AI applications
2. Web Development (Full Stack) - Learn frontend, backend, databases, and deployment
3. Python Programming - From basics to advanced Python development
4. Cloud Computing (AWS/Azure) - Cloud infrastructure, deployment, and DevOps
5. Cybersecurity Fundamentals - Network security, ethical hacking, and protection

Type the number (1-5) of the path you'd like to explore!`;
};

/**
 * Fallback roadmap when API fails
 */
const getFallbackRoadmap = (selection) => {
  const roadmaps = {
    1: {
      type: "ROADMAP",
      title: "Data Science & Machine Learning Path",
      description: "Complete roadmap to become a Data Scientist",
      steps: [
        {
          title: "Python Fundamentals",
          description: "Learn Python basics, data structures, and OOP",
          duration: "3-4 weeks",
          topics: ["Variables & Data Types", "Control Flow", "Functions", "OOP Concepts"]
        },
        {
          title: "Math for Data Science",
          description: "Essential mathematics: statistics, linear algebra, calculus",
          duration: "4 weeks",
          topics: ["Statistics", "Probability", "Linear Algebra", "Calculus Basics"]
        },
        {
          title: "Data Analysis & Visualization",
          description: "Master pandas, NumPy, and data visualization",
          duration: "3 weeks",
          topics: ["Pandas", "NumPy", "Matplotlib", "Seaborn"]
        },
        {
          title: "Machine Learning Basics",
          description: "Supervised & unsupervised learning algorithms",
          duration: "5 weeks",
          topics: ["Linear Regression", "Classification", "Clustering", "Decision Trees"]
        },
        {
          title: "Deep Learning",
          description: "Neural networks and deep learning frameworks",
          duration: "6 weeks",
          topics: ["Neural Networks", "TensorFlow", "PyTorch", "CNNs", "RNNs"]
        }
      ]
    }
  };

  return JSON.stringify(roadmaps[selection] || roadmaps[1]);
};

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

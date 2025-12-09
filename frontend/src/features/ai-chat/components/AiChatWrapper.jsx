import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Sparkles, ArrowRight, Download, Maximize2, Minimize2, MapIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import axiosClient from '@services/axiosClient';
import RoadmapViewer from './RoadmapViewer';
import { downloadRoadmapHTML } from './RoadmapGenerator';

const AiChatWrapper = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can help you verify credentials or create personalized learning roadmaps. How can I assist you today?',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async (customMessage = null) => {
    const messageToSend = customMessage || inputMessage;
    if (!messageToSend.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: messageToSend.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axiosClient.post('/ai-chat/message', {
        message: messageToSend.trim(),
        conversationHistory: messages,
      });

      const responseContent = response.data.data.message;
      
      // Check if response is a roadmap JSON
      let assistantMessage;
      
      try {
        // Try to parse as JSON
        const trimmedContent = responseContent.trim();
        
        // Check if it looks like JSON
        if ((trimmedContent.startsWith('{') && trimmedContent.endsWith('}')) || 
            (trimmedContent.startsWith('[') && trimmedContent.endsWith(']'))) {
          try {
            const parsedContent = JSON.parse(trimmedContent);
            
            if (parsedContent && typeof parsedContent === 'object') {
              if (parsedContent.type === 'ROADMAP') {
                assistantMessage = {
                  role: 'assistant',
                  content: responseContent,
                  timestamp: new Date(),
                  isRoadmap: true,
                  roadmapData: parsedContent,
                };
              } else if (parsedContent.type === 'GENERATE_ROADMAP_PROMPT') {
                assistantMessage = {
                  role: 'assistant',
                  content: parsedContent.message || 'Ready to generate your roadmap!',
                  timestamp: new Date(),
                  showGenerateButton: true,
                  selectionPath: parsedContent.selectionPath || [],
                };
              }
            }
          } catch (parseError) {
            console.log('JSON parse failed, treating as regular message:', parseError.message);
          }
        }
      } catch (error) {
        console.error('Error processing response:', error);
      }
      
      // Default to regular message if not handled above
      if (!assistantMessage) {
        assistantMessage = {
          role: 'assistant',
          content: responseContent,
          timestamp: new Date(),
        };
      }

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Check for authentication error
      if (error.response?.status === 401) {
        toast.error('Please log in to use the AI assistant');
        const errorMessage = {
          role: 'assistant',
          content: 'Please log in to continue using the AI assistant.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } else {
        // Get specific error message from backend
        const errorMsg = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Failed to get response from AI. Please try again.';
        
        toast.error(errorMsg);
        
        const errorMessage = {
          role: 'assistant',
          content: `Error: ${errorMsg}`,
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant. I can help you verify credentials or create personalized learning roadmaps. How can I assist you today?',
        timestamp: new Date(),
      },
    ]);
    toast.success('Chat cleared');
  };

  const handleGenerateFinalRoadmap = async (selectionPath) => {
    try {
      setIsLoading(true);
      
      // Make API call to generate detailed roadmap based on selection path
      const response = await axiosClient.post('/ai-chat/message', {
        message: `Generate final roadmap for: ${selectionPath.join(' → ')}`,
        conversationHistory: messages,
      });

      const responseContent = response.data.data.message;
      console.log('Roadmap response:', responseContent);
      
      // Parse the roadmap data
      try {
        const trimmedContent = responseContent.trim();
        
        if (trimmedContent.startsWith('{') && trimmedContent.endsWith('}')) {
          const parsedContent = JSON.parse(trimmedContent);
          console.log('Parsed roadmap:', parsedContent);
          
          // Normalize topics field - convert string to array if needed
          if (parsedContent && parsedContent.steps && Array.isArray(parsedContent.steps)) {
            parsedContent.steps = parsedContent.steps.map((step, idx) => {
              // Ensure step is an object
              if (!step || typeof step !== 'object') {
                console.warn(`Invalid step at index ${idx}:`, step);
                return null;
              }

              // Normalize topics
              if (step.topics && typeof step.topics === 'string') {
                // Split string topics by comma and trim whitespace
                step.topics = step.topics.split(',').map(t => t.trim()).filter(t => t);
              } else if (!step.topics || !Array.isArray(step.topics)) {
                step.topics = [];
              }
              
              // Ensure all required fields exist
              return {
                title: step.title || 'Learning Step',
                description: step.description || '',
                duration: step.duration || '',
                topics: step.topics,
                category: step.category || ''
              };
            }).filter(step => step !== null); // Remove invalid steps
          }
          
          if (parsedContent && parsedContent.type === 'ROADMAP' && parsedContent.steps && Array.isArray(parsedContent.steps) && parsedContent.steps.length > 0) {
            // Download the HTML roadmap
            downloadRoadmapHTML(parsedContent);
            toast.success('Roadmap downloaded successfully!');
            
            // Add the roadmap to chat
            const roadmapMessage = {
              role: 'assistant',
              content: responseContent,
              timestamp: new Date(),
              isRoadmap: true,
              roadmapData: parsedContent,
            };
            setMessages((prev) => [...prev, roadmapMessage]);
          } else {
            console.error('Invalid roadmap structure:', parsedContent);
            toast.error('Invalid roadmap format received');
          }
        } else {
          console.error('Response is not valid JSON format');
          toast.error('Received invalid response format');
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Failed content:', responseContent);
        toast.error('Failed to parse roadmap data. Check console for details.');
      }
    } catch (error) {
      console.error('Failed to generate roadmap:', error);
      toast.error('Failed to generate roadmap. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-8 right-8 z-50 bg-teal-600 text-white p-4 rounded-full shadow-2xl hover:bg-teal-700 transition-all border border-teal-500"
            aria-label="Open AI Chat"
          >
            <MessageSquare className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full animate-pulse border-2 border-teal-600"></span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed z-50 bg-white shadow-2xl border border-gray-200 flex flex-col overflow-hidden font-sans transition-all duration-300 ${
              isFullscreen 
                ? 'inset-4 rounded-lg' 
                : 'bottom-8 right-8 w-[500px] md:w-[700px] lg:w-[900px] xl:w-[1100px] h-[90vh] rounded-xl'
            }`}
          >
            {/* Header */}
            <div className="bg-teal-600 text-white p-4 flex items-center justify-between border-b border-teal-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg tracking-tight">AI Assistant</h3>
                  <p className="text-xs text-teal-100 font-medium">Powered by Groq</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 hover:bg-teal-700 rounded-lg transition-colors text-teal-100 hover:text-white"
                  title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={clearChat}
                  className="p-2 hover:bg-teal-700 rounded-lg transition-colors text-teal-100 hover:text-white"
                  title="Clear chat"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-teal-700 rounded-lg transition-colors text-teal-100 hover:text-white"
                  aria-label="Close chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.isRoadmap ? (
                    // Render roadmap in full width
                    <div className="w-full">
                      <RoadmapViewer roadmapData={message.roadmapData} />
                    </div>
                  ) : message.showGenerateButton ? (
                    // Render generate roadmap button
                    <div className="w-full bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-200 rounded-2xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center shadow-lg">
                          <MapIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-teal-900 mb-2">Ready to Generate Your Roadmap!</h3>
                          <p className="text-gray-700 mb-4 whitespace-pre-wrap">{message.content}</p>
                          <div className="flex flex-wrap gap-3">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleGenerateFinalRoadmap(message.selectionPath)}
                              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all"
                            >
                              <Download className="w-5 h-5" />
                              Generate & Download Roadmap
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleSendMessage("Show me different options")}
                              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all"
                            >
                              <ArrowRight className="w-5 h-5" />
                              Choose Different Path
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                        message.role === 'user'
                          ? 'bg-teal-600 text-white rounded-br-none'
                          : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      <p
                        className={`text-[10px] mt-2 font-medium ${
                          message.role === 'user' ? 'text-teal-100' : 'text-gray-400'
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                    <span className="text-sm text-gray-500 font-medium">Thinking...</span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="relative flex items-end gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200 focus-within:border-teal-600 focus-within:ring-1 focus-within:ring-teal-600 transition-all">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  rows={1}
                  className="flex-1 resize-none bg-transparent border-none focus:ring-0 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 max-h-32"
                  style={{
                    minHeight: '44px',
                    height: 'auto',
                  }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                  }}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-0.5"
                  aria-label="Send message"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 text-center font-medium">
                AI can make mistakes. Please verify important information.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AiChatWrapper;

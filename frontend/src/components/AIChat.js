import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiX, FiSend, FiUser } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

// Custom Pink Lotus Logo Component
const LotusIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer petals */}
    <ellipse cx="12" cy="14" rx="3" ry="7" fill="#f8d7da" opacity="0.8" transform="rotate(-30 12 14)"/>
    <ellipse cx="12" cy="14" rx="3" ry="7" fill="#f8d7da" opacity="0.8" transform="rotate(30 12 14)"/>
    <ellipse cx="12" cy="14" rx="3" ry="7" fill="#e879a6" opacity="0.7" transform="rotate(-60 12 14)"/>
    <ellipse cx="12" cy="14" rx="3" ry="7" fill="#e879a6" opacity="0.7" transform="rotate(60 12 14)"/>
    <ellipse cx="12" cy="14" rx="3" ry="7" fill="#f8d7da" opacity="0.9" transform="rotate(-90 12 14)"/>
    <ellipse cx="12" cy="14" rx="3" ry="7" fill="#f8d7da" opacity="0.9" transform="rotate(90 12 14)"/>
    
    {/* Middle petals */}
    <ellipse cx="12" cy="13" rx="2" ry="5" fill="#e879a6" opacity="0.9" transform="rotate(-45 12 13)"/>
    <ellipse cx="12" cy="13" rx="2" ry="5" fill="#e879a6" opacity="0.9" transform="rotate(45 12 13)"/>
    <ellipse cx="12" cy="13" rx="2" ry="5" fill="#c2185b" opacity="0.8" transform="rotate(-90 12 13)"/>
    <ellipse cx="12" cy="13" rx="2" ry="5" fill="#c2185b" opacity="0.8" transform="rotate(90 12 13)"/>
    <ellipse cx="12" cy="13" rx="2" ry="5" fill="#e879a6" opacity="0.8" transform="rotate(0 12 13)"/>
    <ellipse cx="12" cy="13" rx="2" ry="5" fill="#e879a6" opacity="0.8" transform="rotate(180 12 13)"/>
    
    {/* Inner petals */}
    <ellipse cx="12" cy="12" rx="1.5" ry="3" fill="#c2185b" opacity="0.9" transform="rotate(-30 12 12)"/>
    <ellipse cx="12" cy="12" rx="1.5" ry="3" fill="#c2185b" opacity="0.9" transform="rotate(30 12 12)"/>
    <ellipse cx="12" cy="12" rx="1.5" ry="3" fill="#e879a6" transform="rotate(-60 12 12)"/>
    <ellipse cx="12" cy="12" rx="1.5" ry="3" fill="#e879a6" transform="rotate(60 12 12)"/>
    
    {/* Center */}
    <circle cx="12" cy="12" r="1.5" fill="#c2185b"/>
    <circle cx="12" cy="12" r="0.8" fill="#fce4ec"/>
    <circle cx="12" cy="11.5" r="0.3" fill="white" opacity="0.7"/>
  </svg>
);

const slideUp = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const ChatContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  font-family: 'Calibri', 'Inter', sans-serif;
`;

const ChatToggle = styled.button`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e879a6 0%, #c2185b 100%);
  border: none;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(232, 121, 166, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 25px rgba(232, 121, 166, 0.6);
  }
`;

const ChatWindow = styled.div`
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${slideUp} 0.3s ease-out;
  
  @media (max-width: 480px) {
    width: 320px;
    height: 450px;
  }
`;

const ChatHeader = styled.div`
  background: linear-gradient(135deg, #e879a6 0%, #c2185b 100%);
  color: white;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ChatTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  h4 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }
  
  p {
    margin: 0;
    font-size: 0.8rem;
    opacity: 0.9;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: #f8f9fa;
`;

const Message = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  ${props => props.isUser && 'flex-direction: row-reverse;'}
`;

const MessageBubble = styled.div`
  max-width: 80%;
  padding: 0.75rem 1rem;
  border-radius: 15px;
  font-size: 0.9rem;
  line-height: 1.4;
  
  ${props => props.isUser ? `
    background: linear-gradient(135deg, #e879a6 0%, #c2185b 100%);
    color: white;
    border-bottom-right-radius: 5px;
  ` : `
    background: white;
    color: #333;
    border: 1px solid #e0e0e0;
    border-bottom-left-radius: 5px;
  `}
`;

const MessageIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  ${props => props.isUser ? `
    background: linear-gradient(135deg, #e879a6 0%, #c2185b 100%);
    color: white;
  ` : `
    background: #f0f0f0;
    color: #666;
  `}
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: white;
  border-radius: 15px;
  border-bottom-left-radius: 5px;
  border: 1px solid #e0e0e0;
  max-width: 80%;
  
  .dots {
    display: flex;
    gap: 0.25rem;
  }
  
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #c2185b;
    animation: typing 1.4s infinite ease-in-out;
  }
  
  .dot:nth-child(1) { animation-delay: -0.32s; }
  .dot:nth-child(2) { animation-delay: -0.16s; }
  
  @keyframes typing {
    0%, 80%, 100% { opacity: 0.3; }
    40% { opacity: 1; }
  }
`;

const ChatInput = styled.div`
  padding: 1rem;
  background: white;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 0.5rem;
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 25px;
  outline: none;
  font-size: 0.9rem;
  
  &:focus {
    border-color: #e879a6;
  }
`;

const SendButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e879a6 0%, #c2185b 100%);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const QuickActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const QuickActionButton = styled.button`
  padding: 0.4rem 0.8rem;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 15px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e879a6;
    color: white;
    border-color: #e879a6;
  }
`;

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [hasAskedName, setHasAskedName] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Function to extract name from user input
  const extractName = (text) => {
    const message = text.trim();
    
    // Common patterns for name introduction
    const patterns = [
      /^(?:my name is|i'm|i am|im|call me)\s+(.+?)(?:\.|!|\?|$)/i,
      /^(.+?)(?:\s+is my name|\s+here|$)/i
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        let name = match[1].trim();
        // Remove common words that might be included
        name = name.replace(/^(my|the|name|is|am)\s+/i, '');
        // Capitalize first letter
        name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        return name;
      }
    }
    
    // If no pattern matches, assume the whole message is the name (fallback)
    // But clean it up by taking only the first word if it contains multiple words
    const words = message.split(/\s+/);
    const firstName = words[0].replace(/[^\w]/g, ''); // Remove punctuation
    return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initial greeting
      setTimeout(() => {
        const greeting = user ? 
          `Hello ${user.name}! 👋 Welcome back to Olga Sabo Skincare Studio! How can I help you today?` :
          `Hello! 👋 Welcome to Olga Sabo Skincare Studio! I'm your personal skincare assistant. What's your name?`;
        
        setMessages([{
          id: Date.now(),
          text: greeting,
          isUser: false,
          timestamp: new Date().toISOString()
        }]);
        
        if (user) {
          setCustomerName(user.name);
          setHasAskedName(true);
        }
      }, 500);
    }
  }, [isOpen, user, messages.length]);

  const sendMessage = async (messageText = inputValue.trim()) => {
    if (!messageText || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: messageText,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Check if user provided their name
      if (!hasAskedName && !user && !customerName) {
        const extractedName = extractName(messageText);
        setCustomerName(extractedName);
        setHasAskedName(true);
        
        setTimeout(() => {
          const nameResponse = {
            id: Date.now() + 1,
            text: `Nice to meet you, ${extractedName}! 😊 Are you a returning customer with us, or is this your first visit to Olga Sabo Skincare Studio?`,
            isUser: false,
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, nameResponse]);
          setIsTyping(false);
          setIsLoading(false);
        }, 1500);
        return;
      }

      // Send to backend AI service
      const response = await axios.post('/api/ai-chat', {
        message: messageText,
        customerName: customerName || user?.name,
        isExistingCustomer: !!user,
        chatHistory: messages.slice(-5) // Send last 5 messages for context
      });

      setTimeout(() => {
        const aiResponse = {
          id: Date.now() + 1,
          text: response.data.message,
          isUser: false,
          timestamp: new Date().toISOString(),
          quickActions: response.data.quickActions
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
        setIsLoading(false);
      }, 1000 + Math.random() * 1000); // Simulate thinking time

    } catch (error) {
      console.error('AI Chat error:', error);
      setTimeout(() => {
        const errorResponse = {
          id: Date.now() + 1,
          text: "I apologize, but I'm having trouble connecting right now. Please feel free to call us at (831) 233 0612 or visit our services page to learn more about our treatments! 😊",
          isUser: false,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorResponse]);
        setIsTyping(false);
        setIsLoading(false);
      }, 1500);
    }
  };

  const handleQuickAction = (action) => {
    sendMessage(action);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <ChatContainer>
      {isOpen && (
        <ChatWindow>
          <ChatHeader>
            <ChatTitle>
              <LotusIcon size={24} />
              <div>
                <h4>Skincare Assistant</h4>
                <p>Powered by AI</p>
              </div>
            </ChatTitle>
            <CloseButton onClick={() => setIsOpen(false)}>
              <FiX size={20} />
            </CloseButton>
          </ChatHeader>

          <ChatMessages>
            {messages.map((message) => (
              <Message key={message.id} isUser={message.isUser}>
                <MessageIcon isUser={message.isUser}>
                  {message.isUser ? <FiUser size={16} /> : <LotusIcon size={16} />}
                </MessageIcon>
                <div>
                  <MessageBubble isUser={message.isUser}>
                    {message.text}
                  </MessageBubble>
                  {message.quickActions && (
                    <QuickActions>
                      {message.quickActions.map((action, index) => (
                        <QuickActionButton
                          key={index}
                          onClick={() => handleQuickAction(action)}
                        >
                          {action}
                        </QuickActionButton>
                      ))}
                    </QuickActions>
                  )}
                </div>
              </Message>
            ))}
            
            {isTyping && (
              <Message isUser={false}>
                <MessageIcon isUser={false}>
                  <LotusIcon size={16} />
                </MessageIcon>
                <TypingIndicator>
                  <div className="dots">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                  <span>Assistant is typing...</span>
                </TypingIndicator>
              </Message>
            )}
            <div ref={messagesEndRef} />
          </ChatMessages>

          <ChatInput>
            <MessageInput
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <SendButton
              onClick={() => sendMessage()}
              disabled={!inputValue.trim() || isLoading}
            >
              <FiSend size={16} />
            </SendButton>
          </ChatInput>
        </ChatWindow>
      )}

      <ChatToggle onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FiX size={24} /> : <LotusIcon size={24} />}
      </ChatToggle>
    </ChatContainer>
  );
};

export default AIChat;

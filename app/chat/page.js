'use client';

import { useState, useRef, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import './chat.css';

export default function ChatPage() {
  const [userName, setUserName] = useState('');
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const { 
    isConnected, 
    messages, 
    currentUser, 
    joinChat, 
    sendMessage, 
    sendTyping 
  } = useSocket();

  // Generate unique user ID
  const generateUserId = () => {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  const handleJoin = () => {
    const name = userName.trim() || 'User_' + Math.random().toString(36).substr(2, 5);
    let userId = localStorage.getItem('chat-userId');
    if (!userId) {
      userId = generateUserId();
      localStorage.setItem('chat-userId', userId);
    }
    setUserName(name);
    setIsLoggedIn(true);
    joinChat(userId, name, 'user');
  };

  const handleSend = () => {
    if (!message.trim()) return;
    
    sendMessage(message);
    setMessage('');
    setTypingIndicator(false);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    isTypingRef.current = false;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    } else {
      handleTyping();
    }
  };

  const handleTyping = () => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      sendTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false);
      isTypingRef.current = false;
    }, 1000);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isLoggedIn) {
    return (
      <div className="chat-container">
        <div className="chat-header">
          <h2>💬 Live Chat Support</h2>
        </div>
        <div className="login-form">
          <h3>Enter Your Name</h3>
          <input
            type="text"
            className="login-input"
            placeholder="Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
            maxLength={50}
          />
          <button className="login-button" onClick={handleJoin}>
            Start Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>💬 Live Chat Support</h2>
        <div>
          <span className={`status-indicator ${isConnected ? 'online' : 'offline'}`}></span>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      <div className="chat-messages" id="messagesContainer">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.userType === 'user' ? 'user-message' : 'support-message'}`}
          >
            <div className="message-bubble">{msg.message}</div>
            <div className="message-info">
              {msg.userName} • {formatTime(msg.timestamp)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {typingIndicator && (
        <div className="typing-indicator">Support is typing...</div>
      )}

      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <input
            type="text"
            className="chat-input"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="send-button" onClick={handleSend}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}


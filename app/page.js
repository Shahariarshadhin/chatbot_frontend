'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import './chat/chat.css';

export default function Home() {
  const router = useRouter();
  const [userType, setUserType] = useState(null);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const { 
    isConnected, 
    messages, 
    joinChat, 
    sendMessage, 
    sendTyping 
  } = useSocket();

  useEffect(() => {
    const type = localStorage.getItem('userType');
    setUserType(type);
  }, []);

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

  const toggleWidget = () => {
    setIsWidgetOpen(!isWidgetOpen);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        gap: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative'
      }}>
        {userType === 'admin' && (
          <button
            onClick={() => router.push('/admin')}
            style={{
              padding: '20px 40px',
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '16px',
              fontSize: '18px',
              cursor: 'pointer',
              fontWeight: '700',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
              letterSpacing: '-0.5px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 15px 40px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
            }}
          >
            👨‍💼 Admin Panel
          </button>
        )}

        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: 'white'
        }}>
          <h1 style={{ fontSize: '48px', marginBottom: '16px', fontWeight: '800', letterSpacing: '-1px' }}>
            Welcome! 👋
          </h1>
          <p style={{ fontSize: '20px', opacity: 0.9, marginBottom: '32px' }}>
            Need help? Chat with us!
          </p>
        </div>
      </div>

      {/* Floating Chat Button */}
      <button 
        className="floating-chat-button" 
        onClick={toggleWidget}
        aria-label="Open chat"
      >
        {isWidgetOpen ? '✕' : '💬'}
      </button>

      {/* Chat Widget Modal */}
      {isWidgetOpen && (
        <div className={`chat-widget ${isWidgetOpen ? 'chat-widget-open' : 'chat-widget-minimized'}`}>
          {!isLoggedIn ? (
            <>
              <div className="chat-header">
                <h2>💬 Live Chat Support</h2>
                <button className="close-widget-btn" onClick={toggleWidget}>✕</button>
              </div>
              <div className="login-form">
                <h3>Welcome! 👋</h3>
                <p style={{ color: '#718096', marginBottom: '20px', fontSize: '14px' }}>
                  Start a conversation with our support team
                </p>
                <input
                  type="text"
                  className="login-input"
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                  maxLength={50}
                />
                <button className="login-button" onClick={handleJoin}>
                  Start Chat
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="chat-header">
                <div>
                  <h2>💬 Live Support</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span className={`status-indicator ${isConnected ? 'online' : 'offline'}`}></span>
                    <span style={{ fontSize: '13px', opacity: 0.9 }}>
                      {isConnected ? 'We\'re online' : 'Connecting...'}
                    </span>
                  </div>
                </div>
                <button className="close-widget-btn" onClick={toggleWidget}>✕</button>
              </div>

              <div className="chat-messages" id="messagesContainer">
                {messages.map((msg, index) => (
                  <div
                    key={`${msg.id || index}-${msg.timestamp}`}
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
                    ➤
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
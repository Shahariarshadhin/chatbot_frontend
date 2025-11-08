'use client'

import { useState, useRef, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { getConversation } from '@/lib/api';
import './admin.css';

export default function AdminPage() {
  const [adminName, setAdminName] = useState('Admin');
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [typingIndicator, setTypingIndicator] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const { 
    isConnected, 
    messages, 
    onlineUsers, 
    currentUser, 
    joinChat, 
    sendMessage, 
    sendTyping,
    selectUserChat 
  } = useSocket();

  // Generate admin ID
  const generateAdminId = () => {
    return 'admin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  const handleJoin = () => {
    const name = adminName.trim() || 'Admin';
    const adminId = generateAdminId();
    setIsLoggedIn(true);
    joinChat(adminId, name, 'admin');
    localStorage.setItem('userType', 'admin');
  };

  const handleSelectUser = (userId, userName) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    selectUserChat(userId);
  };

  const handleSend = () => {
    if (!message.trim() || !selectedUserId) return;
    
    sendMessage(message, selectedUserId);
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
    if (!selectedUserId) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      sendTyping(true, selectedUserId);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false, selectedUserId);
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
  }, [messages, selectedUserId]);

  // Debug: Log messages when they change
  useEffect(() => {
    console.log('📊 Total messages in state:', messages.length);
    if (selectedUserId) {
      const filtered = messages.filter(msg => 
        msg.userId === selectedUserId || 
        msg.toUserId === selectedUserId
      );
      console.log(`📊 Filtered messages for ${selectedUserId}:`, filtered.length);
    }
  }, [messages, selectedUserId]);

  // Filter messages for selected user
  const filteredMessages = selectedUserId 
    ? messages.filter(msg => 
        msg.userId === selectedUserId || 
        msg.toUserId === selectedUserId
      )
    : [];

  // Get last message for each user
  const getLastMessage = (userId) => {
    const userMessages = messages.filter(msg => 
      msg.userId === userId || msg.toUserId === userId
    );
    
    if (userMessages.length === 0) return null;
    
    // Get the most recent message
    const lastMsg = userMessages[userMessages.length - 1];
    return lastMsg;
  };

  // Count unread messages (messages from user that are not from admin)
  const getUnreadCount = (userId) => {
    if (selectedUserId === userId) return 0; // No unread if currently viewing
    
    const unreadMessages = messages.filter(msg => 
      msg.userId === userId && 
      msg.userType !== 'admin' && 
      msg.userType !== 'support'
    );
    
    return unreadMessages.length;
  };

  // Truncate message for preview
  const truncateMessage = (text, maxLength = 30) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Sort users by most recent message
  const sortedOnlineUsers = [...onlineUsers].sort((a, b) => {
    const lastMsgA = getLastMessage(a.userId);
    const lastMsgB = getLastMessage(b.userId);
    
    if (!lastMsgA && !lastMsgB) return 0;
    if (!lastMsgA) return 1;
    if (!lastMsgB) return -1;
    
    return new Date(lastMsgB.timestamp) - new Date(lastMsgA.timestamp);
  });

  if (!isLoggedIn) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          textAlign: 'center',
          width: '400px'
        }}>
          <h2>🔐 Admin Login</h2>
          <input
            type="text"
            style={{
              width: '100%',
              padding: '12px',
              margin: '10px 0',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px'
            }}
            placeholder="Admin Name"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
            maxLength={50}
          />
          <button
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '10px'
            }}
            onClick={handleJoin}
          >
            Enter Admin Panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f0f2f5' }}>
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>👥 Chats</h2>
          <div style={{ marginTop: '10px', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              <span className="status-badge"></span>
              {sortedOnlineUsers.length} online
            </span>
            {sortedOnlineUsers.filter(u => getUnreadCount(u.userId) > 0).length > 0 && (
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' }}>
                {sortedOnlineUsers.reduce((sum, u) => sum + getUnreadCount(u.userId), 0)} unread
              </span>
            )}
          </div>
        </div>
        <div className="online-users-list">
          {sortedOnlineUsers.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
              No users online
            </div>
          ) : (
            sortedOnlineUsers.map((user) => {
              const lastMessage = getLastMessage(user.userId);
              const unreadCount = getUnreadCount(user.userId);
              return (
                <div
                  key={user.userId}
                  className={`user-item ${selectedUserId === user.userId ? 'active' : ''}`}
                  onClick={() => handleSelectUser(user.userId, user.userName)}
                >
                  <div className="user-item-header">
                    <div className="user-item-name">
                      <span className="status-badge"></span>
                      {user.userName}
                    </div>
                    {lastMessage && (
                      <div className="user-item-time">
                        {formatTime(lastMessage.timestamp)}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {lastMessage && (
                      <div className="user-item-preview">
                        <span className={lastMessage.userType === 'user' ? 'preview-user' : 'preview-admin'}>
                          {lastMessage.userType === 'admin' ? 'You: ' : ''}
                        </span>
                        {truncateMessage(lastMessage.message)}
                      </div>
                    )}
                    {unreadCount > 0 && (
                      <div className="unread-badge">
                        {unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main-content">
        {!selectedUserId ? (
          <div className="no-chat-selected">
            Select a user from the sidebar to start chatting
          </div>
        ) : (
          <>
            <div className="chat-header">
              <div>
                <h3 style={{ fontSize: '20px', color: '#666' }}>{selectedUserName}</h3>
                <span style={{ fontSize: '12px', color: '#666' }}>{selectedUserId}</span>
              </div>
              <div>
                <span className="status-badge"></span>
                <span style={{ fontSize: '20px', color: '#666' }}>Online</span>
              </div>
            </div>
            <div className="chat-messages" id="messagesContainer">
              {filteredMessages.map((msg, index) => {
                // Simply check the userType field from the database
                const isAdminMessage = msg.userType === 'admin' || msg.userType === 'support';
                
                return (
                  <div
                    key={index}
                    className={`message ${isAdminMessage ? 'admin-message' : 'user-message'}`}
                  >
                    <div className="message-bubble">{msg.message}</div>
                    <div className="message-info">
                      {msg.userName} • {formatTime(msg.timestamp)}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            {typingIndicator && (
              <div className="typing-indicator">User is typing...</div>
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
          </>
        )}
      </div>
    </div>
  );
}
'use client';

import { useEffect, useState, useRef } from 'react';
import { initSocket } from '@/lib/socket';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState({
    userId: null,
    userName: null,
    userType: null,
  });
  const socketRef = useRef(null);
  const hasLoadedHistory = useRef(false);

  useEffect(() => {
    const socketInstance = initSocket();
    socketRef.current = socketInstance;
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('✅ Connected to server');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setIsConnected(false);
    });

    socketInstance.on('joined-chat', (data) => {
      console.log('Joined chat:', data);
      setCurrentUser({
        userId: data.user?.userId || data.user?._id,
        userName: data.user?.userName,
        userType: data.user?.userType,
      });
    });

    socketInstance.on('message-history', (history) => {
      console.log('📜 Received message history:', history.length, 'messages');
      
      // For admin: completely replace messages with history from database
      // For users: merge with existing messages
      setMessages((prev) => {
        // If this is the first load, just use the history
        if (!hasLoadedHistory.current) {
          hasLoadedHistory.current = true;
          return history;
        }
        
        // Otherwise, merge avoiding duplicates
        const combined = [...prev];
        history.forEach((msg) => {
          const exists = combined.some((m) => 
            m.id === msg.id || 
            (m.timestamp === msg.timestamp && 
             m.userId === msg.userId && 
             m.message === msg.message)
          );
          if (!exists) {
            combined.push(msg);
          }
        });
        
        // Sort by timestamp
        return combined.sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
      });
    });

    socketInstance.on('new-message', (message) => {
      console.log('📨 New message received:', message);
      setMessages((prev) => {
        // Check if message already exists
        const exists = prev.some((m) => 
          m.id === message.id || 
          (m.timestamp === message.timestamp && 
           m.userId === message.userId && 
           m.message === message.message)
        );
        
        if (exists) {
          return prev;
        }
        
        return [...prev, message];
      });
    });

    socketInstance.on('user-chat-history', (data) => {
      console.log('📜 Received user chat history:', data);
      // This is for when admin selects a specific user
      // We already have all messages, so we can ignore this
    });

    socketInstance.on('online-users', (users) => {
      console.log('👥 Online users updated:', users);
      setOnlineUsers(users);
    });

    socketInstance.on('new-user-online', (data) => {
      console.log('New user online:', data);
    });

    socketInstance.on('user-offline', (data) => {
      console.log('User offline:', data);
    });

    socketInstance.on('typing', (data) => {
      // Handle typing indicator
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('joined-chat');
        socketRef.current.off('message-history');
        socketRef.current.off('new-message');
        socketRef.current.off('user-chat-history');
        socketRef.current.off('online-users');
        socketRef.current.off('new-user-online');
        socketRef.current.off('user-offline');
        socketRef.current.off('typing');
        socketRef.current.off('error');
      }
    };
  }, []);

  const joinChat = (userId, userName, userType) => {
    if (socketRef.current) {
      socketRef.current.emit('join-chat', {
        userId,
        userName,
        userType,
      });
    }
  };

  const sendMessage = (message, toUserId) => {
    if (socketRef.current && currentUser.userId) {
      socketRef.current.emit('send-message', {
        message,
        toUserId,
      });
    }
  };

  const sendTyping = (isTyping, toUserId) => {
    if (socketRef.current) {
      socketRef.current.emit('typing', {
        isTyping,
        toUserId,
      });
    }
  };

  const selectUserChat = (userId) => {
    if (socketRef.current) {
      socketRef.current.emit('admin-join-user-chat', { userId });
    }
  };

  return {
    socket,
    isConnected,
    messages,
    onlineUsers,
    currentUser,
    joinChat,
    sendMessage,
    sendTyping,
    selectUserChat,
  };
};
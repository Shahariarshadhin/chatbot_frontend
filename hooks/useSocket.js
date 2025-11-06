'use client';

import { useEffect, useState, useRef } from 'react';
import { initSocket } from '@/lib/socket';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chat-messages');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing messages from localStorage', e);
          return [];
        }
      }
    }
    return [];
  });
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState({
    userId: null,
    userName: null,
    userType: null,
  });
  const socketRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chat-messages', JSON.stringify(messages));
    }
  }, [messages]);

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
      setMessages((prev) => {
        const combined = [...prev];
        history.forEach((msg) => {
          if (!combined.some((m) => m.id === msg.id)) {
            combined.push(msg);
          }
        });
        return combined;
      });
    });

    socketInstance.on('new-message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketInstance.on('online-users', (users) => {
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


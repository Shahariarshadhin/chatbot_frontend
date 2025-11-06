import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get message history for a user
export const getUserMessages = async (userId, limit = 100, skip = 0) => {
  try {
    const response = await api.get(`/api/messages/user/${userId}`, {
      params: { limit, skip },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user messages:', error);
    throw error;
  }
};

// Get all messages (admin)
export const getAllMessages = async (limit = 500, skip = 0) => {
  try {
    const response = await api.get('/api/messages/all', {
      params: { limit, skip },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all messages:', error);
    throw error;
  }
};

// Get conversation between two users
export const getConversation = async (userId1, userId2) => {
  try {
    const response = await api.get(`/api/messages/conversation/${userId1}/${userId2}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
};

// Delete a message
export const deleteMessage = async (messageId) => {
  try {
    const response = await api.delete(`/api/messages/${messageId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};


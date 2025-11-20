import api from './api';

const messageService = {
  // Get messages for a room or private chat
  getMessages: async (room, userId, page = 1) => {
    const params = new URLSearchParams();
    if (room) params.append('room', room);
    if (userId) params.append('userId', userId);
    params.append('page', page);
    
    const response = await api.get(`/messages?${params}`);
    return response.data;
  },
  
  // Add a reaction to a message
  addReaction: async (messageId, reaction) => {
    const response = await api.post(`/messages/${messageId}/reaction`, { reaction });
    return response.data;
  },
  
  // Reply to a message
  replyToMessage: async (messageId, content) => {
    const response = await api.post(`/messages/${messageId}/reply`, { content });
    return response.data;
  }
};

export default messageService;
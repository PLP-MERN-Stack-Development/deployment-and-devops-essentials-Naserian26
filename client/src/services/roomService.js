import api from './api';

const roomService = {
  // Get all rooms
  getRooms: async () => {
    const response = await api.get('/rooms');
    return response.data;
  },
  
  // Create a new room
  createRoom: async (roomData) => {
    const response = await api.post('/rooms', roomData);
    return response.data;
  },
  
  // Join a room
  joinRoom: async (roomId) => {
    const response = await api.post(`/rooms/${roomId}/join`);
    return response.data;
  }
};

export default roomService;
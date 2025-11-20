import { create } from 'zustand';

const useChatStore = create((set, get) => ({
  rooms: ['global'],
  currentRoom: 'global',
  messages: {},
  onlineUsers: [],
  typingUsers: {},
  notifications: [],
  unreadCounts: {},
  
  setRooms: (rooms) => {
    set({ rooms });
  },
  
  setCurrentRoom: (room) => {
    set({ currentRoom: room });
  },
  
  setMessages: (room, messages) => {
    set(state => ({
      messages: {
        ...state.messages,
        [room]: messages
      }
    }));
  },
  
  addMessage: (room, message) => {
    set(state => ({
      messages: {
        ...state.messages,
        [room]: [...(state.messages[room] || []), message]
      }
    }));
  },
  
  setOnlineUsers: (users) => {
    set({ onlineUsers: users });
  },
  
  setTypingUsers: (room, users) => {
    set(state => ({
      typingUsers: {
        ...state.typingUsers,
        [room]: users
      }
    }));
  },
  
  addNotification: (notification) => {
    set(state => ({
      notifications: [notification, ...state.notifications].slice(0, 10)
    }));
  },
  
  setUnreadCount: (room, count) => {
    set(state => ({
      unreadCounts: {
        ...state.unreadCounts,
        [room]: count
      }
    }));
  },
  
  incrementUnreadCount: (room) => {
    set(state => ({
      unreadCounts: {
        ...state.unreadCounts,
        [room]: (state.unreadCounts[room] || 0) + 1
      }
    }));
  },
  
  clearUnreadCount: (room) => {
    set(state => ({
      unreadCounts: {
        ...state.unreadCounts,
        [room]: 0
      }
    }));
  }
}));

export default useChatStore;
import { useEffect, useRef, useState } from 'react';
import socket from '../socket/socket';
import useAuthStore from '../store/authStore';
import useChatStore from '../store/chatStore';
import messageService from '../services/messageService';
import { notificationSound } from '../utils/sounds';

export const useSocket = () => {
  const { token, isAuthenticated } = useAuthStore();
  const {
    currentRoom,
    setMessages,
    addMessage,
    setOnlineUsers,
    setTypingUsers,
    addNotification,
    incrementUnreadCount,
    clearUnreadCount
  } = useChatStore();
  
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  
  // Ref to track if we've authenticated
  const authenticatedRef = useRef(false);
  
  // Connect to socket
  useEffect(() => {
    if (isAuthenticated && token && !authenticatedRef.current) {
      socket.connect();
      socket.emit('authenticate', token);
      authenticatedRef.current = true;
    } else if (!isAuthenticated && socket.connected) {
      socket.disconnect();
      authenticatedRef.current = false;
    }
    
    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [isAuthenticated, token]);
  
  // Socket event listeners
  useEffect(() => {
    // Connection events
    const handleConnect = () => {
      setIsConnected(true);
      setError(null);
    };
    
    const handleDisconnect = () => {
      setIsConnected(false);
    };
    
    const handleConnectError = (err) => {
      setError(err.message);
    };
    
    // Authentication events
    const handleAuthenticated = ({ user }) => {
      useAuthStore.getState().updateUser(user);
    };
    
    const handleAuthenticationError = ({ message }) => {
      setError(message);
    };
    
    // User events
    const handleUserList = (users) => {
      setOnlineUsers(users);
    };
    
    const handleUserJoined = (user) => {
      addNotification({
        type: 'user_joined',
        message: `${user.username} joined the chat`,
        timestamp: new Date()
      });
    };
    
    const handleUserLeft = (user) => {
      addNotification({
        type: 'user_left',
        message: `${user.username} left the chat`,
        timestamp: new Date()
      });
    };
    
    // Room events
    const handleRoomMessages = ({ room, messages }) => {
      setMessages(room, messages);
    };
    
    const handleUserJoinedRoom = ({ room, user }) => {
      addNotification({
        type: 'user_joined_room',
        message: `${user.username} joined ${room}`,
        timestamp: new Date()
      });
    };
    
    // Message events
    const handleReceiveMessage = (message) => {
      addMessage(message.room, message);
      
      // Play notification sound if not in the same room
      if (message.room !== currentRoom) {
        incrementUnreadCount(message.room);
        notificationSound.play();
      }
    };
    
    const handlePrivateMessage = (message) => {
      // Add to private messages room
      const roomId = message.senderId === useAuthStore.getState().user.id 
        ? `private-${message.recipientId}` 
        : `private-${message.senderId}`;
      
      addMessage(roomId, message);
      
      // Play notification sound
      notificationSound.play();
      
      // Add notification
      addNotification({
        type: 'new_private_message',
        message: `New private message from ${message.senderName}`,
        timestamp: new Date()
      });
    };
    
    // Typing events
    const handleUserTyping = ({ username, room }) => {
      setTypingUsers(room, prev => [...prev, username]);
    };
    
    const handleUserStopTyping = ({ username, room }) => {
      setTypingUsers(room, prev => prev.filter(u => u !== username));
    };
    
    // Reaction events
    const handleMessageReactionUpdated = ({ messageId, reactions }) => {
      // Update message in state
      // This would require more complex state management
      // For now, we'll just log it
      console.log('Reaction updated:', messageId, reactions);
    };
    
    // Reply events
    const handleMessageReplyAdded = ({ messageId, reply }) => {
      // Update message in state
      // This would require more complex state management
      // For now, we'll just log it
      console.log('Reply added:', messageId, reply);
    };
    
    // Read receipt events
    const handleMessagesRead = ({ readerId, room }) => {
      // Update read status in state
      // This would require more complex state management
      // For now, we'll just log it
      console.log('Messages read by:', readerId, 'in room:', room);
    };
    
    // Notification events
    const handleNotification = (notification) => {
      addNotification({
        ...notification,
        timestamp: new Date()
      });
      
      // Show browser notification if permitted
      if (Notification.permission === 'granted') {
        new Notification(notification.message, {
          body: notification.data ? JSON.stringify(notification.data) : '',
          icon: '/favicon.ico'
        });
      }
    };
    
    // Register event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    
    socket.on('authenticated', handleAuthenticated);
    socket.on('authentication_error', handleAuthenticationError);
    
    socket.on('user_list', handleUserList);
    socket.on('user_joined', handleUserJoined);
    socket.on('user_left', handleUserLeft);
    
    socket.on('room_messages', handleRoomMessages);
    socket.on('user_joined_room', handleUserJoinedRoom);
    
    socket.on('receive_message', handleReceiveMessage);
    socket.on('private_message', handlePrivateMessage);
    
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);
    
    socket.on('message_reaction_updated', handleMessageReactionUpdated);
    socket.on('message_reply_added', handleMessageReplyAdded);
    socket.on('messages_read', handleMessagesRead);
    
    socket.on('notification', handleNotification);
    
    // Clean up event listeners
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      
      socket.off('authenticated', handleAuthenticated);
      socket.off('authentication_error', handleAuthenticationError);
      
      socket.off('user_list', handleUserList);
      socket.off('user_joined', handleUserJoined);
      socket.off('user_left', handleUserLeft);
      
      socket.off('room_messages', handleRoomMessages);
      socket.off('user_joined_room', handleUserJoinedRoom);
      
      socket.off('receive_message', handleReceiveMessage);
      socket.off('private_message', handlePrivateMessage);
      
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
      
      socket.off('message_reaction_updated', handleMessageReactionUpdated);
      socket.off('message_reply_added', handleMessageReplyAdded);
      socket.off('messages_read', handleMessagesRead);
      
      socket.off('notification', handleNotification);
    };
  }, [currentRoom, setMessages, addMessage, setOnlineUsers, setTypingUsers, addNotification, incrementUnreadCount]);
  
  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
  
  // Join room when currentRoom changes
  useEffect(() => {
    if (isConnected && currentRoom) {
      socket.emit('join_room', currentRoom);
      clearUnreadCount(currentRoom);
    }
  }, [isConnected, currentRoom, clearUnreadCount]);
  
  // Send message function
  const sendMessage = (content, room = currentRoom, fileUrl = '', fileType = '') => {
    if (!isConnected) return false;
    
    socket.emit('send_message', {
      content,
      room,
      fileUrl,
      fileType
    });
    
    return true;
  };
  
  // Send private message function
  const sendPrivateMessage = (recipientId, content, fileUrl = '', fileType = '') => {
    if (!isConnected) return false;
    
    socket.emit('private_message', {
      recipientId,
      content,
      fileUrl,
      fileType
    });
    
    return true;
  };
  
  // Set typing status
  const setTyping = (isTyping, room = currentRoom) => {
    if (!isConnected) return;
    
    socket.emit('typing', {
      isTyping,
      room
    });
  };
  
  // Add reaction to message
  const addReaction = (messageId, reaction) => {
    if (!isConnected) return;
    
    socket.emit('message_reaction', {
      messageId,
      reaction
    });
  };
  
  // Reply to message
  const replyToMessage = (messageId, content) => {
    if (!isConnected) return;
    
    socket.emit('message_reply', {
      messageId,
      content
    });
  };
  
  // Mark messages as read
  const markMessagesAsRead = (room = null, userId = null) => {
    if (!isConnected) return;
    
    socket.emit('mark_messages_read', {
      room,
      userId
    });
  };
  
  return {
    isConnected,
    error,
    sendMessage,
    sendPrivateMessage,
    setTyping,
    addReaction,
    replyToMessage,
    markMessagesAsRead
  };
};
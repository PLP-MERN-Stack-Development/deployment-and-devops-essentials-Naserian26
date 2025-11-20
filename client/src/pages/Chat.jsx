import { useState, useEffect, useRef } from 'react';
import { FiSend, FiPaperclip, FiSmile, FiMoreVertical } from 'react-icons/fi';
import { useSocket } from '../hooks/useSocket';
import useAuth from '../hooks/useAuth';

import useChatStore from '../store/chatStore';
import MessageList from '../components/Chat/MessageList';
import TypingIndicator from '../components/Chat/TypingIndicator';
import EmojiPicker from '../components/Chat/EmojiPicker';
import FileUpload from '../components/Chat/FileUpload';
import RoomList from '../components/Chat/RoomList';
import UserList from '../components/Chat/UserList';
import NotificationList from '../components/Notifications/NotificationList';
import { formatTime } from '../utils/helpers';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  
  const { user } = useAuth();
  const { 
    currentRoom, 
    messages, 
    typingUsers, 
    onlineUsers,
    notifications 
  } = useChatStore();
  
  const { 
    isConnected, 
    sendMessage, 
    setTyping 
  } = useSocket();
  
  const messageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  // Handle message input change
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    
    // Handle typing indicator
    if (!isTyping) {
      setIsTyping(true);
      setTyping(true, currentRoom);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setTyping(false, currentRoom);
    }, 1000);
  };
  
  // Handle message submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!message.trim() && !replyingTo) return;
    
    // If replying to a message, include the reply
    if (replyingTo) {
      // Send reply to the original message
      // This would be handled by the socket service
      setReplyingTo(null);
    }
    
    // Send message
    sendMessage(message.trim());
    
    // Clear input and reset typing state
    setMessage('');
    setIsTyping(false);
    setTyping(false, currentRoom);
    
    // Focus input
    messageInputRef.current?.focus();
  };
  
  // Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    setMessage(prevMessage => prevMessage + emoji);
    setShowEmojiPicker(false);
    messageInputRef.current?.focus();
  };
  
  // Handle file upload
  const handleFileUpload = (fileData) => {
    sendMessage('', currentRoom, fileData.fileUrl, fileData.fileType);
    setShowFileUpload(false);
  };
  
  // Handle reply to message
  const handleReply = (message) => {
    setReplyingTo(message);
    messageInputRef.current?.focus();
  };
  
  // Cancel reply
  const cancelReply = () => {
    setReplyingTo(null);
  };
  
  // Get current room messages
  const currentMessages = messages[currentRoom] || [];
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* User info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
              {user?.username.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-900">{user?.username}</p>
              <p className="text-xs text-gray-500">
                {isConnected ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Room list */}
        <div className="flex-1 overflow-y-auto">
          <RoomList />
        </div>
        
        {/* User list */}
        <div className="border-t border-gray-200">
          <UserList />
        </div>
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              {currentRoom === 'global' ? 'Global Chat' : currentRoom}
            </h2>
            <p className="text-sm text-gray-500">
              {onlineUsers.length} users online
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Notifications button */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <FiMoreVertical />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>
        </div>
        
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <MessageList 
            messages={currentMessages} 
            currentUserId={user?.id}
            onReply={handleReply}
          />
          
          {/* Typing indicator */}
          {typingUsers[currentRoom]?.length > 0 && (
            <TypingIndicator users={typingUsers[currentRoom]} />
          )}
        </div>
        
        {/* Reply preview */}
        {replyingTo && (
          <div className="bg-gray-100 px-4 py-2 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm">
              <span className="font-medium">Replying to {replyingTo.senderName}:</span>
              <p className="text-gray-600 truncate">{replyingTo.content}</p>
            </div>
            <button
              onClick={cancelReply}
              className="text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          </div>
        )}
        
        {/* Message input */}
        <div className="bg-white border-t border-gray-200 px-4 py-3">
          <form onSubmit={handleSubmit} className="flex items-end space-x-2">
            {/* File upload button */}
            <button
              type="button"
              onClick={() => setShowFileUpload(!showFileUpload)}
              className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <FiPaperclip />
            </button>
            
            {/* Emoji picker button */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <FiSmile />
            </button>
            
            {/* Message input */}
            <div className="flex-1">
              <input
                ref={messageInputRef}
                type="text"
                value={message}
                onChange={handleMessageChange}
                placeholder="Type a message..."
                className="input"
                disabled={!isConnected}
              />
            </div>
            
            {/* Send button */}
            <button
              type="submit"
              disabled={!message.trim() || !isConnected}
              className="p-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSend />
            </button>
          </form>
          
          {/* Emoji picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-20 left-4 z-10">
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            </div>
          )}
          
          {/* File upload */}
          {showFileUpload && (
            <div className="absolute bottom-20 left-4 z-10">
              <FileUpload 
                onFileUpload={handleFileUpload}
                onCancel={() => setShowFileUpload(false)}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Notifications sidebar */}
      {showNotifications && (
        <div className="w-80 bg-white border-l border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Notifications</h3>
            <button
              onClick={() => setShowNotifications(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          </div>
          <NotificationList notifications={notifications} />
        </div>
      )}
    </div>
  );
};

export default Chat;
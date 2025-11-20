import { format } from 'date-fns';

// Format timestamp to readable time
export const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return format(date, 'h:mm a');
};

// Format timestamp to readable date and time
export const formatDateTime = (timestamp) => {
  const date = new Date(timestamp);
  return format(date, 'MMM d, yyyy, h:mm a');
};

// Check if message is from current user
export const isFromCurrentUser = (message, currentUserId) => {
  return message.senderId === currentUserId || message.senderId === currentUserId.toString();
};

// Generate room ID for private chat
export const generatePrivateRoomId = (userId1, userId2) => {
  return [userId1, userId2].sort().join('-');
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Get file icon based on file type
export const getFileIcon = (fileType) => {
  switch (fileType) {
    case 'image':
      return '🖼️';
    case 'document':
      return '📄';
    case 'audio':
      return '🎵';
    case 'video':
      return '🎬';
    default:
      return '📎';
  }
};

// Get reaction emoji
export const getReactionEmoji = (reaction) => {
  switch (reaction) {
    case 'like':
      return '👍';
    case 'love':
      return '❤️';
    case 'laugh':
      return '😂';
    case 'angry':
      return '😠';
    default:
      return '';
  }
};
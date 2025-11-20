import { useRef, useEffect } from 'react';
import MessageItem from './MessageItem';
import { formatTime, isFromCurrentUser } from '../../utils/helpers';

const MessageList = ({ messages, currentUserId, onReply }) => {
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};
    
    messages.forEach(message => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };
  
  const messageGroups = groupMessagesByDate(messages);
  
  return (
    <div className="space-y-4">
      {Object.entries(messageGroups).map(([date, dateMessages]) => (
        <div key={date}>
          {/* Date separator */}
          <div className="flex items-center justify-center my-4">
            <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
              {date === new Date().toDateString() ? 'Today' : date}
            </div>
          </div>
          
          {/* Messages for this date */}
          <div className="space-y-2">
            {dateMessages.map((message, index) => (
              <MessageItem
                key={message._id || index}
                message={message}
                isFromCurrentUser={isFromCurrentUser(message, currentUserId)}
                onReply={onReply}
              />
            ))}
          </div>
        </div>
      ))}
      
      {/* Scroll to bottom ref */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
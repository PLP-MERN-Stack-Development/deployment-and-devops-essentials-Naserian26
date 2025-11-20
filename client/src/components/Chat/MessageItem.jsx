import { useState } from 'react';
import { FiCornerUpLeft, FiCheck, FiCheckCircle } from 'react-icons/fi';
import { formatTime, getFileIcon } from '../../utils/helpers';
import ReactionBar from './ReactionBar';
import ReplyList from './ReplyList';

const MessageItem = ({ message, isFromCurrentUser, onReply }) => {
  const [showActions, setShowActions] = useState(false);

  const handleReply = () => {
    onReply(message);
    setShowActions(false);
  };

  const handleReaction = (reaction) => {
    console.log('Add reaction:', reaction, 'to message:', message._id);
    setShowActions(false);
  };

  return (
    <div
      className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'} mb-2`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`max-w-xs lg:max-w-md ${isFromCurrentUser ? 'order-2' : 'order-1'}`}>
        {/* Message content */}
        <div className={`message-bubble ${isFromCurrentUser ? 'message-sent' : 'message-received'}`}>
          {!isFromCurrentUser && (
            <p className="text-xs font-medium mb-1 opacity-75">{message.senderName}</p>
          )}

          <p className="text-sm">{message.content}</p>

          {message.fileUrl && (
            <div className="mt-2">
              {message.fileType === 'image' ? (
                <img src={message.fileUrl} alt="Attachment" className="rounded-md max-w-full h-auto" />
              ) : (
                <a
                  href={message.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm underline"
                >
                  <span>{getFileIcon(message.fileType)}</span>
                  <span>View file</span>
                </a>
              )}
            </div>
          )}

          <div className="flex items-center justify-end mt-1 space-x-1">
            <span className="text-xs opacity-75">{formatTime(message.createdAt)}</span>
            {isFromCurrentUser && (
              <span className="text-xs opacity-75">
                {message.readBy?.length > 0 ? <FiCheckCircle /> : <FiCheck />}
              </span>
            )}
          </div>
        </div>

        {/* Message actions (Reply / etc.) */}
        {showActions && (
          <div className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'} mt-1`}>
            <div className="bg-white shadow-md rounded-md flex overflow-hidden">
              <button
                onClick={handleReply}
                className="p-2 text-gray-600 hover:bg-gray-100 flex items-center space-x-1"
              >
                <FiCornerUpLeft />
                <span className="text-xs">Reply</span>
              </button>
            </div>
          </div>
        )}

        {/* Reactions */}
        {message.reactions &&
          Object.keys(message.reactions).some((key) => message.reactions[key] > 0) && (
            <ReactionBar reactions={message.reactions} onReaction={handleReaction} />
          )}

        {/* Replies */}
        {message.replies && message.replies.length > 0 && <ReplyList replies={message.replies} />}
      </div>
    </div>
  );
};

export default MessageItem;

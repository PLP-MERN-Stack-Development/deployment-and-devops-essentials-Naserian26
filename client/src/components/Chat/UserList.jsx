import { useState } from 'react';
import { FiCircle, FiMessageSquare } from 'react-icons/fi';
import useChatStore from '../../store/chatStore';
import useAuthStore from '../../store/authStore';
import { generatePrivateRoomId } from '../../utils/helpers';

const UserList = () => {
  const [expanded, setExpanded] = useState(false);
  const { onlineUsers, setCurrentRoom } = useChatStore();
  const { user } = useAuthStore();
  
  const handleStartPrivateChat = (otherUser) => {
    const roomId = generatePrivateRoomId(user.id, otherUser.id);
    setCurrentRoom(roomId);
  };
  
  return (
    <div className="p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-sm font-medium text-gray-700 mb-2"
      >
        <span>Online Users ({onlineUsers.length})</span>
        <svg
          className={`w-4 h-4 transition-transform ${expanded ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {expanded && (
        <ul className="space-y-1">
          {onlineUsers
            .filter(onlineUser => onlineUser.id !== user.id)
            .map(onlineUser => (
              <li key={onlineUser.id}>
                <button
                  onClick={() => handleStartPrivateChat(onlineUser)}
                  className="w-full text-left px-3 py-2 rounded-md flex items-center space-x-2 text-gray-700 hover:bg-gray-100"
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium">
                      {onlineUser.username.charAt(0).toUpperCase()}
                    </div>
                    <FiCircle className="absolute bottom-0 right-0 w-3 h-3 text-green-500 fill-current" />
                  </div>
                  <span className="truncate flex-1">{onlineUser.username}</span>
                  <FiMessageSquare className="text-gray-400" />
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default UserList;
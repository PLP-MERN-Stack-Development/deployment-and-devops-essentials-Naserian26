import { useState, useEffect } from 'react';
import { FiHash, FiPlus, FiLock } from 'react-icons/fi';
import useChatStore from '../../store/chatStore';
import useAuthStore from '../../store/authStore';
import roomService from '../../services/roomService';
import CreateRoomModal from './CreateRoomModal';

const RoomList = () => {
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { rooms, currentRoom, setCurrentRoom, setRooms } = useChatStore();
  const { user } = useAuthStore();
  
  // Fetch rooms on component mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await roomService.getRooms();
        setRooms(['global', ...response.map(room => room.name)]);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRooms();
  }, [setRooms]);
  
  const handleCreateRoom = async (roomData) => {
    try {
      const response = await roomService.createRoom(roomData);
      setRooms(prev => [...prev, response.name]);
      setShowCreateRoom(false);
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };
  
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Rooms</h3>
        <button
          onClick={() => setShowCreateRoom(true)}
          className="p-1 text-gray-500 hover:text-gray-700"
        >
          <FiPlus />
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <ul className="space-y-1">
          {rooms.map(room => (
            <li key={room}>
              <button
                onClick={() => setCurrentRoom(room)}
                className={`w-full text-left px-3 py-2 rounded-md flex items-center space-x-2 transition-colors ${
                  currentRoom === room
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {room === 'global' ? (
                  <FiHash className="text-gray-500" />
                ) : (
                  <FiLock className="text-gray-500" />
                )}
                <span className="truncate">{room}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      
      {showCreateRoom && (
        <CreateRoomModal
          onClose={() => setShowCreateRoom(false)}
          onCreateRoom={handleCreateRoom}
        />
      )}
    </div>
  );
};

export default RoomList;
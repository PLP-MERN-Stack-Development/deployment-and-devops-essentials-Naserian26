import { formatTime } from '../../utils/helpers';

const ReplyList = ({ replies }) => {
  if (!replies || replies.length === 0) return null;
  
  return (
    <div className="mt-2 space-y-1">
      {replies.map((reply, index) => (
        <div key={index} className="bg-gray-100 rounded-md p-2 ml-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-700">{reply.senderName}</p>
            <span className="text-xs text-gray-500">
              {formatTime(reply.timestamp)}
            </span>
          </div>
          <p className="text-sm text-gray-800 mt-1">{reply.content}</p>
        </div>
      ))}
    </div>
  );
};

export default ReplyList;
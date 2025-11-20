import { getReactionEmoji } from '../../utils/helpers';

const ReactionBar = ({ reactions, onReaction }) => {
  const activeReactions = Object.entries(reactions)
    .filter(([_, count]) => count > 0)
    .map(([reaction, count]) => ({ reaction, count }));

  if (activeReactions.length === 0) return null;

  return (
    <div className={`flex ${Object.keys(reactions).length > 3 ? 'flex-wrap' : ''} mt-1`}>
      {activeReactions.map(({ reaction, count }) => (
        <button
          key={reaction}
          onClick={() => onReaction(reaction)}
          className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 rounded-full px-2 py-1 mr-1 mb-1"
        >
          <span>{getReactionEmoji(reaction)}</span>
          <span className="text-xs">{count}</span>
        </button>
      ))}
    </div>
  );
};

export default ReactionBar;

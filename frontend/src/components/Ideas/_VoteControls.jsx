import React from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

export default function VoteControls({
  ideaId,
  upvotes = 0,
  downvotes = 0,
  onVote,
}) {
  const handleVote = (type) => {
    onVote?.(ideaId, type);
  };

  return (
    <div className="flex items-center justify-start gap-4 shrink-0">
      <VoteButton
        icon={<ThumbsUp className="w-4 h-4" />}
        count={upvotes}
        onClick={() => handleVote("up")}
      />
      <VoteButton
        icon={<ThumbsDown className="w-4 h-4" />}
        count={downvotes}
        onClick={() => handleVote("down")}
      />
    </div>
  );
}

function VoteButton({ icon, count = 0, onClick }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className="flex items-center justify-center gap-1 text-gray-700 hover:text-indigo-600 transition-transform hover:scale-110"
    >
      {icon}
      <span className="text-sm font-medium">{count}</span>
    </button>
  );
}

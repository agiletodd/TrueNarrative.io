import React from "react";
import { MessageSquare } from "lucide-react";
import VoteControls from "./_VoteControls";

export default function IdeaCard({ idea, onClick, onVote }) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow hover:shadow-md transition-shadow border border-gray-100 flex gap-4 items-stretch">
      {/* Vote Panel */}
      <div className="flex flex-col items-center justify-center w-14 shrink-0 border-r pr-4">
        <VoteControls
          ideaId={idea.id}
          upvotes={idea.upvotes}
          downvotes={idea.downvotes}
          onVote={onVote}
        />
      </div>

      {/* Content Panel */}
      <div
        onClick={() => onClick?.(idea)}
        className="flex-1 cursor-pointer flex flex-col justify-between"
      >
        <div className="space-y-2">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
            {idea.title}
          </h2>

          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
            {idea.description?.trim() || (
              <span className="text-gray-400 italic">
                No description provided.
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
          <span
            className={`inline-block px-2 py-0.5 rounded-full font-medium ${
              idea.status === "Done"
                ? "bg-green-100 text-green-800"
                : idea.status === "Retired"
                ? "bg-red-100 text-red-700 line-through"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {idea.status}
          </span>

          <span className="flex items-center gap-1">
            <MessageSquare size={14} />
            {idea.commentCount}
          </span>
        </div>
      </div>
    </div>
  );
}

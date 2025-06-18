import React from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

export default function IdeaCard({ idea, onClick }) {
  return (
    <div
      onClick={() => onClick?.(idea)}
      className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition-shadow cursor-pointer border border-gray-100 group"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 space-y-2">
          <h2 className="text-xl font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
            {idea.title}
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
            {idea.description?.trim() || (
              <span className="text-gray-400 italic">
                No description provided.
              </span>
            )}
          </p>
          <span
            className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${
              idea.status === "Done"
                ? "bg-green-100 text-green-800"
                : idea.status === "Retired"
                ? "bg-red-100 text-red-700 line-through"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {idea.status}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center gap-2 shrink-0">
          <VoteButton
            icon={<ThumbsUp className="w-4 h-4" />}
            count={idea.upvotes}
          />
          <VoteButton
            icon={<ThumbsDown className="w-4 h-4" />}
            count={idea.downvotes}
          />
        </div>
      </div>
    </div>
  );
}

function VoteButton({ icon, count = 0 }) {
  return (
    <button
      onClick={(e) => e.stopPropagation()}
      className="flex items-center justify-center gap-1 text-gray-700 hover:text-indigo-600 transition-transform hover:scale-110"
    >
      {icon}
      <span className="text-sm font-medium">{count}</span>
    </button>
  );
}

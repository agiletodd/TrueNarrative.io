import React from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

export default function IdeaCard({ idea, onClick }) {
  return (
    <div
      onClick={() => onClick?.(idea)}
      className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <div className="max-w-[80%]">
          <h2 className="text-lg font-semibold text-gray-800">{idea.title}</h2>
          <p className="text-gray-600 text-sm mt-1">{idea.description}</p>
          <span
            className={`mt-3 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
              idea.status === "Released"
                ? "bg-green-100 text-green-800"
                : idea.status === "Planned"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-indigo-100 text-indigo-800"
            }`}
          >
            {idea.status}
          </span>
        </div>

        <div className="flex flex-col items-center space-y-2">
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-black hover:scale-110 transition"
          >
            <ThumbsUp className="w-5 h-5" />
            <span>{idea.upvotes || 0}</span>
          </button>

          <button
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-black hover:scale-110 transition"
          >
            <ThumbsDown className="w-5 h-5" />
            <span>{idea.downvotes || 0}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

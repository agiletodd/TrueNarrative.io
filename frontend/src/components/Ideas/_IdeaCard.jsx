import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import VoteControls from "./_VoteControls";

export default function IdeaCard({ idea, guid, onVote }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/products/${guid}/ideas/${idea.id}`);
  };

  return (
    <div
      className="bg-white p-4 sm:p-6 rounded-2xl shadow hover:shadow-md transition-shadow border border-gray-100 flex gap-4 items-stretch"
      onClick={handleCardClick}
    >
      {/* Content Panel */}
      <div className="flex-1 flex flex-col justify-between cursor-pointer">
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

      {/* Vote Panel (non-click-propagating) */}
      <div
        className="flex flex-col items-center justify-center shrink-0 pl-4 border-l"
        onClick={(e) => e.stopPropagation()}
      >
        <VoteControls
          ideaId={idea.id}
          upvotes={idea.upvotes}
          downvotes={idea.downvotes}
          onVote={onVote}
        />
      </div>
    </div>
  );
}

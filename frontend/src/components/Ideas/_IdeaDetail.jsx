import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import VoteControls from "./_VoteControls";
import { useVote } from "@/hooks/useVote";
import { useGuestId } from "@/hooks/useGuestId";
import { useApi } from "@/hooks/useApi";

export default function IdeaDetail() {
  const { guid, ideaId } = useParams();
  const api = useApi();

  const [idea, setIdea] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [guestName, setGuestName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const vote = useVote();
  const guestId = useGuestId();

  const token = localStorage.getItem("token");
  const isGuest = !token;

  useEffect(() => {
    async function fetchIdea() {
      try {
        const res = await api.get(`/api/idea/${ideaId}`);
        setIdea(res.data);
      } catch (err) {
        console.error("Failed to fetch idea:", err);
      }
    }

    fetchIdea();
  }, [ideaId]);

  const handleVote = async (ideaId, type) => {
    const updatedIdea = await vote(ideaId, type);
    if (!updatedIdea) return;

    setIdea((prev) => ({
      ...prev,
      ...updatedIdea,
      comments: prev.comments, // keep existing comments
    }));
  };

  const handleSubmit = async () => {
    if (isGuest && (!guestName.trim() || !guestId)) {
      toast.error("Please enter your name to comment.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/api/comments", {
        ideaId: parseInt(ideaId),
        content: newComment,
        guestName: isGuest ? guestName.trim() : undefined,
        guestId: isGuest ? guestId : undefined,
      });

      setIdea((prev) => ({
        ...prev,
        comments: [res.data, ...(prev.comments || [])],
      }));
      setNewComment("");
      setGuestName("");
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!idea) {
    return (
      <div className="text-center py-20 text-gray-500">Loading idea...</div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-3xl mx-auto relative mt-10">
      <Link
        to={`/products/${guid}/ideas`}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
      >
        <X />
      </Link>

      <h2 className="text-2xl font-bold mb-2">{idea.title}</h2>
      <p className="text-gray-700 mb-4">{idea.description}</p>

      <VoteControls
        ideaId={idea.id}
        upvotes={idea.upvotes}
        downvotes={idea.downvotes}
        onVote={handleVote}
      />

      <hr className="my-4" />

      <div className="mb-4 space-y-2">
        {isGuest && (
          <input
            type="text"
            className="w-full border rounded p-2 text-sm"
            placeholder="Your name"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
          />
        )}
        <textarea
          className="w-full border rounded p-2 text-sm"
          rows={3}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
        />
        <button
          onClick={handleSubmit}
          disabled={
            submitting || !newComment.trim() || (isGuest && !guestName.trim())
          }
          className="bg-indigo-600 text-white mt-2 px-4 py-1.5 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          Submit
        </button>
      </div>

      <div className="space-y-3">
        {idea.comments?.map((c) => (
          <div key={c.id} className="border-t pt-2 text-sm text-gray-700">
            <div className="flex justify-between items-center">
              <p className="font-medium text-gray-800">
                {c.user
                  ? `${c.user.firstname} ${c.user.lastname}`
                  : c.guestName ?? "Guest"}
              </p>
              <span className="text-gray-400 text-xs">
                {new Date(c.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="mt-1">{c.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

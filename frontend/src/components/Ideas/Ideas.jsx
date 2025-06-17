import React, { useState } from "react";
import IdeaCard from "./_IdeaCard";

const fakeIdeas = [
  {
    id: 1,
    title: "Add dark mode support",
    description: "Many users prefer dark mode for better readability at night.",
    status: "Planned",
    upvotes: 34,
    downvotes: 2,
  },
  {
    id: 2,
    title: "Integrate Slack notifications",
    description: "Get real-time alerts in Slack when feedback is updated.",
    status: "Under Review",
    upvotes: 21,
    downvotes: 1,
  },
  {
    id: 3,
    title: "Public voting system",
    description: "Let users upvote the ideas they care about most.",
    status: "Released",
    upvotes: 55,
    downvotes: 0,
  },
  {
    id: 4,
    title: "Add mobile push notifications",
    description: "Notify users about updates directly on their phones.",
    status: "Planned",
    upvotes: 14,
    downvotes: 3,
  },
];

const statuses = ["All", "Planned", "Under Review", "Released"];

export default function Ideas({ product }) {
  const [filter, setFilter] = useState("All");

  const filtered =
    filter === "All" ? fakeIdeas : fakeIdeas.filter((i) => i.status === filter);

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <section className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Help Shape the Future of {product.name}
          </h1>
          <p className="text-gray-500 mb-6">
            Share your ideas, 👍 or 👎 ideas, and tell us what matters most.
          </p>
          <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 shadow">
            + Submit Your Idea
          </button>
        </section>

        <div className="sticky top-0 bg-white z-10 p-3 rounded-lg shadow-sm flex gap-2 mb-6">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full border text-sm ${
                filter === s
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-indigo-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.length > 0 ? (
            filtered.map((idea) => <IdeaCard key={idea.id} idea={idea} />)
          ) : (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg mb-4">No ideas in this category yet.</p>
              <button className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">
                Be the first to submit!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import IdeaCard from "./_IdeaCard";
import IdeaForm from "./_IdeaForm";
import { useVote } from "@/hooks/useVote";
import { useApi } from "@/hooks/useApi";

const statuses = ["All", "New", "Done", "Retired"];

export default function Ideas() {
  const { guid } = useParams();
  const api = useApi();
  const [product, setProduct] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);

  const vote = useVote();

  useEffect(() => {
    async function fetchData() {
      try {
        const productRes = await api.get(`/api/products/guid/${guid}`);
        setProduct(productRes.data);

        const ideasRes = await api.get(`/api/ideas/${productRes.data.id}`);
        setIdeas(ideasRes.data);
      } catch (err) {
        console.error("Failed to load ideas page:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [guid]);

  const handleVote = async (ideaId, type) => {
    const updatedIdea = await vote(ideaId, type);
    if (!updatedIdea) return;
    setIdeas((prev) =>
      prev.map((idea) => (idea.id === ideaId ? updatedIdea : idea))
    );
  };

  const handleSubmit = async ({ title, description }) => {
    if (!product) return;
    setSubmitting(true);

    try {
      const res = await api.post(`/api/ideas/${product.id}`, {
        title,
        description,
      });
      setIdeas((prev) => [res.data, ...prev]);
      setShowForm(false);
    } catch (err) {
      console.error("Error submitting idea:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered =
    filter === "All" ? ideas : ideas.filter((i) => i.status === filter);

  if (loading) {
    return <p className="text-center py-20">Loading ideas...</p>;
  }

  if (!product) {
    return (
      <div className="text-center py-20 text-red-500">
        Product not found or unavailable.
      </div>
    );
  }

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
          {!showForm && (
            <button
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 shadow"
              onClick={() => setShowForm(true)}
            >
              + Submit Your Idea
            </button>
          )}
        </section>

        {showForm && (
          <div className="mb-12">
            <IdeaForm
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
              submitting={submitting}
            />
          </div>
        )}

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
            filtered.map((idea, index) => (
              <IdeaCard
                key={idea?.id ?? `fallback-${index}`}
                idea={idea}
                onVote={handleVote}
                guid={guid}
                onClick={() => setSelectedIdea(idea)}
              />
            ))
          ) : ideas.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg mb-4">No ideas have been submitted yet.</p>
              <button
                className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
                onClick={() => setShowForm(true)}
              >
                Be the first to submit!
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

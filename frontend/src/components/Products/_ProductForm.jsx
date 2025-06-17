import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function _ProductForm({ initialData = null, onSubmit }) {
  const navigate = useNavigate();
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setError("");
    await onSubmit({ name, description });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto bg-white p-6 rounded shadow space-y-6"
    >
      <h1 className="text-2xl font-bold">
        {initialData ? "Edit Product" : "Add Product"}
      </h1>

      {error && (
        <div className="text-red-600 bg-red-100 p-2 rounded">{error}</div>
      )}

      <div>
        <label className="block font-medium mb-1">Name</label>
        <input
          type="text"
          className="w-full border px-3 py-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Product name"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Description</label>
        <textarea
          className="w-full border px-3 py-2 rounded"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
        />
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {initialData ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}

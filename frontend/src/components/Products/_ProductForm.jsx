import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "@/hooks/useApi";

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const isEdit = !!id;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await api.get(`/api/products/${id}`);
        const data = res.data;
        setName(data.name || "");
        setDescription(data.description || "");
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch product", err);
        navigate("/dashboard");
      }
    }

    if (isEdit) loadProduct();
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    if (!trimmedName || !trimmedDescription) {
      setError("Both name and description are required.");
      return;
    }

    setError("");

    try {
      if (isEdit) {
        await api.put(`/api/products/${id}`, {
          name: trimmedName,
          description: trimmedDescription,
        });
      } else {
        await api.post("/api/products", {
          name: trimmedName,
          description: trimmedDescription,
        });
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to save product:", err);
      setError("Something went wrong saving the product.");
    }
  };

  if (loading) return <p className="text-center mt-8">Loading...</p>;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto bg-white p-6 rounded shadow space-y-6"
    >
      <h1 className="text-2xl font-bold">
        {isEdit ? "Edit Product" : "Add Product"}
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
          placeholder="Product description"
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
          {isEdit ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}

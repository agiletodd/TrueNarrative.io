// frontend/components/Products/ProductFormPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const API_URL = import.meta.env.VITE_API_URL;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      const token = localStorage.getItem("token");
      fetch(`${API_URL}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setName(data.name || "");
          setDescription(data.description || "");
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch product", err);
          navigate("/dashboard");
        });
    }
  }, [id, isEdit, navigate, API_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    if (!trimmedName || !trimmedDescription) {
      setError("Both name and description are required.");
      return;
    }

    setError("");
    const token = localStorage.getItem("token");
    const url = isEdit
      ? `${API_URL}/api/products/${id}`
      : `${API_URL}/api/products`;
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: trimmedName,
        description: trimmedDescription,
      }),
    });

    if (res.ok) {
      navigate("/dashboard");
    } else {
      console.error("Failed to save product");
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

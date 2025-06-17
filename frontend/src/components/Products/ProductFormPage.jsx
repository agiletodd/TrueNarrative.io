// frontend/components/Products/ProductFormPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import _ProductForm from "./_ProductForm";

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    if (isEdit) {
      const token = localStorage.getItem("token");
      fetch(`http://localhost:4000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setInitialData(data))
        .catch((err) => {
          console.error("Failed to fetch product", err);
          navigate("/dashboard");
        });
    }
  }, [id, isEdit, navigate]);

  const handleSubmit = async (form) => {
    const token = localStorage.getItem("token");
    const url = isEdit
      ? `http://localhost:4000/api/products/${id}`
      : `http://localhost:4000/api/products`;

    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      navigate("/dashboard");
    } else {
      console.error("Failed to save product");
    }
  };

  // Only wait for initialData if in edit mode
  if (isEdit && !initialData)
    return <p className="text-center mt-8">Loading...</p>;

  return <_ProductForm initialData={initialData} onSubmit={handleSubmit} />;
}

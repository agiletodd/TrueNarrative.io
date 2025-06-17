import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    async function fetchProducts() {
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("No token found in localStorage.");
        return;
      }

      const res = await fetch(`${API_URL}/api/products/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("API error:", res.status, await res.text());
        setProducts([]); // Avoid crash on products.map
        return;
      }

      const data = await res.json();
      setProducts(data);
    }

    fetchProducts();
  }, [isAuthenticated, navigate]);

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Products</h1>
        <button
          onClick={() => navigate("/products/new")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          + Add Product
        </button>
      </div>

      {!Array.isArray(products) || products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <ul className="space-y-4">
          {products.map((product) => (
            <li key={product.id} className="border rounded p-4">
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p className="text-gray-600">{product.description}</p>
              <p className="text-sm text-gray-500">
                {product.feedbacks.length} feedback entries
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

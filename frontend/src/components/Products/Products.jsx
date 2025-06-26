import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Plus, Eye, Copy, Check } from "lucide-react";
import ConfirmModal from "@/components/Common/ConfirmModal";
import { useApi } from "@/hooks/useApi";

export default function Dashboard() {
  const api = useApi();
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetchProducts();
  }, [isAuthenticated]);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/api/products/mine");
      setProducts(res.data);
    } catch (err) {
      console.error("API error:", err.response?.status, err.message);
      setProducts([]);
    }
  };

  const handleCopyLink = async (guid, id) => {
    const url = `${window.location.origin}/products/${guid}/ideas`;
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const confirmDelete = (id) => {
    setSelectedProductId(id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/api/products/${selectedProductId}`);
      setProducts((prev) => prev.filter((p) => p.id !== selectedProductId));
    } catch (err) {
      console.error("Failed to delete product:", err);
    } finally {
      setIsModalOpen(false);
      setSelectedProductId(null);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-primary tracking-tight">
          ✨ Your Products
        </h1>
        <button
          onClick={() => navigate("/products/new")}
          className="bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2 rounded-xl flex items-center gap-2 shadow-soft transition"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {!Array.isArray(products) || products.length === 0 ? (
        <div className="text-center text-gray-400 mt-20 space-y-3">
          <p className="text-xl">No products yet... 😢</p>
          <p>Start by adding something you're working on!</p>
        </div>
      ) : (
        <ul className="space-y-6">
          {products.map((product) => (
            <li
              key={product.id}
              className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-pop transition-shadow"
            >
              <div className="space-y-2 pb-10">
                <h2 className="text-xl font-semibold text-primary">
                  {product.name}
                </h2>
                <p className="text-gray-700">{product.description}</p>
                <p className="text-sm text-gray-400">
                  {product.ideas.length} ideas submitted
                </p>
              </div>

              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={() => navigate(`/products/${product.id}`)}
                  className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition"
                  aria-label="Edit product"
                  title="Edit"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => confirmDelete(product.id)}
                  className="p-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-full transition"
                  aria-label="Delete product"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
                <button
                  onClick={() => navigate(`/products/${product.guid}/ideas`)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition"
                  aria-label="View public feedback"
                  title="View"
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={() => handleCopyLink(product.guid, product.id)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition"
                  aria-label="Copy public link"
                  title="Copy Public URL"
                >
                  {copiedId === product.id ? (
                    <Check size={18} />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmModal
        isOpen={isModalOpen}
        title="Delete this product?"
        description="This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
}

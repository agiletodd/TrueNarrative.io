import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function RegisterForm() {
  const { register, isAuthenticated, user, error } = useAuth();
  const [localError, setLocalError] = useState(null);

  const [form, setForm] = useState({
    email: "",
    password: "",
    firstname: "",
    lastname: "",
    avatarUrl: "",
    bio: "",
    website: "", // Honeypot field
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setLocalError(null); // Clear local error on input change
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.website) {
      return; // Honeypot trap
    }
    try {
      await register(form);
    } catch (err) {
      console.error("Registration failed:", err.message);
      setLocalError(err.message || "Registration failed.");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 bg-white shadow-md rounded p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Create Account</h2>

      {isAuthenticated && (
        <p className="text-green-600 text-sm mb-4 text-center">
          Registered as {user?.email}
        </p>
      )}

      {(error || localError) && (
        <p className="text-red-600 text-sm mb-4 text-center">
          {error || localError}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="website"
          value={form.website}
          onChange={handleChange}
          autoComplete="off"
          tabIndex="-1"
          style={{ display: "none" }}
        />

        <input
          name="firstname"
          placeholder="First Name"
          value={form.firstname}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
        />
        <input
          name="lastname"
          placeholder="Last Name"
          value={form.lastname}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
          required
        />
        <input
          name="avatarUrl"
          placeholder="Avatar URL (optional)"
          value={form.avatarUrl}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
        />
        <textarea
          name="bio"
          placeholder="Bio"
          value={form.bio}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
          rows="3"
        />
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded"
        >
          Register
        </button>
      </form>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const { login, isAuthenticated, user, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    await login(email, password);
  }

  return (
    <div className="max-w-md mx-auto mt-16 bg-white shadow-md rounded p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Sign In</h2>

      {isAuthenticated && (
        <p className="text-green-600 text-sm mb-4 text-center">
          Logged in as {user?.email}
        </p>
      )}
      {error && (
        <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          className="w-full px-4 py-2 border rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full px-4 py-2 border rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded"
        >
          Sign In
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-indigo-600 hover:underline font-medium"
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
}

import React from "react";
import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-700">
          TrueNarrative.io
        </Link>
        <div className="flex gap-4 items-center">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-700">
                Hello, {user?.firstname || user?.email}
              </span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-800 transition"
              title="Login or Register"
            >
              <User className="w-6 h-6" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

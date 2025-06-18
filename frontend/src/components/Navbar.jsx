import React from "react";
import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-bold text-primary tracking-tight hover:text-primary-dark transition"
        >
          TrueNarrative<span className="text-accent">.io</span>
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <>
              <Link
                to="/dashboard"
                className="text-sm text-primary font-medium hover:underline transition"
              >
                Dashboard
              </Link>
              <span className="text-sm text-gray-600 hidden sm:inline">
                Hello, {user?.firstname || user?.email}
              </span>
              <button
                onClick={logout}
                className="text-sm text-red-500 hover:text-red-700 transition"
              >
                Logout
              </button>
            </>
          )}

          {!isAuthenticated && (
            <Link
              to="/login"
              className="flex items-center gap-1 text-sm text-primary hover:text-primary-dark transition"
              title="Login or Register"
            >
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

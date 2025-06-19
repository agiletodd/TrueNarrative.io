import React, { useState } from "react";
import { Link } from "react-router-dom";
import { User, Menu, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-bold text-primary tracking-tight hover:text-primary-dark transition"
        >
          TrueNarrative<span className="text-accent">.io</span>
        </Link>

        <div className="flex items-center gap-4 relative">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="text-sm text-primary font-medium hover:underline transition"
              >
                My Products
              </Link>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">
                    Hello, {user?.firstname || user?.email}
                  </span>
                  <Menu className="w-4 h-4 sm:hidden" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <button
                      onClick={logout}
                      className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 hover:text-red-700 transition"
                    >
                      <LogOut className="inline-block w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
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

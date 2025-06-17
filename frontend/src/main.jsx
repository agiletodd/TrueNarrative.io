// frontend/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import LoginForm from "@/components/Auth/LoginForm";
import RegisterForm from "@/components/Auth/RegisterForm";
import ProductDashboard from "@/components/Products/Dashboard";
import RequireAuth from "@/components/Auth/RequireAuth";
import { AuthProvider } from "@/context/AuthContext";
import ProductFormPage from "@/components/Products/ProductFormPage";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<App />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <ProductDashboard />
                  </RequireAuth>
                }
              />
              <Route
                path="/products/new"
                element={
                  <RequireAuth>
                    <ProductFormPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/products/:id"
                element={
                  <RequireAuth>
                    <ProductFormPage />
                  </RequireAuth>
                }
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);

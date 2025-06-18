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
import Products from "@/components/Products/Products";
import RequireAuth from "@/components/Auth/RequireAuth";
import { AuthProvider } from "@/context/AuthContext";
import ProductForm from "@/components/Products/_ProductForm";
import Ideas from "@/components/Ideas/Ideas";

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
                    <Products />
                  </RequireAuth>
                }
              />
              <Route
                path="/products/new"
                element={
                  <RequireAuth>
                    <ProductForm />
                  </RequireAuth>
                }
              />
              <Route
                path="/products/:id"
                element={
                  <RequireAuth>
                    <ProductForm />
                  </RequireAuth>
                }
              />

              <Route path="/products/:guid/ideas" element={<Ideas />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);

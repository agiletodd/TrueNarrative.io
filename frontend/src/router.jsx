import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import LoginForm from "@/components/Auth/LoginForm";
import RegisterForm from "@/components/Auth/RegisterForm";
import Products from "@/components/Products/Products";
import ProductForm from "@/components/Products/_ProductForm";
import Ideas from "@/components/Ideas/Ideas";
import IdeaDetail from "@/components/Ideas/_IdeaDetail";
import RequireAuth from "@/components/Auth/RequireAuth";

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: "/", element: <Home /> },
          { path: "/login", element: <LoginForm /> },
          { path: "/register", element: <RegisterForm /> },
          {
            path: "/dashboard",
            element: (
              <RequireAuth>
                <Products />
              </RequireAuth>
            ),
          },
          {
            path: "/products/new",
            element: (
              <RequireAuth>
                <ProductForm />
              </RequireAuth>
            ),
          },
          {
            path: "/products/:id",
            element: (
              <RequireAuth>
                <ProductForm />
              </RequireAuth>
            ),
          },
          {
            path: "/products/:guid/ideas",
            element: <Ideas />,
          },
          {
            path: "/products/:guid/ideas/:ideaId",
            element: <IdeaDetail />,
          },
        ],
      },
    ],
  },
]);

export default router;

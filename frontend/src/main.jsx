import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import router from "./router";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            marginTop: "50vh",
            zIndex: 9999,
          },
        }}
      />
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);

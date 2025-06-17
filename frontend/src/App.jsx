// frontend/src/App.jsx
import React from "react";
import { Outlet } from "react-router-dom";

/**
 * App is the root-level shell for the application.
 * Use this for global state, providers, or layout wrappers if needed.
 */
export default function App() {
  return (
    <>
      {/* Global context providers can go here in the future */}
      <Outlet />
    </>
  );
}

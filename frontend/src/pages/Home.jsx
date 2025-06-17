import React from "react";
import Navbar from "../components/Navbar";
import Ideas from "../components/Ideas/Ideas";

export default function App() {
  const currentProduct = {
    id: 1,
    name: "TrueNarrative.io",
  };

  return (
    <>
      <main className="max-w-3xl mx-auto px-6 py-10">
        <Ideas product={currentProduct} />
      </main>
    </>
  );
}

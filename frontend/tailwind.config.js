import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", ...fontFamily.sans], // or 'Inter'
      },
      colors: {
        primary: {
          DEFAULT: "#2563eb", // blue-600
          light: "#3b82f6", // blue-500
          dark: "#1e40af", // blue-800
        },
        accent: {
          DEFAULT: "#f97316", // orange-500 (warm coral)
          light: "#fb923c",
          dark: "#ea580c",
        },
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
      },
      borderRadius: {
        lg: "1rem", // cards & containers
        xl: "1.5rem", // extra bubbly
        "2xl": "2rem", // callouts/modals
      },
      boxShadow: {
        soft: "0 4px 14px rgba(0, 0, 0, 0.08)",
        pop: "0 8px 30px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
};

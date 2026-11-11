/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#C8102E",
          action: "#E11D48",
          burgundy: "#8B1028",
          soft: "#FFF1F2",
          blush: "#FCE8EC",
        },
        surface: {
          white: "#FFFFFF",
          off: "#FAFAFA",
          light: "#F5F5F5",
          border: "#E5E7EB",
        },
        ink: {
          primary: "#171717",
          secondary: "#737373",
        },
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 4px 20px rgba(23, 23, 23, 0.06)",
        card: "0 8px 30px rgba(23, 23, 23, 0.08)",
        brand: "0 10px 25px rgba(200, 16, 46, 0.18)",
      },
    },
  },
  plugins: [],
};

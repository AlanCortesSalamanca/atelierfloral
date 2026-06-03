import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "#fbf6ee",
        beige: "#ead9c5",
        blush: "#d9aaa8",
        sage: "#9aaa8b",
        gold: "#c7a56a",
        coffee: "#8b6b55",
        ink: "#4b3d35",
      },
      boxShadow: {
        soft: "0 18px 50px rgba(75, 61, 53, 0.12)",
        card: "0 14px 38px rgba(139, 107, 85, 0.14)",
      },
      fontFamily: {
        heading: ["Georgia", "Cambria", "Times New Roman", "serif"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

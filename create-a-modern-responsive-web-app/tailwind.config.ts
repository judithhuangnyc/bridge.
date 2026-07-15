import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: { ink: "#183A5A", sky: "#EAF5FF", mist: "#F7FBFF" },
      boxShadow: { soft: "0 10px 30px rgba(34, 98, 145, 0.09)" },
    },
  },
  plugins: [],
};
export default config;

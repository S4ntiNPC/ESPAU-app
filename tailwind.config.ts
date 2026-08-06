import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        espau: {
          blue: "#7189FF",
          pink: "#DE589E",
          navy: "#2D325A",
          bgStart: "#F0F4FF", // Azul muy claro para gradientes
          bgEnd: "#FFF0F8",   // Rosa muy claro para gradientes
        }
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(113, 137, 255, 0.08)', // Sombra pastel muy sutil
      }
    },
  },
  plugins: [],
};

export default config;
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand color palette
        brand: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
        // Accent color for highlights and CTA elements
        accent: {
          50: "#eef2ff",
          100: "#e0e7ff", 
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
      },
      fontFamily: {
        sans: [
          "system-ui", 
          "-apple-system", 
          "BlinkMacSystemFont", 
          "Segoe UI", 
          "Roboto", 
          "Helvetica Neue", 
          "Arial", 
          "sans-serif"
        ],
        heading: [
          "system-ui", 
          "-apple-system", 
          "BlinkMacSystemFont", 
          "Segoe UI", 
          "Roboto", 
          "Helvetica Neue", 
          "Arial", 
          "sans-serif"
        ],
      },
      boxShadow: {
        glass: "0 4px 30px rgba(0, 0, 0, 0.1)",
        card: "0 7px 20px rgba(0, 0, 0, 0.05)",
        "card-hover": "0 10px 40px rgba(0, 0, 0, 0.1)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "card-shine": "linear-gradient(45deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 30%, rgba(255,255,255,0) 100%)",
        "hero-gradient": "linear-gradient(to right bottom, rgba(107, 33, 168, 0.8), rgba(76, 29, 149, 0.8), rgba(30, 58, 138, 0.8))",
      },
      animation: {
        "card-shine": "shine 1.5s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in": "slide-in 0.5s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
      },
      keyframes: {
        "shine": {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        "slide-in": {
          "0%": { transform: "translateY(10px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        "slide-down": {
          "0%": { transform: "translateY(-10px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
      },
      // For responsive spacing and scaling
      spacing: {
        "72": "18rem",
        "80": "20rem",
        "96": "24rem",
        "128": "32rem",
      },
      zIndex: {
        "60": 60,
        "70": 70,
        "80": 80,
        "90": 90,
        "100": 100,
      },
    },
    screens: {
      "xs": "375px",
      "sm": "640px",
      "md": "768px",
      "lg": "1024px",
      "xl": "1280px",
      "2xl": "1536px",
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
  ],
}
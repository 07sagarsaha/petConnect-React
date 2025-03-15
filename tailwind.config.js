/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        Uni: "0 0 15px 5px rgba(128, 128, 128, 0.485)",
        UniCol: "0 4px 15px 0 pink, 0 0 25px 0 purple",
        skew: "5px 5px 15px 5px rgba(128, 128, 128, 0.485), -5px 5px 15px 0 rgb(255, 255, 255)",
      },
      keyframes: {
        postAnim: {
          "0%": { transform: "scale(0%)", opacity: "0" },
          "100%": { transform: "scale(100%)", opacity: "1" },
        },
        postAnim2: {
          "0%": { transform: "translateX(-1000%)", opacity: "0" },
          "100%": { transform: "translateX(0%)", opacity: "1" },
        },
        postAnim3: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0%)", opacity: "1" },
        },
        fadeOut: {
          "100%": { opacity: "0" },
        },
      },
      animation: {
        postButtonAnim1: "postAnim 1s ease",
        postButtonAnim2: "postAnim2 1s ease",
        postAnim3: "postAnim3 0.75s ease-in-out",
        postAnim1: "postAnim4 0.5s ease",
        fadeOut: "fadeOut 0.5s ease-in-out",
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      "light",
      "dark",
      "cupcake",
      "bumblebee",
      "emerald",
      "corporate",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "black",
      "luxury",
      "dracula",
      "cmyk",
      "autumn",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter",
      "dim",
      "nord",
      "sunset",
    ],
  },
};

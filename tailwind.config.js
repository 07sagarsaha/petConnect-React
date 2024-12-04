/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow:{
        'Uni':'0 0 15px 5px rgba(128, 128, 128, 0.485)',
        'UniCol':'0 4px 15px 0 pink, 0 0 25px 0 purple',
      },
      keyframes:{
        postAnim:{
          '0%':{transform: 'scale(0%)', opacity: '0'},
          '100%':{transform: 'scale(100%)', opacity: '1'}
        },
        postAnim2:{
          '0%':{transform: 'translateX(-1000%)', opacity: '0'},
          '100%':{transform: 'translateX(0%)', opacity: '1'}
        },
      },
      animation:{
        'postButtonAnim1':'postAnim 1s ease',
        'postButtonAnim2':'postAnim2 1s ease',
      },
    },
  },
  plugins: [],
};

  /** @type {import('tailwindcss').Config} **/
  module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
      // Tailwind's default breakpoints plus the project's named aliases.
      // Listed in ascending order: media queries are emitted in this order,
      // so a wider breakpoint must come later to override a narrower one.
      screens: {
        mobile: "400px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        laptop: "1024px",
        xl: "1280px",
        desktop: "1280px",
        "2xl": "1536px",
      },
      extend: {},
    },
    plugins: [],
  };

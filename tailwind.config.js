/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#f25f00",
        chrome: {
          text: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          disabled: "var(--text-disabled)",
          icon: "var(--icon-color)",
          hover: "var(--hover-bg)",
          soft: "var(--primary-soft)",
          "soft-hover": "var(--primary-soft-hover)",
          divider: "var(--divider)",
          panel: "var(--panel-bg)",
          "panel-solid": "var(--panel-bg-solid)",
          border: "var(--panel-border)",
          input: "var(--input-bg)",
          thumb: "var(--thumb-bg)",
          guide: "var(--guide-bg)",
        },
      },
    },
  },
  plugins: [],
};

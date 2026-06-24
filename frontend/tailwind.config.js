export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}", "./services/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        industrial: {
          bg: "#050816",
          primary: "#3B82F6",
          secondary: "#06B6D4",
          accent: "#8B5CF6",
          text: "#FFFFFF",
          muted: "#94A3B8"
        }
      }
    }
  },
  plugins: []
};

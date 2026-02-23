import type { Config } from "tailwindcss";

const withOpacity = (variableName: string) => `rgb(var(${variableName}) / <alpha-value>)`;

const config: Config = {

  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: withOpacity("--ink"),
        slate: withOpacity("--slate"),
        cloud: withOpacity("--cloud"),
        haze: withOpacity("--haze"),
        ocean: withOpacity("--ocean"),
        teal: withOpacity("--teal"),
        sand: withOpacity("--sand"),
        sun: withOpacity("--sun"),
        pine: withOpacity("--pine"),
        surface: withOpacity("--surface"),
        "surface-elevated": withOpacity("--surface-elevated"),
        "on-surface": withOpacity("--on-surface"),
        "on-surface-muted": withOpacity("--on-surface-muted"),
        outline: withOpacity("--outline"),
        primary: withOpacity("--primary"),
        "primary-container": withOpacity("--primary-container"),
        accent: withOpacity("--accent"),
        warm: withOpacity("--warm"),
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        card: "0 16px 28px rgba(15, 23, 42, 0.08)",
        1: "var(--shadow-1)",
        2: "var(--shadow-2)",
        3: "var(--shadow-3)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at 20% 20%, rgba(19, 91, 102, 0.18), transparent 50%), radial-gradient(circle at 80% 20%, rgba(45, 156, 151, 0.18), transparent 45%)",
        atlas:
          "radial-gradient(circle at 15% 20%, rgba(45, 156, 151, 0.18), transparent 50%), radial-gradient(circle at 85% 10%, rgba(242, 183, 122, 0.25), transparent 45%), linear-gradient(120deg, rgba(19, 91, 102, 0.08), transparent 55%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "skeleton-pulse": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease-out forwards",
        "fade-up-delay": "fade-up 0.7s ease-out 0.15s forwards",
        "fade-up-late": "fade-up 0.7s ease-out 0.3s forwards",
        "fade-in": "fade-in 0.2s var(--easing-standard) forwards",
        "slide-in-right": "slide-in-right 0.25s var(--easing-standard) forwards",
        "slide-in-left": "slide-in-left 0.3s var(--easing-standard) forwards",
        "float-slow": "float-slow 10s ease-in-out infinite",
        "pulse-soft": "pulse-soft 6s ease-in-out infinite",
        skeleton: "skeleton-pulse 1.5s ease-in-out infinite",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        normal: "var(--duration-normal)",
        slow: "var(--duration-slow)",
      },
      transitionTimingFunction: {
        standard: "var(--easing-standard)",
      },
    },
  },
  plugins: [],
};

export default config;

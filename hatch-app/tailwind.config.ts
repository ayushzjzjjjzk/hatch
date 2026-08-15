import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#050505",
        surface: "#0D0D0F",
        "surface-2": "#121216",
        border: "rgba(255,255,255,0.08)",
        "border-strong": "rgba(255,255,255,0.14)",
        text: "#F5F5F7",
        "text-dim": "#9CA3AF",
        "text-faint": "#6B7280",
        violet: {
          DEFAULT: "#8B5CF6",
          light: "#A78BFA",
          dark: "#6D28D9"
        }
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"]
      },
      backgroundImage: {
        "violet-gradient": "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)",
        "violet-glow": "radial-gradient(60% 50% at 50% 0%, rgba(139,92,246,0.25) 0%, transparent 70%)"
      },
      height: {
        dvh: "100dvh"
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "fade-up": "fade-up 0.5s ease forwards"
      }
    }
  },
  plugins: []
};

export default config;

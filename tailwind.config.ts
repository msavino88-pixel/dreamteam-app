import type { Config } from 'tailwindcss'

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        // Soft UI accents
        lime: "var(--accent-lime)",
        "accent-yellow": "var(--accent-yellow)",
        "accent-purple": "var(--accent-purple)",
        "accent-success": "var(--accent-success)",
        // Colori sezioni dreamteam
        dt: {
          management: "var(--dt-management)",
          marketing: "var(--dt-marketing)",
          finance: "var(--dt-finance)",
          branding: "var(--dt-branding)",
          hr: "var(--dt-hr)",
          ai: "var(--dt-ai)",
        },
      },
      borderRadius: {
        sm: "8px",
        md: "var(--radius)",
        lg: "calc(var(--radius) + 4px)",
        xl: "calc(var(--radius) + 8px)",
        "2xl": "28px",
        "3xl": "32px",
        pill: "9999px",
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        "label": ["13px", { fontWeight: "500", letterSpacing: "0.03em" }],
      },
      boxShadow: {
        "soft": "var(--shadow-soft)",
        "float": "var(--shadow-float)",
        "glow": "var(--shadow-glow)",
      },
      spacing: {
        "card-p": "24px",
        "section": "40px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

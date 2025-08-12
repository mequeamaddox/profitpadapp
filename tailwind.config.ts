import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        slate: {
          50: "hsl(214 31% 97%)",
          100: "hsl(214 27% 92%)",
          200: "hsl(213 27% 84%)",
          300: "hsl(214 20% 69%)",
          400: "hsl(214 14% 56%)",
          500: "hsl(214 9% 45%)",
          600: "hsl(214 9% 35%)",
          700: "hsl(214 12% 27%)",
          800: "hsl(214 20% 19%)",
          900: "hsl(210 25% 7.8431%)",
        },
        blue: {
          50: "hsl(214 95% 93%)",
          100: "hsl(214 95% 87%)",
          200: "hsl(213 97% 87%)",
          300: "hsl(212 96% 78%)",
          400: "hsl(213 94% 68%)",
          500: "hsl(213 88% 59%)",
          600: "hsl(213 88% 51%)",
          700: "hsl(212 100% 47%)",
          800: "hsl(214 100% 36%)",
          900: "hsl(214 100% 27%)",
        },
        emerald: {
          50: "hsl(152 81% 96%)",
          100: "hsl(152 58% 92%)",
          200: "hsl(153 57% 84%)",
          300: "hsl(154 50% 71%)",
          400: "hsl(155 46% 54%)",
          500: "hsl(158 64% 40%)",
          600: "hsl(152 76% 29%)",
          700: "hsl(157 86% 23%)",
          800: "hsl(152 69% 19%)",
          900: "hsl(153 62% 16%)",
        },
        amber: {
          50: "hsl(48 100% 96%)",
          100: "hsl(48 96% 89%)",
          200: "hsl(48 97% 77%)",
          300: "hsl(46 87% 65%)",
          400: "hsl(43 89% 56%)",
          500: "hsl(37 91% 55%)",
          600: "hsl(32 95% 44%)",
          700: "hsl(26 90% 37%)",
          800: "hsl(23 83% 31%)",
          900: "hsl(22 78% 26%)",
        },
        purple: {
          50: "hsl(256 100% 96%)",
          100: "hsl(251 91% 95%)",
          200: "hsl(251 95% 92%)",
          300: "hsl(252 95% 85%)",
          400: "hsl(255 92% 76%)",
          500: "hsl(258 90% 66%)",
          600: "hsl(256 87% 60%)",
          700: "hsl(262 83% 58%)",
          800: "hsl(263 70% 50%)",
          900: "hsl(264 67% 42%)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;

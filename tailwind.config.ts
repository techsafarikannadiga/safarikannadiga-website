import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Safari-themed color palette
        safari: {
          gold: '#D4A574',
          'gold-light': '#E8C9A0',
          'gold-dark': '#B8895E',
        },
        forest: {
          green: '#2D5016',
          'green-light': '#3D6B1F',
          'green-dark': '#1F3810',
        },
        sunset: {
          orange: '#E67E22',
          'orange-light': '#F39C4D',
          'orange-dark': '#C86A1A',
        },
        wildlife: {
          brown: '#8B4513',
          'brown-light': '#A0522D',
          'brown-dark': '#6B3410',
        },
        neutral: {
          charcoal: '#2C3E50',
          gray: '#7F8C8D',
          cream: '#F8F6F3',
          white: '#FFFFFF',
        },
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'hero': ['4rem', { lineHeight: '1.1', fontWeight: '700' }],
        'display': ['3rem', { lineHeight: '1.2', fontWeight: '700' }],
        'h1': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['2rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        'h4': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
      },
      spacing: {
        'section': '5rem',
        'section-sm': '3rem',
      },
      borderRadius: {
        'card': '0.75rem',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'hero-fade-in': 'heroFadeIn 1s ease-in-out forwards',
        'hero-fade-out': 'heroFadeOut 1s ease-in-out forwards',
        'whatsapp-pop': 'whatsappPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 1s both',
        // Preloader animations
        'sun-rise': 'sunRise 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both',
        'icon-reveal': 'iconReveal 0.6s ease-out 0.8s both',
        'text-reveal': 'textReveal 0.8s ease-out 1s both',
        'load-bar': 'loadBar 1.8s ease-in-out 0.4s both',
        'paw-step': 'pawStep 1.5s ease-in-out infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'pulse-ring': 'pulseRing 2s ease-in-out infinite',
        'horizon': 'horizon 1.5s ease-out 0.3s both',
        'draw-path': 'drawPath 1s ease-out 0.8s both',
        'draw-path-delay': 'drawPath 0.8s ease-out 1.2s both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        heroFadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        heroFadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        whatsappPop: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        // Preloader keyframes
        sunRise: {
          '0%': { transform: 'scale(0.3) translateY(30px)', opacity: '0' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        iconReveal: {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        textReveal: {
          '0%': { opacity: '0', transform: 'translateY(15px)', letterSpacing: '0.5em' },
          '100%': { opacity: '1', transform: 'translateY(0)', letterSpacing: '0.05em' },
        },
        loadBar: {
          '0%': { width: '0%' },
          '60%': { width: '70%' },
          '100%': { width: '100%' },
        },
        pawStep: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0' },
          '50%': { opacity: '0.8' },
        },
        pulseRing: {
          '0%': { transform: 'scale(1)', opacity: '0.3' },
          '50%': { transform: 'scale(1.3)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '0.3' },
        },
        horizon: {
          '0%': { opacity: '0', transform: 'scaleX(0)' },
          '100%': { opacity: '1', transform: 'scaleX(1)' },
        },
        drawPath: {
          '0%': { strokeDasharray: '100', strokeDashoffset: '100', opacity: '0' },
          '100%': { strokeDasharray: '100', strokeDashoffset: '0', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
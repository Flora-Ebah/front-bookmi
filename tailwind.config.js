/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs BookMi
        'bookmi-blue': '#1986da',
        'bookmi-dark': '#2c3c51',
        
        // Couleurs principales
        primary: '#1986da', // Changé pour le bleu BookMi
        secondary: '#2c3c51', // Changé pour le bleu foncé BookMi
        
        // Couleurs d'accentuation
        'primary-light': '#3ba1ee', // Bleu clair BookMi
        'secondary-light': '#3d4f67', // Bleu foncé clair BookMi
        
        // Couleurs neutres
        white: '#FFFFFF',
        'gray-100': '#F5F5F5', // Gris très clair
        'gray-500': '#9E9E9E', // Gris moyen
        'gray-800': '#424242', // Gris foncé
        'gray-900': '#212121', // Presque noir
        
        // Couleurs d'état
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FFC107',
        info: '#2196F3',
      },
      fontFamily: {
        // Police principale Poppins pour tout le site
        'poppins': ['Poppins', 'sans-serif'],
        // Fallback pour la compatibilité
        'sans': ['Poppins', 'sans-serif'],
      },
      fontSize: {
        // Tailles de texte pour les titres
        'h1': ['36px', {
          lineHeight: '44px',
          fontWeight: '700', // Bold
        }],
        'h2': ['30px', {
          lineHeight: '38px',
          fontWeight: '700', // Bold
        }],
        'h3': ['24px', {
          lineHeight: '32px',
          fontWeight: '700', // Bold
        }],
        'h4': ['20px', {
          lineHeight: '28px',
          fontWeight: '700', // Bold
        }],
        'h5': ['18px', {
          lineHeight: '26px',
          fontWeight: '700', // Bold
        }],
        'h6': ['16px', {
          lineHeight: '24px',
          fontWeight: '700', // Bold
        }],
        // Corps de texte
        'body': ['16px', {
          lineHeight: '24px',
          fontWeight: '400', // Regular
        }],
        'body-sm': ['14px', {
          lineHeight: '20px',
          fontWeight: '400', // Regular
        }],
        // Accentuation
        'button': ['16px', {
          fontWeight: '500', // Medium
        }],
        'nav': ['16px', {
          fontWeight: '500', // Medium
        }],
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
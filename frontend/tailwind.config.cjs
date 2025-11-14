module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand colors - matching the new identity
        'kama-vert': '#1A3C40',     // primary
        'kama-gold': '#D4AF37',     // accent premium
        'kama-dore': '#D4AF37',     // accent premium (duplicate for backward compatibility)
        'kama-bg': '#F8F9FA',       // background
        'kama-text': '#1C1C1C',
        'kama-muted': '#606060',
        'kama-turquoise': '#00BFA6', // Soft turquoise - modern accent
        'dark-bg': '#0D1C1E',        // Dark background for night mode
        
        // Legacy colors (keeping for backward compatibility)
        'primary-dark': '#1A3C40',
        'luxury-gold': '#D4AF37',
        'light-bg': '#F8F9FA',
        'primary-text': '#1C1C1C',
        'secondary-text': '#606060',
        'accent-soft': '#00BFA6',
        
        // Gabon-inspired colors
        'gabon-green': '#1A3C40',
        'gabon-gold': '#d4af37',
        'gabon-beige': '#f5f0e1',
        'dark-forest': '#062d1c',
      },
      fontFamily: {
        poppins: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'kama-soft': '0 8px 24px rgba(14,30,37,0.08)',
        'soft': '0 8px 24px rgba(14,30,37,0.08)',
        'kama': '0 8px 24px rgba(14,30,37,0.08)',
        'kama-hover': '0 12px 32px rgba(14,30,37,0.12)',
        'kama-lg': '0 20px 40px rgba(14,30,37,0.15)'
      },
      borderRadius: {
        'lg': '12px',
        'xl': '16px',
        'xl2': '14px'
      },
      transitionTimingFunction: {
        'kama': 'cubic-bezier(0.4, 0, 0.2, 1)'
      },
      transitionDuration: {
        '300': '300ms',
        '500': '500ms'
      }
    },
  },
  plugins: [],
}
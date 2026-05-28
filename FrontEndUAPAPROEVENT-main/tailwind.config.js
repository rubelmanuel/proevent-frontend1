module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        primaryDark: '#1e3a8a',
        background: '#f8fafc',
        border: {
          DEFAULT: '#e2e8f0',
          soft: 'var(--border-soft)',
          medium: 'var(--border-medium)',
        },
        textPrimary: '#0f172a',
        textSecondary: '#64748b',
        bg: {
          main: 'var(--bg-main)',
          subtle: 'var(--bg-subtle)',
          card: 'var(--bg-card)',
          hover: 'var(--bg-hover)',
        },
        accent: {
          primary: 'var(--accent-primary)',
          hover: 'var(--accent-hover)',
          light: 'var(--accent-light)',
          lighter: 'var(--accent-lighter)',
        },
        text: {
          main: 'var(--text-main)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          faint: 'var(--text-faint)',
        },
        success: {
          DEFAULT: 'var(--success)',
          bg: 'var(--success-bg)',
          border: 'var(--success-border)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          bg: 'var(--danger-bg)',
          border: 'var(--danger-border)',
        }
      },
      borderRadius: {
        xl: '1rem',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.05)',
        cardHover: '0 12px 32px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};

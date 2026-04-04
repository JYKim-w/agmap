const theme = {
  colors: {
    background: {
      50: '#ffffff',
      100: '#f8f9fa',
      800: '#1a1d1e',
      900: '#121415',
    },
    glass: 'rgba(255, 255, 255, 0.7)',
    glassDark: 'rgba(0, 0, 0, 0.6)',
    primary: {
      50: '#e7f5ff',
      100: '#d0ebff',
      200: '#a5d8ff',
      300: '#74c0ff',
      400: '#4dabf7',
      500: '#339af0',
      600: '#228be6',
      700: '#1c7ed6',
      800: '#1971c2',
      900: '#1864ab',
    },
    accent: {
      blue: '#228be6',
      cyan: '#15aabf',
      grape: '#be4bdb',
    },
  },
} as const;

export type AppTheme = typeof theme;
export const useAppTheme = () => theme;
export default useAppTheme;

import React, { createContext, useContext, useState, useEffect } from 'react';

// Define types for Themes
interface FontPair {
  id: string;
  name: string;
  heading: string;
  body: string;
  fontSizeScale?: number;
}

interface Palette {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    complementary: string; // Used for accents
    accent: string;
    text: string;
    bg: string;
    headingColor: string; // Specific color for headings
  };
}

interface ThemeContextType {
  currentFontPair: FontPair;
  setFontPair: (font: FontPair) => void;
  currentPalette: Palette;
  setPalette: (palette: Palette) => void;
  fontOptions: FontPair[];
  paletteOptions: Palette[];
}

// 1. Define Font Options
const fontOptions: FontPair[] = [
  {
    id: 'royal',
    name: 'Pinyon & Crimson',
    heading: "'Pinyon Script', cursive",
    body: "'Crimson Text', serif",
  },
];

// 2. Define Palette Options
const paletteOptions: Palette[] = [
  {
    id: 'navy_gold',
    name: 'Royal Navy',
    colors: {
        primary: '#0A2342', // Deep Navy
        secondary: '#EDF2F4', // Platinum/White (Same as BG)
        complementary: '#8D99AE', // Greyish Blue
        accent: '#D90429',       // Reddish accent (optional adjustment, likely not used much) - actually stick to the previous defined navy ones or safe defaults
        text: '#1D3557', // Navy
        bg: '#EDF2F4', // Platinum
        headingColor: '#0A2342',
    },
  },
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentFontPair, setFontPair] = useState<FontPair>(fontOptions[0]);
  const [currentPalette, setPalette] = useState<Palette>(paletteOptions[0]);

  useEffect(() => {
    const root = document.documentElement;

    // Set Font Variables
    root.style.setProperty('--font-heading', currentFontPair.heading);
    root.style.setProperty('--font-body', currentFontPair.body);

    // Set Color Variables
    root.style.setProperty('--color-primary', currentPalette.colors.primary);
    root.style.setProperty('--color-secondary', currentPalette.colors.secondary);
    root.style.setProperty('--color-complementary', currentPalette.colors.complementary);
    root.style.setProperty('--color-accent', currentPalette.colors.accent);
    root.style.setProperty('--color-text', currentPalette.colors.text);
    root.style.setProperty('--color-bg', currentPalette.colors.bg);
    root.style.setProperty('--color-heading', currentPalette.colors.headingColor);

  }, [currentFontPair, currentPalette]);

  return (
    <ThemeContext.Provider value={{
      currentFontPair,
      setFontPair,
      currentPalette,
      setPalette,
      fontOptions,
      paletteOptions
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

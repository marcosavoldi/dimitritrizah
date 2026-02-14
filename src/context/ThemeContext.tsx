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
    id: '1',
    name: 'Cinzel & Cormorant',
    heading: "'Cinzel', serif",
    body: "'Cormorant Garamond', serif",
  },
];

// 2. Define Palette Options
const paletteOptions: Palette[] = [
  {
    id: 'palette-1',
    name: '153243 + c1bdb3',
    colors: {
      primary: '#153243',      // Dark Blue/Grey
      secondary: '#c1bdb3',    // Light Grey/Beige (Background-ish)
      complementary: '#b4b8ab', // Slightly greener grey for nuance
      accent: '#284b63',       // Lighter Blue for accents
      text: '#153243',         // Dark text
      bg: '#c1bdb3',           // The light color as BG
      headingColor: '#153243',
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

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCog, FaTimes, FaFont, FaPalette } from 'react-icons/fa';

interface ThemeOption {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  text: string;
  bg: string;
}

interface FontOption {
  id: string;
  name: string;
  heading: string;
  body: string;
}

const THEMES: ThemeOption[] = [
  { 
    id: 'default', 
    name: 'Classico (Original)', 
    primary: '#153243', 
    secondary: '#C1BDB3', 
    text: '#153243', 
    bg: '#C1BDB3' 
  },
  { 
    id: 'blush', 
    name: 'Blush & Gold', 
    primary: '#B5838D', // Dusty Pink
    secondary: '#FFF0F3', // Light Pink/Cream (Same as BG)
    text: '#6D6875', // Muted Purple/Grey
    bg: '#FFF0F3' 
  },
  { 
    id: 'olive', 
    name: 'Tuscan Olive', 
    primary: '#606C38', // Olive Green
    secondary: '#FEFAE0', // Eggshell (Same as BG)
    text: '#283618', // Dark Green
    bg: '#FEFAE0' 
  },
  { 
    id: 'navy_gold', 
    name: 'Royal Navy', 
    primary: '#0A2342', // Deep Navy
    secondary: '#EDF2F4', // Platinum/White (Same as BG)
    text: '#1D3557', // Navy
    bg: '#EDF2F4' 
  }
];

const FONTS: FontOption[] = [
  { 
    id: 'default', 
    name: 'Cinzel & Cormorant', 
    heading: "'Cinzel', serif", 
    body: "'Cormorant Garamond', serif" 
  },
  { 
    id: 'italian', 
    name: 'Italiana & Lora', 
    heading: "'Italiana', serif", 
    body: "'Lora', serif" 
  },
  { 
    id: 'royal', 
    name: 'Pinyon & Crimson', 
    heading: "'Pinyon Script', cursive", 
    body: "'Crimson Text', serif" 
  },
  { 
    id: 'modern_serif', 
    name: 'Playfair & Alice', 
    heading: "'Playfair Display', serif", 
    body: "'Alice', serif" 
  }
];

const ThemePlayground: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState('default');
  const [activeFont, setActiveFont] = useState('default');

  // Load saved preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem('wedding-theme');
    const savedFont = localStorage.getItem('wedding-font');
    if (savedTheme) applyTheme(savedTheme);
    if (savedFont) applyFont(savedFont);
  }, []);

  const applyTheme = (themeId: string) => {
    const theme = THEMES.find(t => t.id === themeId);
    if (theme) {
      document.documentElement.style.setProperty('--color-primary', theme.primary);
      document.documentElement.style.setProperty('--color-secondary', theme.secondary);
      document.documentElement.style.setProperty('--color-text', theme.text);
      document.documentElement.style.setProperty('--color-bg', theme.bg);
      setActiveTheme(themeId);
      localStorage.setItem('wedding-theme', themeId);
    }
  };

  const applyFont = (fontId: string) => {
    const font = FONTS.find(f => f.id === fontId);
    if (font) {
      document.documentElement.style.setProperty('--font-heading', font.heading);
      document.documentElement.style.setProperty('--font-body', font.body);
      setActiveFont(fontId);
      localStorage.setItem('wedding-font', fontId);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          top: '2rem',
          left: '2rem',
          zIndex: 100,
          background: 'white',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-primary)'
        }}
        title="Theme Settings"
      >
        <FaCog size={24} />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.8)', // Dark overlay
              zIndex: 10001,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '500px',
                position: 'relative',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  color: '#666'
                }}
              >
                <FaTimes />
              </button>

              <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#333', fontFamily: 'sans-serif' }}>
                Wedding Style 💍
              </h2>

              {/* Fonts Section */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#666', fontSize: '1.1rem' }}>
                  <FaFont /> Typography
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  {FONTS.map(font => (
                    <button
                      key={font.id}
                      onClick={() => applyFont(font.id)}
                      style={{
                        padding: '1rem',
                        border: activeFont === font.id ? '2px solid var(--color-primary)' : '1px solid #ddd',
                        borderRadius: '10px',
                        background: activeFont === font.id ? '#f0f9ff' : 'white',
                        textAlign: 'left',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ fontFamily: font.heading, fontSize: '1.2rem', marginBottom: '0.2rem' }}>Dimitri & Trizah</div>
                      <div style={{ fontFamily: font.body, fontSize: '0.9rem', color: '#666' }}>18 Aprile 2026</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors Section */}
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#666', fontSize: '1.1rem' }}>
                  <FaPalette /> Palette
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {THEMES.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => applyTheme(theme.id)}
                      style={{
                        padding: '1rem',
                        border: activeTheme === theme.id ? '2px solid var(--color-primary)' : '1px solid #ddd',
                        borderRadius: '10px',
                        background: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem'
                      }}
                    >
                      <span style={{ fontWeight: 600, color: '#333' }}>{theme.name}</span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: theme.primary, border: '1px solid #ddd' }} title="Primary" />
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: theme.secondary, border: '1px solid #ddd' }} title="Secondary" />
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: theme.bg, border: '1px solid #ddd' }} title="Background" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ThemePlayground;

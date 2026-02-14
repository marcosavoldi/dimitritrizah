import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const LanguageSelector: React.FC = () => {
  const { setLanguage, completeSelection } = useLanguage();

  const handleSelect = (lang: 'it' | 'en') => {
    setLanguage(lang);
    completeSelection();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      height: '100dvh', // Use dynamic viewport height for mobile
      width: '100vw',
      backgroundColor: 'var(--color-bg)',
      zIndex: 10000, // Increased z-index
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '3rem',
      overflow: 'hidden', // Prevent scrolling
      touchAction: 'none' // Prevent touch interaction with underlying content
    }}>
      {/* Italian Section - Top */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem', // Compact spacing within block
          cursor: 'pointer',
        }}
        onClick={() => handleSelect('it')}
        whileHover={{ scale: 1.05 }}
      >
        <span style={{ fontSize: '4rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>🇮🇹</span>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ 
            fontFamily: 'var(--font-heading)', 
            color: 'var(--color-primary)', 
            fontSize: '2.5rem', 
            margin: 0,
            fontWeight: 400
          }}>
            BENVENUTI
          </h1>
          <p style={{ color: '#666', fontFamily: 'var(--font-body)', fontSize: '1.2rem', margin: '0.5rem 0 0 0' }}>Seleziona la lingua</p>
        </div>
      </motion.div>

      {/* Divider */}
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{
          width: '200px', // Fixed width for elegance as per image
          height: '1px',
          backgroundColor: 'var(--color-primary)',
          opacity: 0.3
        }}
      />

      {/* English Section - Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem', // Compact spacing within block
          cursor: 'pointer',
        }}
        onClick={() => handleSelect('en')}
        whileHover={{ scale: 1.05 }}
      >
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ 
            fontFamily: 'var(--font-heading)', 
            color: 'var(--color-primary)', 
            fontSize: '2.5rem', 
            margin: 0,
            fontWeight: 400
          }}>
            WELCOME
          </h1>
          <p style={{ color: '#666', fontFamily: 'var(--font-body)', fontSize: '1.2rem', margin: '0.5rem 0 0 0' }}>Select language</p>
        </div>
        <span style={{ fontSize: '4rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>🇬🇧</span>
      </motion.div>
    </div>
  );
};

export default LanguageSelector;

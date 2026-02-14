import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaKey } from 'react-icons/fa';
import AdminModal from './AdminModal';


import ThemePlayground from './ThemePlayground';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { setLanguage, language } = useLanguage();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  // Ref for timeout to clear it properly
  const timeoutRef = React.useRef<any>(null);

  const handleKeyClick = () => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const newCount = clickCount + 1;
    
    if (newCount >= 5) {
      setShowAdminModal(true);
      setClickCount(0);
    } else {
      setClickCount(newCount);
      // Reset count after 2 seconds of inactivity
      timeoutRef.current = setTimeout(() => {
        setClickCount(0);
      }, 2000);
    }
  };

  return (
    <div className="layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ThemePlayground />

      {/* Header with Language Switcher */}
      <header style={{
        position: 'absolute',
        top: 0,
        right: 0,
        padding: '2rem', // Increased padding
        zIndex: 50,
        display: 'flex',
        gap: '1rem'
      }}>
        <button 
          onClick={() => setLanguage('it')}
          style={{ 
            background: 'none', 
            border: 'none', 
            opacity: language === 'it' ? 1 : 0.5,
            fontSize: '1.5rem',
            transition: 'opacity 0.3s'
          }}
        >
          🇮🇹
        </button>
        <button 
          onClick={() => setLanguage('en')}
          style={{ 
            background: 'none', 
            border: 'none', 
            opacity: language === 'en' ? 1 : 0.5,
            fontSize: '1.5rem',
            transition: 'opacity 0.3s'
          }}
        >
          🇬🇧
        </button>
      </header>
      
      <main style={{ flex: 1 }}>
        {children}
      </main>

      <footer style={{
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        padding: '2rem',
        textAlign: 'center',
        marginTop: '4rem',
        position: 'relative' // Needed for absolute positioning of key
      }}>
        <p>© 2026 Dimitri & Trizah</p>
        <p style={{fontSize: '0.8rem', marginTop: '0.5rem'}}>Created with ❤️</p>
        
        {/* Admin Key Button */}
        <button 
          onClick={handleKeyClick}
          style={{
            position: 'absolute',
            bottom: '1rem',
            left: '1rem',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            cursor: 'pointer',
            opacity: 0.6,
            transition: 'opacity 0.2s',
            zIndex: 10
          }}
        >
          <FaKey size={14} />
        </button>
      </footer>

      {/* Admin Modal */}
      <AdminModal isOpen={showAdminModal} onClose={() => setShowAdminModal(false)} />
    </div>
  );
};

export default Layout;

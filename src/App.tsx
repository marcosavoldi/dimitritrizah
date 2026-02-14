import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Hero from './components/Hero';
import InfoSection from './components/InfoSection';
import RSVPForm from './components/RSVPForm';
import Admin from './pages/Admin';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import LanguageSelector from './components/LanguageSelector';
import { FaMapMarkerAlt } from 'react-icons/fa'; // Ensure react-icons is installed

import img2 from './assets/images/img2.webp';

import img1 from './assets/images/img1.webp';
import img6 from './assets/images/img6.webp';

import PhotoPlaceholder from './components/PhotoPlaceholder';

function Home() {
  const { t, hasSelectedLanguage } = useLanguage();

  const openMap = () => {
    window.open(`https://www.google.it/maps/place/Diani+Reef+Beach+Resort+%26+Spa/@-4.2792903,39.5945466,17z/data=!4m21!1m11!3m10!1s0x1840461e50fffe27:0x6aeb325d0d713106!2sDiani+Reef+Beach+Resort+%26+Spa!5m2!4m1!1i2!8m2!3d-4.2792229!4d39.5944083!10e5!16s%2Fg%2F1tmwkxr5!3m8!1s0x1840461e50fffe27:0x6aeb325d0d713106!5m2!4m1!1i2!8m2!3d-4.2792229!4d39.5944083!16s%2Fg%2F1tmwkxr5?hl=it&entry=ttu&g_ep=EgoyMDI2MDIxMS4wIKXMDSoASAFQAw%3D%3D`, '_blank');
  };

  const buttonStyle: React.CSSProperties = {
     marginTop: '1rem',
     padding: '0.8rem 1.5rem',
     backgroundColor: 'white',
     color: 'var(--color-primary)',
     border: '1px solid var(--color-primary)',
     borderRadius: '50px',
     cursor: 'pointer',
     display: 'inline-flex',
     alignItems: 'center',
     gap: '0.5rem',
     fontSize: '0.9rem',
     fontWeight: 'bold',
     boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
     transition: 'transform 0.2s',
  };

  return (
    <Layout>
      <AnimatePresence>
        {!hasSelectedLanguage && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
          >
            <LanguageSelector />
          </motion.div>
        )}
      </AnimatePresence>

      <Hero />
      
      {/* Intro */}
      <div style={{ padding: '2rem 1rem 4rem 1rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <p>{t.introText}</p>
        <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{t.confirmBy}</p>
      </div>

      {/* Photo 1 (after Hero) */}
      <div className="container" style={{ padding: '0 1rem' }}>
        <PhotoPlaceholder imageSrc={img2} autoHeight={true} />
      </div>









      {/* Ceremony & Reception */}
      <InfoSection title={t.whereWhen} bgColor="var(--color-secondary)" delay={0.2}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {/* Ceremony & Reception Merged */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3>{t.mergedTitle}</h3>
            <p style={{ fontSize: '1.2rem', marginTop: '0.5rem', fontWeight: 'bold' }}>{t.mergedTime}</p>
            <p style={{ marginTop: '0.5rem' }}>{t.mergedLocation}</p>
            
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              onClick={openMap}
              style={buttonStyle}
            >
              <FaMapMarkerAlt /> {t.mapsButton}
            </motion.button>
          </div>
        </div>
      </InfoSection>

      {/* Photo 5 before Contacts */}
      <div className="container" style={{ padding: '0 1rem', marginBottom: '2rem' }}>
         <PhotoPlaceholder imageSrc={img1} autoHeight={true} />
      </div>

       {/* Contacts */}
       <InfoSection title={t.contactsTitle}>
        <p>{t.contactsText}</p>
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Dimitri</h4>
            <p>
              <a href="tel:+393486700724" style={{ textDecoration: 'none' }}>+39 348 670 0724</a>
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Trizah</h4>
            <p>
              <a href="tel:+254727113249" style={{ textDecoration: 'none' }}>+254 727 113 249</a>
            </p>
          </div>
        </div>
      </InfoSection>

      {/* Photo 6 after Contacts */}
      <div className="container" style={{ padding: '0 1rem' }}>
         <PhotoPlaceholder imageSrc={img6} autoHeight={true} />
      </div>

      {/* RSVP at the end */}
      <RSVPForm />
    </Layout>
  );
}

function App() {
  return (
    <LanguageProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </HashRouter>
    </LanguageProvider>
  );
}

export default App;

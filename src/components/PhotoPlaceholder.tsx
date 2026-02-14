import React from 'react';
import { motion } from 'framer-motion';

interface PhotoPlaceholderProps {
  label?: string;
  imageSrc?: string;
  autoHeight?: boolean;
}

const PhotoPlaceholder: React.FC<PhotoPlaceholderProps> = ({ label, imageSrc, autoHeight = false }) => {
  if (imageSrc) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        style={{ 
          width: autoHeight ? 'fit-content' : '100%', 
          maxWidth: '800px', 
          height: autoHeight ? 'auto' : '400px',
          borderRadius: '8px', 
          overflow: 'hidden',
          margin: '2rem auto',
          boxShadow: autoHeight ? 'none' : '0 4px 15px rgba(0,0,0,0.1)'
        }}
      >
        <img 
          src={imageSrc} 
          alt={label || 'Photo'} 
          style={{ 
            width: autoHeight ? 'auto' : '100%', 
            maxWidth: '100%',
            height: autoHeight ? 'auto' : '100%', 
            maxHeight: autoHeight ? '70vh' : 'none',
            objectFit: autoHeight ? 'contain' : 'cover',
            display: 'block',
            margin: '0 auto'
          }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      style={{ 
        width: '100%', 
        maxWidth: '800px', 
        height: '400px', 
        backgroundColor: '#eee', 
        borderRadius: '8px', 
        display: 'grid', 
        placeItems: 'center', 
        color: '#888',
        margin: '2rem auto' 
      }}
    >
      {label}
    </motion.div>
  );
};

export default PhotoPlaceholder;

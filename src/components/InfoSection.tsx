import React from 'react';
import { motion } from 'framer-motion';

interface InfoSectionProps {
  title?: string;
  children: React.ReactNode;
  bgColor?: string;
  delay?: number;
}

const InfoSection: React.FC<InfoSectionProps> = ({ title, children, bgColor = 'transparent', delay = 0 }) => {
  return (
    <div className="section-padding" style={{ backgroundColor: bgColor }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay }}
        >
          {title && (
            <h2 style={{
              textAlign: 'center',
              marginBottom: '2rem',
              fontSize: '2rem',
              color: 'var(--color-primary)'
            }}>
              {title}
            </h2>
          )}
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center',
            fontSize: '1.1rem'
          }}>
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InfoSection;

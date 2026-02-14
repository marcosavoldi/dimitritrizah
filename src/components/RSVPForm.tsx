import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '../context/LanguageContext';
import { FaTimes, FaCheck, FaPlus, FaTrash } from 'react-icons/fa';

declare global {
  interface Window {
    confetti: (options?: unknown) => void;
  }
}

const RSVPForm: React.FC = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    notes: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  
  // Allergy State
  const [hasAllergies, setHasAllergies] = useState<boolean | null>(null); // null = nothing selected
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAllergies, setSelectedAllergies] = useState<Record<string, boolean>>({
    lactose: false,
    gluten: false,
    sulfites: false,
    histamine: false,
    treeNuts: false,
    peanuts: false,
    eggs: false,
    fish: false,
    shellfish: false,
    otherIntolerance: false,
    otherAllergy: false
  });
  
  // Custom Lists
  const [customIntolerancesList, setCustomIntolerancesList] = useState<string[]>([]);
  const [customAllergiesList, setCustomAllergiesList] = useState<string[]>([]);

  // Input States for "Other"
  const [customIntoleranceInput, setCustomIntoleranceInput] = useState('');
  const [customAllergyInput, setCustomAllergyInput] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAllergyToggle = (key: string) => {
    setSelectedAllergies(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Custom Item Handlers
  const addCustomIntolerance = () => {
    if (customIntoleranceInput.trim()) {
      setCustomIntolerancesList(prev => [...prev, customIntoleranceInput.trim()]);
      setCustomIntoleranceInput('');
      handleAllergyToggle('otherIntolerance'); // Close the input
    }
  };

  const removeCustomIntolerance = (index: number) => {
    setCustomIntolerancesList(prev => prev.filter((_, i) => i !== index));
  };

  const addCustomAllergy = () => {
    if (customAllergyInput.trim()) {
      setCustomAllergiesList(prev => [...prev, customAllergyInput.trim()]);
      setCustomAllergyInput('');
      handleAllergyToggle('otherAllergy'); // Close the input
    }
  };

  const removeCustomAllergy = (index: number) => {
    setCustomAllergiesList(prev => prev.filter((_, i) => i !== index));
  };

  const handleHasAllergiesChange = (value: boolean) => {
    setHasAllergies(value);
    if (value) {
      setIsModalOpen(true);
    } else {
      // Reset everything
      setSelectedAllergies({
        lactose: false,
        gluten: false,
        sulfites: false,
        histamine: false,
        treeNuts: false,
        peanuts: false,
        eggs: false,
        fish: false,
        shellfish: false,
        otherIntolerance: false,
        otherAllergy: false
      });
      setCustomIntolerancesList([]);
      setCustomAllergiesList([]);
      setCustomIntoleranceInput('');
      setCustomAllergyInput('');
    }
  };

  // Load confetti
  useEffect(() => {
    if (!window.confetti) {
      const script = document.createElement('script');
      script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Auto-dismiss
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => setStatus('idle'), 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) return;

    // Categorize selections
    const intoleranceKeys = ['lactose', 'gluten', 'sulfites', 'histamine'];
    const allergyKeys = ['treeNuts', 'peanuts', 'eggs', 'fish', 'shellfish'];

    const selectedIntolerances = intoleranceKeys
      .filter(key => selectedAllergies[key])
      .map(key => t[key as keyof typeof t] || key);
    
    // Merge custom intolerances
    const finalIntolerances = [...selectedIntolerances, ...customIntolerancesList];

    const selectedAllergiesList = allergyKeys
      .filter(key => selectedAllergies[key])
      .map(key => t[key as keyof typeof t] || key);

    // Merge custom allergies
    const finalAllergies = [...selectedAllergiesList, ...customAllergiesList];
    
    const intolerancesString = finalIntolerances.join(', ');
    const allergiesString = finalAllergies.join(', ');

    setStatus('submitting');
    try {
      await addDoc(collection(db, "rsvps"), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        notes: formData.notes,
        intolerances: intolerancesString,
        allergies: allergiesString,
        timestamp: serverTimestamp()
      });
      setStatus('success');
      setFormData({ firstName: '', lastName: '', notes: '' });
      setHasAllergies(null);
      setSelectedAllergies({
        lactose: false,
        gluten: false,
        sulfites: false,
        histamine: false,
        treeNuts: false,
        peanuts: false,
        eggs: false,
        fish: false,
        shellfish: false,
        otherIntolerance: false,
        otherAllergy: false
      });
      setCustomIntolerancesList([]);
      setCustomAllergiesList([]);
      setCustomIntoleranceInput('');
      setCustomAllergyInput('');
      
      
      if (window.confetti) {
        window.confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 },
          zIndex: 9999,
          colors: ['#153243', '#c1bdb3', '#ffffff', '#FFD700']
        });
      }
    } catch (error) {
      console.error("Error adding document: ", error);
      setStatus('error');
    }
  };

  const activeAllergyCount = Object.values(selectedAllergies).filter(Boolean).length + customIntolerancesList.length + customAllergiesList.length;

  return (
    <div className="section-padding" style={{ backgroundColor: 'var(--color-secondary)' }}>
      <div className="container">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--color-primary)' }}>{t.rsvpTitle}</h2>
          
          {status === 'success' ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem', 
              backgroundColor: 'rgba(255, 255, 255, 0.4)', 
              color: 'var(--color-primary)', 
              border: '1px solid var(--color-primary)', 
              borderRadius: '12px', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
            }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{t.rsvpSuccessTitle}</h3>
              <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>{t.rsvpSuccessText}</p>
              <button onClick={() => setStatus('idle')} style={{ padding: '0.5rem 1.5rem', background: 'var(--color-primary)', color: 'var(--color-secondary)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>{t.rsvpAnother}</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="text" name="firstName" placeholder={t.name + " *"} value={formData.firstName} onChange={handleChange} style={inputStyle} required />
                <input type="text" name="lastName" placeholder={t.surname + " *"} value={formData.lastName} onChange={handleChange} style={inputStyle} required />
              </div>

              {/* Allergy Selection Trigger */}
              <div style={{ padding: '1rem', borderRadius: '12px', border: '1px solid rgba(21, 50, 67, 0.2)', backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
                <p style={{ marginBottom: '1rem', color: 'var(--color-primary)', fontWeight: 600, fontSize: '1.1rem' }}>{t.allergiesQuestion}</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    type="button" 
                    onClick={() => handleHasAllergiesChange(false)}
                    style={{ 
                      flex: 1, 
                      padding: '0.8rem', 
                      borderRadius: '8px', 
                      border: `1px solid var(--color-primary)`,
                      backgroundColor: hasAllergies === false ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.2)',
                      color: hasAllergies === false ? 'var(--color-secondary)' : 'var(--color-primary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontWeight: 600
                    }}
                  >
                    {t.no}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleHasAllergiesChange(true)}
                    style={{ 
                      flex: 1, 
                      padding: '0.8rem', 
                      borderRadius: '8px', 
                      border: `1px solid var(--color-primary)`,
                      backgroundColor: hasAllergies === true ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.2)',
                      color: hasAllergies === true ? 'var(--color-secondary)' : 'var(--color-primary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontWeight: 600
                    }}
                  >
                    {t.yes}
                    {hasAllergies && activeAllergyCount > 0 && <span style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-primary)', borderRadius: '50%', width: '22px', height: '22px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{activeAllergyCount}</span>}
                  </button>
                </div>
                {hasAllergies && activeAllergyCount > 0 && (
                  <p style={{ marginTop: '0.8rem', fontSize: '1rem', color: 'var(--color-primary)', textAlign: 'center', fontWeight: 500 }}>
                    Selezionati: {activeAllergyCount}
                  </p>
                )}
                {hasAllergies && (
                    <div style={{ textAlign: 'center', marginTop: '0.8rem' }}>
                        <button type="button" onClick={() => setIsModalOpen(true)} style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.95rem', fontStyle: 'italic' }}>Modifica Scelte</button>
                    </div>
                )}
              </div>

              <textarea name="notes" placeholder={t.notes} value={formData.notes} onChange={handleChange} style={{ ...inputStyle, minHeight: '100px' }} />

              {status === 'error' && <p style={{ color: 'red', textAlign: 'center' }}>{t.error}</p>}
              <button type="submit" disabled={status === 'submitting'} style={{ padding: '1rem', backgroundColor: 'var(--color-primary)', color: 'var(--color-secondary)', border: 'none', borderRadius: '12px', fontSize: '1.2rem', cursor: status === 'submitting' ? 'wait' : 'pointer', transition: 'opacity 0.3s', fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>{status === 'submitting' ? t.submitting : t.submit}</button>
            </form>
          )}
        </motion.div>
      </div>

      {/* Structured Allergy Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} style={{ backgroundColor: '#e8e6e1', width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '16px', padding: '1.5rem', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: '1px solid var(--color-primary)' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--color-primary)' }}><FaTimes /></button>
              
              <h3 style={{ textAlign: 'center', color: 'var(--color-primary)', marginBottom: '1.5rem', marginTop: '1.5rem', fontFamily: 'var(--font-heading)' }}>{t.modalTitle}</h3>

              {/* Intolerances Section */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: 'var(--color-primary)', borderBottom: '1px solid rgba(21, 50, 67, 0.2)', paddingBottom: '0.5rem', marginBottom: '1rem', textSizeAdjust: '100%' }}>{t.intolerancesTitle}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <ToggleItem label={t.gluten} active={selectedAllergies.gluten} onToggle={() => handleAllergyToggle('gluten')} />
                  <ToggleItem label={t.lactose} active={selectedAllergies.lactose} onToggle={() => handleAllergyToggle('lactose')} />
                  <ToggleItem label={t.sulfites} active={selectedAllergies.sulfites} onToggle={() => handleAllergyToggle('sulfites')} />
                  <ToggleItem label={t.histamine} active={selectedAllergies.histamine} onToggle={() => handleAllergyToggle('histamine')} />
                  
                  {/* Custom Intolerances List */}
                  {customIntolerancesList.map((item, index) => (
                    <CustomToggleItem key={index} label={item} onDelete={() => removeCustomIntolerance(index)} />
                  ))}

                  {/* Add Other Intolerance */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <ToggleItem label={t.other} active={selectedAllergies.otherIntolerance} onToggle={() => handleAllergyToggle('otherIntolerance')} />
                    {selectedAllergies.otherIntolerance && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                        >
                            <textarea
                                placeholder={t.specify} 
                                value={customIntoleranceInput} 
                                onChange={(e) => setCustomIntoleranceInput(e.target.value)}
                                style={{ ...inputStyle, fontSize: '0.9rem', padding: '0.8rem', minHeight: '80px', resize: 'vertical' }}
                            />
                            <button 
                                type="button" 
                                onClick={addCustomIntolerance}
                                disabled={!customIntoleranceInput.trim()}
                                style={{
                                    alignSelf: 'flex-end',
                                    padding: '0.5rem 1rem',
                                    backgroundColor: customIntoleranceInput.trim() ? 'var(--color-primary)' : '#ccc',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: customIntoleranceInput.trim() ? 'pointer' : 'not-allowed',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem'
                                }}
                            >
                                <FaPlus size={12} /> {t.confirm}
                            </button>
                        </motion.div>
                    )}
                  </div>
                </div>
              </div>

              {/* Allergies Section */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: 'var(--color-primary)', borderBottom: '1px solid rgba(21, 50, 67, 0.2)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>{t.allergiesTitle}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <ToggleItem label={t.treeNuts} active={selectedAllergies.treeNuts} onToggle={() => handleAllergyToggle('treeNuts')} />
                  <ToggleItem label={t.peanuts} active={selectedAllergies.peanuts} onToggle={() => handleAllergyToggle('peanuts')} />
                  <ToggleItem label={t.eggs} active={selectedAllergies.eggs} onToggle={() => handleAllergyToggle('eggs')} />
                  <ToggleItem label={t.fish} active={selectedAllergies.fish} onToggle={() => handleAllergyToggle('fish')} />
                  <ToggleItem label={t.shellfish} active={selectedAllergies.shellfish} onToggle={() => handleAllergyToggle('shellfish')} />
                  
                  {/* Custom Allergies List */}
                  {customAllergiesList.map((item, index) => (
                    <CustomToggleItem key={index} label={item} onDelete={() => removeCustomAllergy(index)} />
                  ))}

                  {/* Add Other Allergy */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <ToggleItem label={t.other} active={selectedAllergies.otherAllergy} onToggle={() => handleAllergyToggle('otherAllergy')} />
                    {selectedAllergies.otherAllergy && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                        >
                            <textarea
                                placeholder={t.specify} 
                                value={customAllergyInput} 
                                onChange={(e) => setCustomAllergyInput(e.target.value)}
                                style={{ ...inputStyle, fontSize: '0.9rem', padding: '0.8rem', minHeight: '120px', resize: 'vertical' }}
                            />
                            <button 
                                type="button" 
                                onClick={addCustomAllergy}
                                disabled={!customAllergyInput.trim()}
                                style={{
                                    alignSelf: 'flex-end',
                                    padding: '0.5rem 1rem',
                                    backgroundColor: customAllergyInput.trim() ? 'var(--color-primary)' : '#ccc',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: customAllergyInput.trim() ? 'pointer' : 'not-allowed',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem'
                                }}
                            >
                                <FaPlus size={12} /> {t.confirm}
                            </button>
                        </motion.div>
                    )}
                  </div>
                </div>
              </div>

              <button onClick={() => setIsModalOpen(false)} style={{ width: '100%', padding: '1rem', backgroundColor: 'var(--color-primary)', color: 'var(--color-secondary)', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>{t.confirm}</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ToggleItem = ({ label, active, onToggle }: { label: string, active: boolean, onToggle: () => void }) => (
  <div onClick={onToggle} style={{ 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '0.8rem', 
    borderRadius: '8px', 
    backgroundColor: active ? 'var(--color-primary)' : 'rgba(255,255,255,0.4)', 
    cursor: 'pointer', 
    border: `1px solid ${active ? 'var(--color-primary)' : 'rgba(21, 50, 67, 0.1)'}`,
    transition: 'all 0.2s',
  }}>
    <span style={{ fontWeight: 500, color: active ? 'var(--color-secondary)' : 'var(--color-primary)' }}>{label}</span>
    <div style={{ 
        width: '20px', 
        height: '20px', 
        borderRadius: '50%', 
        border: `1px solid ${active ? 'var(--color-secondary)' : 'var(--color-primary)'}`, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: active ? 'var(--color-secondary)' : 'transparent' 
    }}>
      {active && <FaCheck style={{ color: 'var(--color-primary)', fontSize: '0.7rem' }} />}
    </div>
  </div>
);

const CustomToggleItem = ({ label, onDelete }: { label: string, onDelete: () => void }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', borderRadius: '8px', backgroundColor: 'rgba(21, 50, 67, 0.1)', border: '1px solid var(--color-primary)' }}>
      <span style={{ fontWeight: 500, color: 'var(--color-primary)' }}>{label}</span>
      <button onClick={onDelete} type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cc0000', padding: '4px', display: 'flex', alignItems: 'center' }}>
        <FaTrash size={14} />
      </button>
    </div>
  );

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '1rem',
  border: '1px solid rgba(21, 50, 67, 0.3)',
  borderRadius: '12px',
  fontFamily: 'inherit',
  fontSize: '1rem',
  backgroundColor: 'rgba(255, 255, 255, 0.4)',
  color: 'var(--color-primary)',
  outline: 'none'
};


export default RSVPForm;

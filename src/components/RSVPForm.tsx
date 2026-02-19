import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '../context/LanguageContext';
import { FaTimes, FaCheck, FaPlus, FaTrash, FaUser, FaChild, FaExclamationTriangle } from 'react-icons/fa';

declare global {
  interface Window {
    confetti: (options?: unknown) => void;
  }
}

type GuestType = 'adult' | 'child_0_5' | 'child_6_10';

interface Guest {
  id: string; // unique temp id
  name: string;
  type: GuestType;
  hasAllergies: boolean;
  allergies: Record<string, boolean>;
  customIntolerances: string[];
  customAllergies: string[];
}

const RSVPForm: React.FC = () => {
  const { t } = useLanguage();

  // -- STATE --
  const [mainGuestName, setMainGuestName] = useState('');
  const [notes, setNotes] = useState('');
  const [counts, setCounts] = useState({
    adults: 1,
    children05: 0,
    children610: 0
  });

  const [guests, setGuests] = useState<Guest[]>([]);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Modal State
  const [modalGuestIndex, setModalGuestIndex] = useState<number | null>(null); // Index of guest being edited

  // Temporary State for Modal (to avoid saving on every click, only on confirm)
  const [tempAllergyState, setTempAllergyState] = useState<{
    allergies: Record<string, boolean>;
    customIntolerances: string[];
    customAllergies: string[];
    customIntoleranceInput: string;
    customAllergyInput: string;
  } | null>(null);

  // -- EFFECTS --

  // Sync guests array with counts
  useEffect(() => {
    const newGuests: Guest[] = [];

    // Helper to find existing guest or create new

    const existingAdults = guests.filter(g => g.type === 'adult');
    const existingChild05 = guests.filter(g => g.type === 'child_0_5');
    const existingChild610 = guests.filter(g => g.type === 'child_6_10');

    // Add Adults
    for (let i = 0; i < counts.adults; i++) {
      if (i < existingAdults.length) {
        newGuests.push(existingAdults[i]);
      } else {
        newGuests.push(createEmptyGuest('adult'));
      }
    }

    // Add Children 0-5
    for (let i = 0; i < counts.children05; i++) {
      if (i < existingChild05.length) {
        newGuests.push(existingChild05[i]);
      } else {
        newGuests.push(createEmptyGuest('child_0_5'));
      }
    }

    // Add Children 6-10
    for (let i = 0; i < counts.children610; i++) {
      if (i < existingChild610.length) {
        newGuests.push(existingChild610[i]);
      } else {
        newGuests.push(createEmptyGuest('child_6_10'));
      }
    }

    setGuests(newGuests);
  }, [counts.adults, counts.children05, counts.children610]);

  // Load confetti
  useEffect(() => {
    if (!window.confetti) {
      const script = document.createElement('script');
      script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Auto-dismiss success
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => setStatus('idle'), 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);


  // -- HELPERS --

  const createEmptyGuest = (type: GuestType): Guest => ({
    id: Math.random().toString(36).substr(2, 9),
    name: '',
    type,
    hasAllergies: false,
    allergies: {
      lactose: false, gluten: false, sulfites: false, histamine: false,
      treeNuts: false, peanuts: false, eggs: false, fish: false, shellfish: false,
      otherIntolerance: false, otherAllergy: false
    },
    customIntolerances: [],
    customAllergies: []
  });

  const updateCount = (key: keyof typeof counts, delta: number) => {
    setCounts(prev => {
      const newVal = prev[key] + delta;
      if (newVal < 0) return prev;
      if (key === 'adults' && newVal < 1) return prev; // Min 1 adult
      return { ...prev, [key]: newVal };
    });
  };

  const handleGuestNameChange = (index: number, name: string) => {
    setGuests(prev => {
      const copy = [...prev];
      copy[index].name = name;
      return copy;
    });
  };

  // Sync Main Guest Name to First Adult Guest
  useEffect(() => {
    if (guests.length > 0 && guests[0].type === 'adult') {
      setGuests(prev => {
        if (prev.length > 0 && prev[0].name !== mainGuestName) {
          const copy = [...prev];
          copy[0] = { ...copy[0], name: mainGuestName };
          return copy;
        }
        return prev;
      });
    }
  }, [mainGuestName]);

  // -- MODAL HANDLERS --

  const openAllergyModal = (index: number) => {
    const guest = guests[index];
    setModalGuestIndex(index);
    setTempAllergyState({
      allergies: { ...guest.allergies },
      customIntolerances: [...guest.customIntolerances],
      customAllergies: [...guest.customAllergies],
      customIntoleranceInput: '',
      customAllergyInput: ''
    });
  };

  const closeAllergyModal = () => {
    setModalGuestIndex(null);
    setTempAllergyState(null);
  };

  const saveAllergies = () => {
    if (modalGuestIndex === null || !tempAllergyState) return;

    setGuests(prev => {
      const copy = [...prev];
      const guest = copy[modalGuestIndex];

      const hasAny = Object.values(tempAllergyState.allergies).some(v => v) ||
        tempAllergyState.customIntolerances.length > 0 ||
        tempAllergyState.customAllergies.length > 0;

      guest.allergies = tempAllergyState.allergies;
      guest.customIntolerances = tempAllergyState.customIntolerances;
      guest.customAllergies = tempAllergyState.customAllergies;
      guest.hasAllergies = hasAny;

      return copy;
    });
    closeAllergyModal();
  };

  // Temp Modal Toggles
  const toggleTempAllergy = (key: string) => {
    if (!tempAllergyState) return;
    setTempAllergyState(prev => prev ? ({
      ...prev,
      allergies: { ...prev.allergies, [key]: !prev.allergies[key] }
    }) : null);
  };

  // -- SUBMIT --

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainGuestName.trim()) {
      alert(t.validationErrorMainName);
      return;
    }

    // Validate that all guests have names
    const missingNames = guests.some(g => !g.name.trim());
    if (missingNames) {
      alert(t.validationErrorNames);
      return;
    }

    setStatus('submitting');

    try {
      // Format data for simpler reading in Firebase / Exports
      const formattedGuests = guests.map(g => {
        // Collect strings
        const activeIntolerances = ['lactose', 'gluten', 'sulfites', 'histamine']
          .filter(k => g.allergies[k])
          .map(k => t[k as keyof typeof t] || k);

        const activeAllergies = ['treeNuts', 'peanuts', 'eggs', 'fish', 'shellfish']
          .filter(k => g.allergies[k])
          .map(k => t[k as keyof typeof t] || k);

        const allIntolerances = [...activeIntolerances, ...g.customIntolerances].join(', ');
        const allAllergies = [...activeAllergies, ...g.customAllergies].join(', ');

        return {
          name: g.name,
          type: g.type,
          hasInfos: g.hasAllergies,
          details: `Int: ${allIntolerances} | All: ${allAllergies}`
        };
      });

      const payload = {
        mainGuest: mainGuestName,
        counts: counts,
        notes: notes,
        guests: formattedGuests,
        timestamp: serverTimestamp(),
        totalPeople: guests.length
      };

      await addDoc(collection(db, "rsvps_family"), payload);

      setStatus('success');
      // Reset
      setMainGuestName('');
      setNotes('');
      setCounts({ adults: 1, children05: 0, children610: 0 });
      // Guests will reset via effect

      if (window.confetti) {
        window.confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 },
          zIndex: 9999,
          colors: ['#153243', '#c1bdb3', '#ffffff', '#FFD700']
        });
      }

    } catch (error: any) {
      console.error("Error adding document: ", error);
      setStatus('error');
      setErrorMessage(error.message || 'Unknown error');
    }
  };

  return (
    <div className="section-padding" style={{ backgroundColor: 'var(--color-secondary)' }}>
      <div className="container">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--color-primary)' }}>{t.rsvpTitle}</h2>

          {status === 'success' ? (
            <div style={successBoxStyle}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{t.rsvpSuccessTitle}</h3>
              <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>{t.rsvpSuccessText}</p>
              <button onClick={() => setStatus('idle')} style={buttonStyle}>{t.rsvpAnother}</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* --- STEP 1: Main Info & Counts --- */}
              <div style={cardStyle}>
                <h4 style={sectionTitleStyle}>1. {t.contactsTitle}</h4>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>{t.mainGuestName}</label>
                  <input
                    type="text"
                    value={mainGuestName}
                    onChange={(e) => setMainGuestName(e.target.value)}
                    style={inputStyle}
                    placeholder=""
                    required
                  />
                </div>

                <div style={counterContainerStyle}>
                  <Counter
                    label={t.adults}
                    value={counts.adults}
                    onChange={(d) => updateCount('adults', d)}
                    min={1}
                  />
                  <Counter
                    label={t.children05}
                    value={counts.children05}
                    onChange={(d) => updateCount('children05', d)}
                    min={0}
                  />
                  <Counter
                    label={t.children610}
                    value={counts.children610}
                    onChange={(d) => updateCount('children610', d)}
                    min={0}
                  />
                </div>
              </div>

              {/* --- STEP 2: Guest Details --- */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ ...sectionTitleStyle, textAlign: 'center' }}>2. {t.guestsHeader} ({guests.length})</h4>
                {guests.map((guest, index) => (
                  <div key={guest.id} style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      {guest.type === 'adult' ? <FaUser size={14} /> : <FaChild size={14} />}
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.7 }}>
                        {guest.type === 'adult' ? t.adults : (guest.type === 'child_0_5' ? t.children05 : t.children610).replace('Bambini', 'Bambino/a').replace('Children', 'Child')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      <input
                        type="text"
                        placeholder={t.guestName}
                        value={guest.name}
                        onChange={(e) => handleGuestNameChange(index, e.target.value)}
                        style={inputStyle}
                      />

                      <button
                        type="button"
                        onClick={() => openAllergyModal(index)}
                        style={{
                          padding: '0.6rem 1rem',
                          borderRadius: '8px',
                          border: guest.hasAllergies ? '1px solid #d32f2f' : '1px solid rgba(21, 50, 67, 0.3)',
                          backgroundColor: guest.hasAllergies ? '#ffebee' : 'transparent',
                          color: guest.hasAllergies ? '#d32f2f' : 'var(--color-primary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          width: 'fit-content',
                          fontSize: '0.9rem',
                          alignSelf: 'flex-start'
                        }}
                      >
                        {guest.hasAllergies ? <FaExclamationTriangle /> : <FaPlus size={12} />}
                        <span style={{ fontWeight: 500 }}>
                          {guest.hasAllergies ? t.dietaryNeedsButtonActive : t.dietaryNeedsButton}
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>


              {/* --- STEP 3: Notes & Submit --- */}
              <textarea
                placeholder={t.notes}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ ...inputStyle, minHeight: '100px' }}
              />

              {status === 'error' && (
                <div style={{ color: 'red', textAlign: 'center', backgroundColor: 'rgba(255,0,0,0.1)', padding: '1rem', borderRadius: '8px' }}>
                  <p style={{ fontWeight: 'bold' }}>{t.error}</p>
                  <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>{errorMessage}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                style={submitButtonStyle}
              >
                {status === 'submitting' ? t.submitting : t.submit}
              </button>

            </form>
          )}
        </motion.div>
      </div>

      {/* --- MODAL --- */}
      <AnimatePresence>
        {modalGuestIndex !== null && tempAllergyState && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={modalBackdropStyle}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} style={modalContentStyle}>
              <button onClick={closeAllergyModal} style={closeModalButtonStyle}><FaTimes /></button>

              <h3 style={modalTitleStyle}>
                {t.modalTitle} <br />
                <span style={{ fontSize: '1rem', fontWeight: 'normal', opacity: 0.7 }}>
                  {guests[modalGuestIndex].name || t.guest}
                </span>
              </h3>

              {/* Intolerances */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={modalSectionTitleStyle}>{t.intolerancesTitle}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <ToggleItem label={t.gluten} active={tempAllergyState.allergies.gluten} onToggle={() => toggleTempAllergy('gluten')} />
                  <ToggleItem label={t.lactose} active={tempAllergyState.allergies.lactose} onToggle={() => toggleTempAllergy('lactose')} />
                  <ToggleItem label={t.sulfites} active={tempAllergyState.allergies.sulfites} onToggle={() => toggleTempAllergy('sulfites')} />
                  <ToggleItem label={t.histamine} active={tempAllergyState.allergies.histamine} onToggle={() => toggleTempAllergy('histamine')} />

                  {tempAllergyState.customIntolerances.map((item, i) => (
                    <CustomToggleItem
                      key={i}
                      label={item}
                      onDelete={() => setTempAllergyState(prev => prev ? ({ ...prev, customIntolerances: prev.customIntolerances.filter((_, idx) => idx !== i) }) : null)}
                    />
                  ))}

                  {/* Add Custom Intolerance */}
                  <div style={customInputContainerStyle}>
                    <textarea
                      placeholder={t.other + "..."}
                      value={tempAllergyState.customIntoleranceInput}
                      onChange={(e) => setTempAllergyState(prev => prev ? ({ ...prev, customIntoleranceInput: e.target.value }) : null)}
                      style={miniInputStyle}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (tempAllergyState.customIntoleranceInput.trim()) {
                          setTempAllergyState(prev => prev ? ({
                            ...prev,
                            customIntolerances: [...prev.customIntolerances, prev.customIntoleranceInput.trim()],
                            customIntoleranceInput: ''
                          }) : null);
                        }
                      }}
                      disabled={!tempAllergyState.customIntoleranceInput.trim()}
                      style={miniButtonStyle}
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>
              </div>

              {/* Allergies */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={modalSectionTitleStyle}>{t.allergiesTitle}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <ToggleItem label={t.treeNuts} active={tempAllergyState.allergies.treeNuts} onToggle={() => toggleTempAllergy('treeNuts')} />
                  <ToggleItem label={t.peanuts} active={tempAllergyState.allergies.peanuts} onToggle={() => toggleTempAllergy('peanuts')} />
                  <ToggleItem label={t.eggs} active={tempAllergyState.allergies.eggs} onToggle={() => toggleTempAllergy('eggs')} />
                  <ToggleItem label={t.fish} active={tempAllergyState.allergies.fish} onToggle={() => toggleTempAllergy('fish')} />
                  <ToggleItem label={t.shellfish} active={tempAllergyState.allergies.shellfish} onToggle={() => toggleTempAllergy('shellfish')} />

                  {tempAllergyState.customAllergies.map((item, i) => (
                    <CustomToggleItem
                      key={i}
                      label={item}
                      onDelete={() => setTempAllergyState(prev => prev ? ({ ...prev, customAllergies: prev.customAllergies.filter((_, idx) => idx !== i) }) : null)}
                    />
                  ))}

                  {/* Add Custom Allergy */}
                  <div style={customInputContainerStyle}>
                    <textarea
                      placeholder={t.other + "..."}
                      value={tempAllergyState.customAllergyInput}
                      onChange={(e) => setTempAllergyState(prev => prev ? ({ ...prev, customAllergyInput: e.target.value }) : null)}
                      style={miniInputStyle}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (tempAllergyState.customAllergyInput.trim()) {
                          setTempAllergyState(prev => prev ? ({
                            ...prev,
                            customAllergies: [...prev.customAllergies, prev.customAllergyInput.trim()],
                            customAllergyInput: ''
                          }) : null);
                        }
                      }}
                      disabled={!tempAllergyState.customAllergyInput.trim()}
                      style={miniButtonStyle}
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>
              </div>

              <button onClick={saveAllergies} style={confirmButtonStyle}>{t.confirm}</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- SUBCOMPONENTS ---

const Counter = ({ label, value, onChange, min }: { label: string, value: number, onChange: (d: number) => void, min: number }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
    <span style={{ fontWeight: 500, color: 'var(--color-primary)' }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '8px', padding: '0.2rem' }}>
      <button
        type="button"
        onClick={() => onChange(-1)}
        disabled={value <= min}
        style={{ ...counterButtonStyle, opacity: value <= min ? 0.3 : 1 }}
      >
        -
      </button>
      <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 'bold' }}>{value}</span>
      <button
        type="button"
        onClick={() => onChange(1)}
        style={counterButtonStyle}
      >
        +
      </button>
    </div>
  </div>
);

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


// --- STYLES ---

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

const cardStyle: React.CSSProperties = {
  padding: '1.5rem',
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
  borderRadius: '16px',
  border: '1px solid rgba(21, 50, 67, 0.1)'
};

const sectionTitleStyle: React.CSSProperties = {
  color: 'var(--color-primary)',
  marginBottom: '1rem',
  fontSize: '1.1rem',
  fontWeight: 600
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '0.5rem',
  color: 'var(--color-primary)',
  fontSize: '0.9rem',
  fontWeight: 500
};

const counterContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem'
};

const counterButtonStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '6px',
  border: 'none',
  backgroundColor: 'var(--color-primary)',
  color: 'var(--color-secondary)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.2rem'
};

const buttonStyle: React.CSSProperties = {
  padding: '0.5rem 1.5rem',
  background: 'var(--color-primary)',
  color: 'var(--color-secondary)',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

const submitButtonStyle: React.CSSProperties = {
  padding: '1rem',
  backgroundColor: 'var(--color-primary)',
  color: 'var(--color-secondary)',
  border: 'none',
  borderRadius: '12px',
  fontSize: '1.2rem',
  cursor: 'pointer',
  transition: 'opacity 0.3s',
  fontFamily: 'var(--font-heading)',
  letterSpacing: '1px'
};

const successBoxStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '2rem',
  backgroundColor: 'rgba(255, 255, 255, 0.4)',
  color: 'var(--color-primary)',
  border: '1px solid var(--color-primary)',
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
};

// Modal Styles
const modalBackdropStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem'
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: '#e8e6e1', width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '16px', padding: '1.5rem', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: '1px solid var(--color-primary)'
};

const closeModalButtonStyle: React.CSSProperties = {
  position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--color-primary)'
};

const modalTitleStyle: React.CSSProperties = {
  textAlign: 'center', color: 'var(--color-primary)', marginBottom: '1.5rem', marginTop: '1.5rem', fontFamily: 'var(--font-heading)'
};

const modalSectionTitleStyle: React.CSSProperties = {
  color: 'var(--color-primary)', borderBottom: '1px solid rgba(21, 50, 67, 0.2)', paddingBottom: '0.5rem', marginBottom: '1rem', textSizeAdjust: '100%'
};

const customInputContainerStyle: React.CSSProperties = {
  display: 'flex', gap: '0.5rem', marginTop: '0.5rem'
};

const miniInputStyle: React.CSSProperties = {
  ...inputStyle, padding: '0.6rem', fontSize: '0.9rem', minHeight: '40px', resize: 'vertical'
};

const miniButtonStyle: React.CSSProperties = {
  padding: '0 1rem', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-primary)', color: 'white', cursor: 'pointer'
};

const confirmButtonStyle: React.CSSProperties = {
  width: '100%', padding: '1rem', backgroundColor: 'var(--color-primary)', color: 'var(--color-secondary)', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer'
};

export default RSVPForm;

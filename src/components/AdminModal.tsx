import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query, deleteDoc, doc, Timestamp, QueryDocumentSnapshot, type DocumentData, getDoc, updateDoc } from 'firebase/firestore';
import { FaTimes, FaTrash, FaSearch, FaFilePdf } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RSVP {
  id: string;
  firstName: string;
  lastName: string;
  intolerances: string;
  allergies?: string;
  notes: string;
  timestamp?: Timestamp;
  isFamily?: boolean;
  mainGuest?: string;
  type?: 'adult' | 'child_0_5' | 'child_6_10';
}

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // State for detail modal
  const [selectedRsvp, setSelectedRsvp] = useState<RSVP | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'dimitri&trizah' && password === '18042026') {
      setIsAuthenticated(true);
      setError('');
      fetchRsvps();
    } else {
      setError('Credenziali errate');
    }
  };

  // Helper to parse family guests into flat RSVP objects
  const flattenFamilyGuest = (docId: string, data: DocumentData, guest: any, index: number): RSVP => {
    let intol = '';
    let allerg = '';

    // Parse combined details string "Int: ... | All: ..."
    if (guest.details) {
      const parts = guest.details.split('|');
      if (parts[0]) intol = parts[0].replace('Int:', '').trim();
      if (parts[1]) allerg = parts[1].replace('All:', '').trim();
    }

    return {
      id: `${docId}_${index}`, // Composite ID for unique key
      firstName: guest.name || 'Ospite',
      lastName: '', // Family form doesn't separate last name
      intolerances: intol,
      allergies: allerg,
      notes: data.notes || '', // Inherit main note
      timestamp: data.timestamp,
      isFamily: true,
      mainGuest: data.mainGuest,
      type: guest.type
    };
  };

  const fetchRsvps = async () => {
    setLoading(true);
    try {
      // Parallelize fetches for better performance
      const [legacySnapshot, familySnapshot] = await Promise.all([
        getDocs(query(collection(db, "rsvps"), orderBy("timestamp", "desc"))),
        getDocs(query(collection(db, "rsvps_family"), orderBy("timestamp", "desc")))
      ]);

      const listLegacy: RSVP[] = [];
      legacySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        listLegacy.push({ id: doc.id, ...doc.data() } as RSVP);
      });

      const listFamily: RSVP[] = [];
      familySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        if (data.guests && Array.isArray(data.guests)) {
          data.guests.forEach((guest: any, index: number) => {
            listFamily.push(flattenFamilyGuest(doc.id, data, guest, index));
          });
        }
      });

      // Merge and Sort
      const combined = [...listLegacy, ...listFamily].sort((a, b) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeB - timeA;
      });

      setRsvps(combined);
    } catch (error) {
      console.error("Error fetching rsvps:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation(); // Stop card click
    if (window.confirm(`Sei sicuro di voler eliminare la partecipazione di ${name}?`)) {
      try {
        // Check if it's a family ID (composite)
        if (id.includes('_')) {
          const [docId, indexStr] = id.split('_');
          const index = parseInt(indexStr);
          const docRef = doc(db, "rsvps_family", docId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            const guests = data.guests || [];
            const guestToRemove = guests[index];

            if (guestToRemove) {
              // Filter out the guest to remove
              const newGuests = guests.filter((_: any, i: number) => i !== index);

              // Update counts
              const newCounts = { ...data.counts };
              const type = guestToRemove.type;

              if (type === 'adult') newCounts.adults = Math.max(0, (newCounts.adults || 0) - 1);
              else if (type === 'child_0_5') newCounts.children05 = Math.max(0, (newCounts.children05 || 0) - 1);
              else if (type === 'child_6_10') newCounts.children610 = Math.max(0, (newCounts.children610 || 0) - 1);

              if (newGuests.length === 0) {
                // Delete entire doc if no guests left
                await deleteDoc(docRef);
              } else {
                await updateDoc(docRef, {
                  guests: newGuests,
                  counts: newCounts,
                  totalPeople: newGuests.length
                });
              }
              // Refresh list to update UI
              fetchRsvps();
              if (selectedRsvp?.id === id) setSelectedRsvp(null);
            }
          }
          return;
        }

        // Legacy deletion
        await deleteDoc(doc(db, "rsvps", id));
        setRsvps(prev => prev.filter(r => r.id !== id));
        if (selectedRsvp?.id === id) setSelectedRsvp(null);
      } catch (error) {
        console.error("Error deleting document:", error);
        alert("Errore durante l'eliminazione");
      }
    }
  };

  // Generate PDF Report
  const generateReport = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.setTextColor(21, 50, 67); // Primary color
    doc.text("Wedding Guest Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    // Prepare Data for Table
    const tableData = rsvps.map(rsvp => [
      rsvp.firstName,
      rsvp.lastName,
      rsvp.intolerances || '-',
      rsvp.allergies || '-',
      rsvp.notes || '-'
    ]);

    // Generate Table
    autoTable(doc, {
      head: [['First Name', 'Last Name', 'Intolerances', 'Allergies', 'Notes']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [21, 50, 67], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        4: { cellWidth: 50 } // Limit width for Notes column
      }
    });

    // Statistics Calculation
    const intoleranceCounts: Record<string, number> = {};
    const allergyCounts: Record<string, number> = {};

    rsvps.forEach(rsvp => {
      // Intolerances
      if (rsvp.intolerances) {
        rsvp.intolerances.split(',').forEach(item => {
          const key = item.trim();
          if (key && key.toLowerCase() !== 'nessuna') {
            intoleranceCounts[key] = (intoleranceCounts[key] || 0) + 1;
          }
        });
      }
      // Allergies
      if (rsvp.allergies) {
        rsvp.allergies.split(',').forEach(item => {
          const key = item.trim();
          if (key && key.toLowerCase() !== 'nessuna') {
            allergyCounts[key] = (allergyCounts[key] || 0) + 1;
          }
        });
      }
    });

    // Calculate Age Group Counts
    let countAdults = 0;
    let countChildren05 = 0;
    let countChildren610 = 0;

    rsvps.forEach(rsvp => {
      if (!rsvp.type || rsvp.type === 'adult') {
        countAdults++;
      } else if (rsvp.type === 'child_0_5') {
        countChildren05++;
      } else if (rsvp.type === 'child_6_10') {
        countChildren610++;
      }
    });

    // Add Statistics Footer
    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    // Check if we need a new page
    if (finalY > 250) {
      doc.addPage();
      doc.text("Statistics Summary", 14, 20);
    } else {
      doc.setFontSize(14);
      doc.setTextColor(21, 50, 67);
      doc.text("Statistics Summary", 14, finalY);
    }

    let currentY = finalY > 250 ? 30 : finalY + 10;
    doc.setFontSize(11);
    doc.setTextColor(0);

    // Total Guests
    doc.setFont("helvetica", "bold");
    // Total Guests
    doc.setFont("helvetica", "bold");
    doc.text(`Total Guests: ${rsvps.length}`, 14, currentY);
    currentY += 8;

    doc.setFont("helvetica", "normal");
    doc.text(`- Adults: ${countAdults}`, 14, currentY);
    currentY += 6;
    doc.text(`- Children (0-5 years): ${countChildren05}`, 14, currentY);
    currentY += 6;
    doc.text(`- Children (6-10 years): ${countChildren610}`, 14, currentY);
    currentY += 10;

    // Intolerances Breakdown
    if (Object.keys(intoleranceCounts).length > 0) {
      doc.text("Intolerances Detail:", 14, currentY);
      currentY += 7;
      doc.setFont("helvetica", "normal");
      Object.entries(intoleranceCounts).forEach(([key, count]) => {
        doc.text(`- ${key}: ${count}`, 20, currentY);
        currentY += 6;
      });
      currentY += 5;
    }

    // Allergies Breakdown
    if (Object.keys(allergyCounts).length > 0) {
      // Check page break again
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.text("Allergies Detail:", 14, currentY);
      currentY += 7;
      doc.setFont("helvetica", "normal");
      Object.entries(allergyCounts).forEach(([key, count]) => {
        doc.text(`- ${key}: ${count}`, 20, currentY);
        currentY += 6;
      });
    }

    doc.save('report_matrimonio.pdf');
  };

  // Filter RSVPs based on search
  const filteredRsvps = rsvps.filter(rsvp =>
    searchTerm === '' ||
    rsvp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rsvp.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (!isOpen) {
      // Optional: reset auth here if desired
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1rem'
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{
              backgroundColor: 'white',
              width: '95vw',
              height: '90vh',
              borderRadius: '8px',
              padding: '2rem',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              fontFamily: 'system-ui, -apple-system, sans-serif' // Override global font
            }}
          >
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#333',
                zIndex: 10
              }}
            >
              <FaTimes />
            </button>

            {!isAuthenticated ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <h2 style={{ marginBottom: '2rem', color: 'var(--color-primary)' }}>Area Riservata</h2>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '300px' }}>
                  <input
                    type="text"
                    placeholder="Nome Utente"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={inputStyle}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={inputStyle}
                  />
                  {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}
                  <button
                    type="submit"
                    style={{
                      padding: '0.8rem',
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    Accedi
                  </button>
                </form>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <h2 style={{ color: 'var(--color-primary)', margin: 0 }}>Lista Presenze ({filteredRsvps.length})</h2>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flex: 1, justifyContent: 'flex-end', minWidth: '300px' }}>

                    {/* SEARCH INPUT */}
                    <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                      <FaSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                      <input
                        type="text"
                        placeholder="Cerca invitato..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ ...inputStyle, paddingLeft: '2.5rem', width: '100%' }}
                      />
                    </div>

                    {/* PDF REPORT BUTTON */}
                    <button
                      onClick={generateReport}
                      title="Scarica Report PDF"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#d32f2f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.8rem',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      <FaFilePdf />
                    </button>
                  </div>
                </div>

                {loading ? <p>Caricamento...</p> : (
                  <div style={{ flex: 1, overflowY: 'auto', marginTop: '1rem' }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                      gap: '1rem'
                    }}>
                      {filteredRsvps.map((rsvp) => (
                        <div
                          key={rsvp.id}
                          onClick={() => setSelectedRsvp(rsvp)}
                          style={{
                            backgroundColor: '#f8f9fa',
                            padding: '1.5rem',
                            borderRadius: '8px',
                            border: '1px solid #eee',
                            position: 'relative',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          <div style={{ paddingRight: '2rem' }}>
                            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontFamily: 'inherit' }}>
                              {rsvp.firstName} {rsvp.lastName}

                              {/* GUEST TYPE BADGE */}
                              {rsvp.type && (
                                <span style={{
                                  fontSize: '0.7rem',
                                  backgroundColor: rsvp.type === 'adult' ? '#e3f2fd' : '#fff3e0',
                                  color: rsvp.type === 'adult' ? '#1565c0' : '#ef6c00',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontWeight: 'normal',
                                  border: `1px solid ${rsvp.type === 'adult' ? '#90caf9' : '#ffcc80'}`
                                }}>
                                  {rsvp.type === 'adult' ? 'Adulto' : rsvp.type === 'child_0_5' ? 'Bambino (0-5)' : 'Bambino (6-10)'}
                                </span>
                              )}
                            </h3>
                            <div style={{ fontSize: '0.9rem', color: '#555', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <div>
                                <strong>Intolleranze:</strong> {rsvp.intolerances ? <span style={{ color: '#d32f2f' }}>{rsvp.intolerances}</span> : <span style={{ fontStyle: 'italic', opacity: 0.7 }}>Nessuna</span>}
                              </div>
                              <div>
                                <strong>Allergie:</strong> {rsvp.allergies ? <span style={{ color: '#d32f2f' }}>{rsvp.allergies}</span> : <span style={{ fontStyle: 'italic', opacity: 0.7 }}>Nessuna</span>}
                              </div>
                              <div>
                                <strong>Note:</strong>
                                {rsvp.notes ? (
                                  <p style={{
                                    margin: '0.2rem 0 0 0',
                                    fontStyle: 'italic',
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    textOverflow: 'ellipsis'
                                  }}>
                                    {rsvp.notes}
                                  </p>
                                ) : <span style={{ fontStyle: 'italic', opacity: 0.7 }}> Nessuna</span>}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={(e) => handleDelete(e, rsvp.id, rsvp.firstName)}
                            style={{
                              position: 'absolute',
                              top: '1rem',
                              right: '1rem',
                              border: 'none',
                              background: 'white',
                              color: 'red',
                              cursor: 'pointer',
                              fontSize: '1rem',
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                            title="Elimina"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* DETAIL MODAL */}
            {selectedRsvp && (
              <div
                onClick={() => setSelectedRsvp(null)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  zIndex: 2000,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '1rem'
                }}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    backgroundColor: 'white',
                    width: '100%',
                    maxWidth: '500px',
                    borderRadius: '12px',
                    padding: '2rem',
                    position: 'relative',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                  }}
                >
                  <button
                    onClick={() => setSelectedRsvp(null)}
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      background: 'none',
                      border: 'none',
                      fontSize: '1.2rem',
                      cursor: 'pointer'
                    }}
                  >
                    <FaTimes />
                  </button>

                  <h2 style={{ color: 'var(--color-primary)', borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                    {selectedRsvp.firstName} {selectedRsvp.lastName}
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', fontSize: '1rem' }}>
                    <div>
                      <strong style={{ display: 'block', color: 'var(--color-primary)', marginBottom: '0.2rem' }}>Intolleranze:</strong>
                      <div style={{ padding: '0.8rem', backgroundColor: '#f9f9f9', borderRadius: '6px', border: '1px solid #eee' }}>
                        {selectedRsvp.intolerances ? (
                          <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>{selectedRsvp.intolerances}</span>
                        ) : (
                          <span style={{ color: '#888' }}>Nessuna</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <strong style={{ display: 'block', color: 'var(--color-primary)', marginBottom: '0.2rem' }}>Allergie:</strong>
                      <div style={{ padding: '0.8rem', backgroundColor: '#f9f9f9', borderRadius: '6px', border: '1px solid #eee' }}>
                        {selectedRsvp.allergies ? (
                          <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>{selectedRsvp.allergies}</span>
                        ) : (
                          <span style={{ color: '#888' }}>Nessuna</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <strong style={{ display: 'block', color: 'var(--color-primary)', marginBottom: '0.2rem' }}>Note:</strong>
                      <div style={{ padding: '0.8rem', backgroundColor: '#fffbe6', borderRadius: '6px', border: '1px solid #ffe58f', minHeight: '60px', maxHeight: '200px', overflowY: 'auto' }}>
                        {selectedRsvp.notes ? (
                          <p style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{selectedRsvp.notes}</p>
                        ) : (
                          <span style={{ color: '#aaa', fontStyle: 'italic' }}>Nessuna nota</span>
                        )}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#999', marginTop: '1rem' }}>
                      Registrato il: {selectedRsvp.timestamp?.seconds ? new Date(selectedRsvp.timestamp.seconds * 1000).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const inputStyle = {
  padding: '0.8rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '1rem'
};

export default AdminModal;

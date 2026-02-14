import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query, deleteDoc, doc, Timestamp, QueryDocumentSnapshot, type DocumentData } from 'firebase/firestore';
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

  const fetchRsvps = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "rsvps"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const list: RSVP[] = [];
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        list.push({ id: doc.id, ...doc.data() } as RSVP);
      });
      setRsvps(list);
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
    doc.text("Report Partecipanti Matrimonio", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generato il: ${new Date().toLocaleDateString()}`, 14, 30);

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
      head: [['Nome', 'Cognome', 'Intolleranze', 'Allergie', 'Note']],
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

    // Add Statistics Footer
    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    
    // Check if we need a new page
    if (finalY > 250) {
      doc.addPage();
      doc.text("Riepilogo Statistiche", 14, 20);
    } else {
      doc.setFontSize(14);
      doc.setTextColor(21, 50, 67);
      doc.text("Riepilogo Statistiche", 14, finalY);
    }

    let currentY = finalY > 250 ? 30 : finalY + 10;
    doc.setFontSize(11);
    doc.setTextColor(0);

    // Total Guests
    doc.setFont("helvetica", "bold");
    doc.text(`Totale Ospiti: ${rsvps.length}`, 14, currentY);
    currentY += 10;

    // Intolerances Breakdown
    if (Object.keys(intoleranceCounts).length > 0) {
      doc.text("Dettaglio Intolleranze:", 14, currentY);
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
        doc.text("Dettaglio Allergie:", 14, currentY);
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
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
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
                            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary)' }}>
                              {rsvp.firstName} {rsvp.lastName}
                            </h3>
                            <div style={{ fontSize: '0.9rem', color: '#555', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <div>
                                <strong>Intolleranze:</strong> {rsvp.intolerances ? <span style={{color: '#d32f2f'}}>{rsvp.intolerances}</span> : <span style={{fontStyle: 'italic', opacity: 0.7}}>Nessuna</span>}
                              </div>
                              <div>
                                <strong>Allergie:</strong> {rsvp.allergies ? <span style={{color: '#d32f2f'}}>{rsvp.allergies}</span> : <span style={{fontStyle: 'italic', opacity: 0.7}}>Nessuna</span>}
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
                                ) : <span style={{fontStyle: 'italic', opacity: 0.7}}> Nessuna</span>}
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

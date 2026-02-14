import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

interface RSVP {
  id: string;
  firstName: string;
  lastName: string;
  intolerances: string;
  notes: string;
}

const Admin: React.FC = () => {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(false);
  const [auth, setAuth] = useState(false);
  const [pin, setPin] = useState('');

  const fetchRsvps = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "rsvps"));
      const list: RSVP[] = [];
      querySnapshot.forEach((doc: any) => {
        list.push({ id: doc.id, ...doc.data() } as RSVP);
      });
      setRsvps(list);
    } catch (error) {
      console.error("Error fetching rsvps:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth) {
      fetchRsvps();
    }
  }, [auth]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '180426') { // Simple PIN based on date
      setAuth(true);
    } else {
      alert("PIN errato");
    }
  };

  if (!auth) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2>Accesso Riservato</h2>
          <input 
            type="password" 
            placeholder="PIN" 
            value={pin} 
            onChange={e => setPin(e.target.value)}
            style={{ padding: '0.5rem', fontSize: '1rem' }}
          />
          <button type="submit" style={{ padding: '0.5rem', cursor: 'pointer' }}>Entra</button>
        </form>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h1>Lista presenze</h1>
      <p>Totale: {rsvps.length}</p>
      
      {loading ? <p>Caricamento...</p> : (
        <div style={{ overflowX: 'auto', marginTop: '2rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '1rem' }}>Nome</th>
                <th style={{ padding: '1rem' }}>Cognome</th>
                <th style={{ padding: '1rem' }}>Intolleranze</th>
                <th style={{ padding: '1rem' }}>Note</th>
              </tr>
            </thead>
            <tbody>
              {rsvps.map((rsvp) => (
                <tr key={rsvp.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '1rem' }}>{rsvp.firstName}</td>
                  <td style={{ padding: '1rem' }}>{rsvp.lastName}</td>
                  <td style={{ padding: '1rem' }}>{rsvp.intolerances || '-'}</td>
                  <td style={{ padding: '1rem' }}>{rsvp.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Admin;

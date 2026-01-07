
import { RondaRecord } from '../types';

// Simulando o Firebase Firestore para demonstração funcional imediata
// Em produção real, você importaria 'firebase/app' e 'firebase/firestore'
export const saveRecord = async (record: RondaRecord): Promise<void> => {
  console.log('Enviando para o Firebase:', record);
  
  // Simulando latência de rede
  return new Promise((resolve) => {
    setTimeout(() => {
      // Aqui seria: addDoc(collection(db, "rondas"), record);
      const storage = JSON.parse(localStorage.getItem('ronda_history') || '[]');
      storage.unshift({
        ...record,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: record.timestamp.toISOString() // Salva como string no localstorage
      });
      localStorage.setItem('ronda_history', JSON.stringify(storage.slice(0, 10)));
      resolve();
    }, 800);
  });
};

export const getLatestRecord = (): RondaRecord | null => {
  const storage = JSON.parse(localStorage.getItem('ronda_history') || '[]');
  if (storage.length === 0) return null;
  const last = storage[0];
  return {
    ...last,
    timestamp: new Date(last.timestamp)
  };
};

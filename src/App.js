import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import './App.css';

function App() {
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'it');
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('formData');
    return saved ? JSON.parse(saved) : {
      lastName: '',
      responsible: '',
      throwAttempts: ['', '', ''],
      coreStrength: '',
      enduranceTime: '',
      height: '',
      weight: '',
      waist: '',
    };
  });

  useEffect(() => {
    localStorage.setItem('formData', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const [timerRunning, setTimerRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const [coreTimerRunning, setCoreTimerRunning] = useState(false);
  const [coreStartTime, setCoreStartTime] = useState(null);
  const [coreElapsedTime, setCoreElapsedTime] = useState(0);

  const translations = {
    it: {
      title: "TFE3 - Inserimento dati",
      lastName: "👤 Cognome:",
      responsible: "👥 Responsabile:",
      throw: "💪 Getto pallone medicinale (3 tentativi):",
      core: "🧍‍♂️ Forza del tronco (sec):",
      endurance: "🏃‍♂️ Resistenza (min:sec):",
      height: "📏 Altezza (cm):",
      weight: "⚖️ Peso (kg):",
      waist: "📐 Girovita (cm):",
      export: "📄 Esporta PDF",
      select: "-- Seleziona --"
    },
    fr: {
      title: "TFE3 - Saisie des données",
      lastName: "👤 Nom:",
      responsible: "👥 Responsable:",
      throw: "💪 Lancer de balle médicale (3 tentatives):",
      core: "🧍‍♂️ Force du tronc (sec):",
      endurance: "🏃‍♂️ Endurance (min:sec):",
      height: "📏 Taille (cm):",
      weight: "⚖️ Poids (kg):",
      waist: "📐 Tour de taille (cm):",
      export: "📄 Exporter PDF",
      select: "-- Sélectionner --"
    },
    en: {
      title: "TFE3 - Data Entry",
      lastName: "👤 Last Name:",
      responsible: "👥 Responsible:",
      throw: "💪 Medicine Ball Throw (3 attempts):",
      core: "🧍‍♂️ Core Strength (sec):",
      endurance: "🏃‍♂️ Endurance (min:sec):",
      height: "📏 Height (cm):",
      weight: "⚖️ Weight (kg):",
      waist: "📐 Waist (cm):",
      export: "📄 Export PDF",
      select: "-- Select --"
    }
  };

  const t = translations[language];

  useEffect(() => {
    let interval;
    if (timerRunning) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, startTime]);

  useEffect(() => {
    let interval;
    if (coreTimerRunning) {
      interval = setInterval(() => {
        setCoreElapsedTime(Math.floor((Date.now() - coreStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [coreTimerRunning, coreStartTime]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("throwAttempt")) {
      const index = parseInt(name.replace("throwAttempt", ""));
      setFormData(prev => {
        const newAttempts = [...prev.throwAttempts];
        newAttempts[index] = value;
        return { ...prev, throwAttempts: newAttempts };
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTimerToggle = () => {
    if (!timerRunning) {
      setStartTime(Date.now());
      setElapsedTime(0);
      setTimerRunning(true);
    } else {
      setFormData(prev => ({ ...prev, enduranceTime: formatTime(elapsedTime) }));
      setTimerRunning(false);
    }
  };

  const handleCoreTimerToggle = () => {
    if (!coreTimerRunning) {
      setCoreStartTime(Date.now());
      setCoreElapsedTime(0);
      setCoreTimerRunning(true);
    } else {
      setFormData(prev => ({ ...prev, coreStrength: coreElapsedTime.toString() }));
      setCoreTimerRunning(false);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text(t.title, 10, 10);
    Object.entries(formData).forEach(([key, value], index) => {
      doc.text(`${key}: ${Array.isArray(value) ? value.join(', ') : value}`, 10, 20 + index * 8);
    });
    doc.save(`TFE3_${formData.lastName}.pdf`);
  };

  const responsibles = [
    "Corthésy", "Rupprecht", "Bertholet", "Fatton", "Gutierrez", "Christen",
    "Amez-Droz", "Vonlanthen", "Moccetti", "Vuillemin", "Borloz", "Vilela Tapado", "not defined"
  ];

  return (
    <div className="App" style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem', backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ marginBottom: '1.5rem', color: '#333' }}>{t.title}</h1>
        <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ padding: '0.5rem' }}>
          <option value="it">🇮🇹 Italiano</option>
          <option value="fr">🇫🇷 Français</option>
          <option value="en">🇬🇧 English</option>
        </select>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <label><strong>{t.lastName}</strong></label><br />
          <input name="lastName" value={formData.lastName} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }} />
        </div>

        <div>
          <label><strong>{t.responsible}</strong></label><br />
          <select value={formData.responsible} onChange={(e) => setFormData(prev => ({ ...prev, responsible: e.target.value }))} style={{ width: '100%', padding: '0.5rem' }}>
            <option value="">{t.select}</option>
            {responsibles.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label><strong>{t.throw}</strong></label><br />
          {[0, 1, 2].map(i => (
            <input
              key={i}
              name={`throwAttempt${i}`}
              value={formData.throwAttempts[i]}
              onChange={handleChange}
              type="number"
              step="0.01"
              style={{ width: '30%', padding: '0.5rem', marginRight: '1%' }}
            />
          ))}
        </div>

        <div>
          <label><strong>{t.core}</strong></label><br />
          <input value={formData.coreStrength || coreElapsedTime.toString()} readOnly style={{ width: '70%', padding: '0.5rem' }} />
          <button onClick={handleCoreTimerToggle} style={{ padding: '0.5rem 1rem', marginLeft: '1rem' }}>{coreTimerRunning ? 'Stop' : 'Start'}</button>
        </div>

        <div>
          <label><strong>{t.endurance}</strong></label><br />
          <input value={formData.enduranceTime || formatTime(elapsedTime)} readOnly style={{ width: '70%', padding: '0.5rem' }} />
          <button onClick={handleTimerToggle} style={{ padding: '0.5rem 1rem', marginLeft: '1rem' }}>{timerRunning ? 'Stop' : 'Start'}</button>
        </div>

        <div>
          <label><strong>{t.height}</strong></label><br />
          <input name="height" value={formData.height} onChange={handleChange} type="number" style={{ width: '100%', padding: '0.5rem' }} />
        </div>

        <div>
          <label><strong>{t.weight}</strong></label><br />
          <input name="weight" value={formData.weight} onChange={handleChange} type="number" style={{ width: '100%', padding: '0.5rem' }} />
        </div>

        <div>
          <label><strong>{t.waist}</strong></label><br />
          <input name="waist" value={formData.waist} onChange={handleChange} type="number" style={{ width: '100%', padding: '0.5rem' }} />
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button onClick={handleExportPDF} style={{ padding: '0.75rem 2rem', fontSize: '1rem', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px' }}>{t.export}</button>
        </div>
      </div>
    </div>
  );
}

export default App;

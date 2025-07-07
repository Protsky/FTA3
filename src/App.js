import React, { useState, useEffect } from 'react';
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

  const [coreTimerUsed, setCoreTimerUsed] = useState(false);
  const [enduranceTimerUsed, setEnduranceTimerUsed] = useState(false);

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
      export: "📄 Esporta JSON",
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
      export: "📄 Exporter JSON",
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
      export: "📄 Export JSON",
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
      if (enduranceTimerUsed) return;
      if (window.confirm('Are you sure to start the endurance timer?')) {
        setStartTime(Date.now());
        setElapsedTime(0);
        setTimerRunning(true);
      }
    } else {
      setFormData(prev => ({ ...prev, enduranceTime: formatTime(elapsedTime) }));
      setTimerRunning(false);
      setEnduranceTimerUsed(true);
    }
  };

  const handleCoreTimerToggle = () => {
    if (!coreTimerRunning) {
      if (coreTimerUsed) return;
      if (window.confirm('Are you sure to start the core strength timer?')) {
        setCoreStartTime(Date.now());
        setCoreElapsedTime(0);
        setCoreTimerRunning(true);
      }
    } else {
      setFormData(prev => ({ ...prev, coreStrength: coreElapsedTime.toString() }));
      setCoreTimerRunning(false);
      setCoreTimerUsed(true);
    }
  };

  const handleExportJSON = () => {
    const fileName = `TFE3_${formData.lastName || 'data'}.json`;
    const jsonString = JSON.stringify(formData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
  };

  const responsibles = [
    "Corthésy", "Rupprecht", "Bertholet", "Fatton", "Gutierrez", "Christen",
    "Amez-Droz", "Vonlanthen", "Moccetti", "Vuillemin", "Borloz", "Vilela Tapado", "not defined"
  ];

  return (
    <div className="App">
      <header className="header">
        <h1>{t.title}</h1>
        <select value={language} onChange={(e) => setLanguage(e.target.value)} className="language-select">
          <option value="it">🇮🇹 Italiano</option>
          <option value="fr">🇫🇷 Français</option>
          <option value="en">🇬🇧 English</option>
        </select>
      </header>

      <form className="form-grid" onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <label>{t.lastName}</label>
          <input name="lastName" value={formData.lastName} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>{t.responsible}</label>
          <select
            value={formData.responsible}
            onChange={(e) => setFormData(prev => ({ ...prev, responsible: e.target.value }))}
          >
            <option value="">{t.select}</option>
            {responsibles.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>

        <div className="form-group throw-group">
          <label>{t.throw}</label>
          <div className="throw-inputs">
            {[0, 1, 2].map(i => (
              <input
                key={i}
                name={`throwAttempt${i}`}
                value={formData.throwAttempts[i]}
                onChange={handleChange}
                type="number"
                step="0.01"
                placeholder={`#${i + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="form-group timer-group">
          <label>{t.core}</label>
          <div className="timer-control">
            <input value={formData.coreStrength || coreElapsedTime.toString()} readOnly />
            <button
              onClick={handleCoreTimerToggle}
              type="button"
              disabled={coreTimerUsed && !coreTimerRunning}
            >
              {coreTimerRunning ? 'Stop' : 'Start'}
            </button>
          </div>
        </div>

        <div className="form-group timer-group">
          <label>{t.endurance}</label>
          <div className="timer-control">
            <input value={formData.enduranceTime || formatTime(elapsedTime)} readOnly />
            <button
              onClick={handleTimerToggle}
              type="button"
              disabled={enduranceTimerUsed && !timerRunning}
            >
              {timerRunning ? 'Stop' : 'Start'}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>{t.height}</label>
          <input name="height" value={formData.height} onChange={handleChange} type="number" />
        </div>

        <div className="form-group">
          <label>{t.weight}</label>
          <input name="weight" value={formData.weight} onChange={handleChange} type="number" />
        </div>

        <div className="form-group">
          <label>{t.waist}</label>
          <input name="waist" value={formData.waist} onChange={handleChange} type="number" />
        </div>

        <div className="submit-group">
          <button onClick={handleExportJSON} type="button">{t.export}</button>
        </div>
      </form>
    </div>
  );
}

export default App;

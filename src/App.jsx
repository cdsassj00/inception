import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import RaceSimulator from './components/RaceSimulator';
import DiffusionScrubber from './components/DiffusionScrubber';
import Playground from './components/Playground';
import ArchitectureComparison from './components/ArchitectureComparison';
import ModelLineup from './components/ModelLineup';
import Footer from './components/Footer';
import LectureDeckModal from './components/LectureDeckModal';
import VercelDeployModal from './components/VercelDeployModal';
import ApiKeyModal from './components/ApiKeyModal';
import './App.css';

const DEFAULT_KEY = 'sk_1460488f4edc9f3230a7eecd506da5d7';

export default function App() {
  const [activeTab, setActiveTab] = useState('race'); // 'race' | 'scrubber' | 'playground' | 'architecture'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('STUDIO_THEME') || 'light';
  });
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('INCEPTION_API_KEY') || DEFAULT_KEY;
  });

  const [isKeynoteOpen, setIsKeynoteOpen] = useState(false);
  const [isDeployOpen, setIsDeployOpen] = useState(false);
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);

  // Sync theme with html data-theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('STUDIO_THEME', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Keyboard navigation: 1, 2, 3, 4 for tabs, P for keynote
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.key === '1') setActiveTab('race');
      if (e.key === '2') setActiveTab('scrubber');
      if (e.key === '3') setActiveTab('playground');
      if (e.key === '4') setActiveTab('architecture');
      if (e.key === 'p' || e.key === 'P') setIsKeynoteOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSaveApiKey = (newKey) => {
    setApiKey(newKey);
    localStorage.setItem('INCEPTION_API_KEY', newKey);
  };

  return (
    <div className="wb-app-shell">
      {/* Precision Command Header with 4 Studio Tabs & Theme Toggle */}
      <Header 
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenKeynote={() => setIsKeynoteOpen(true)}
        onOpenDeploy={() => setIsDeployOpen(true)}
        onOpenApiKey={() => setIsApiKeyOpen(true)}
        apiKey={apiKey}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Studio Viewport */}
      <main className="wb-main-canvas">
        {/* Compact 1-line Studio Context Banner */}
        <Hero activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Studio Stage: Only the Selected Stage is Displayed with High Focus */}
        <div className="studio-stage-container">
          {activeTab === 'race' && (
            <div className="studio-stage-tab active-stage">
              <RaceSimulator />
            </div>
          )}

          {activeTab === 'scrubber' && (
            <div className="studio-stage-tab active-stage">
              <DiffusionScrubber />
            </div>
          )}

          {activeTab === 'playground' && (
            <div className="studio-stage-tab active-stage">
              <Playground apiKey={apiKey} />
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="studio-stage-tab active-stage">
              <ArchitectureComparison />
              <div className="mt-4">
                <ModelLineup />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Compact Studio Footer */}
      <Footer onOpenDeploy={() => setIsDeployOpen(true)} />

      {/* Fullscreen Modals */}
      <LectureDeckModal 
        isOpen={isKeynoteOpen} 
        onClose={() => setIsKeynoteOpen(false)} 
      />

      <VercelDeployModal 
        isOpen={isDeployOpen} 
        onClose={() => setIsDeployOpen(false)} 
      />

      <ApiKeyModal 
        isOpen={isApiKeyOpen} 
        onClose={() => setIsApiKeyOpen(false)}
        currentKey={apiKey}
        onSaveKey={handleSaveApiKey}
      />
    </div>
  );
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface ScreenReaderContextType {
  isEnabled: boolean;
  toggleScreenReader: () => void;
  speak: (text: string) => void;
  stop: () => void;
}

const ScreenReaderContext = createContext<ScreenReaderContextType | undefined>(undefined);

export const useScreenReader = () => {
  const context = useContext(ScreenReaderContext);
  if (!context) {
    throw new Error('useScreenReader must be used within a ScreenReaderProvider');
  }
  return context;
};

interface ScreenReaderProviderProps {
  children: React.ReactNode;
}

export const ScreenReaderProvider: React.FC<ScreenReaderProviderProps> = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [speech, setSpeech] = useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Initialize speech synthesis
    const utterance = new SpeechSynthesisUtterance();
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    setSpeech(utterance);

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const toggleScreenReader = () => {
    setIsEnabled(!isEnabled);
    if (!isEnabled) {
      // Announce that screen reader is enabled
      speak('Screen reader enabled. Press Escape to disable.');
    } else {
      stop();
      // Announce that screen reader is disabled
      speak('Screen reader disabled.');
    }
  };

  const speak = (text: string) => {
    if (!isEnabled || !speech) return;
    
    window.speechSynthesis.cancel();
    speech.text = text;
    window.speechSynthesis.speak(speech);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isEnabled) {
        toggleScreenReader();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isEnabled]);

  return (
    <ScreenReaderContext.Provider value={{ isEnabled, toggleScreenReader, speak, stop }}>
      {children}
      <button
        onClick={toggleScreenReader}
        className={`fixed bottom-4 right-4 p-3 rounded-full shadow-lg transition-all duration-200 ${
          isEnabled ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
        }`}
        aria-label={isEnabled ? 'Disable screen reader' : 'Enable screen reader'}
      >
        {isEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
      </button>
    </ScreenReaderContext.Provider>
  );
}; 
import { useEffect, useRef } from 'react';
import { useScreenReader } from '../components/ui/screen-reader';

export const useAccessibility = (elementRef: React.RefObject<HTMLElement>) => {
  const { speak, isEnabled } = useScreenReader();
  const lastSpokenText = useRef<string>('');

  useEffect(() => {
    if (!isEnabled || !elementRef.current) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'characterData' || mutation.type === 'childList') {
          const text = elementRef.current?.textContent || '';
          if (text !== lastSpokenText.current) {
            lastSpokenText.current = text;
            speak(text);
          }
        }
      });
    });

    observer.observe(elementRef.current, {
      characterData: true,
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [isEnabled, elementRef, speak]);

  const announce = (text: string) => {
    if (isEnabled) {
      speak(text);
    }
  };

  return { announce };
}; 
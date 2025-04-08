import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    webgazer: any;
  }
}

interface WebGazerInitProps {
  onGazeData?: (data: { x: number; y: number; confidence: number } | null) => void;
  onFocusChange?: (isFocused: boolean) => void;
  videoContainerRef: React.RefObject<HTMLDivElement>;
}

export default function WebGazerInit({ onGazeData, onFocusChange, videoContainerRef }: WebGazerInitProps) {
  const focusCheckInterval = useRef<number>();
  const unfocusedDuration = useRef<number>(0);
  const lastGazeTime = useRef<number>(Date.now());
  
  const checkFocus = (x: number, y: number) => {
    if (!videoContainerRef.current) return false;
    
    const rect = videoContainerRef.current.getBoundingClientRect();
    const isFocused = (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    );
    
    const currentTime = Date.now();
    const timeDiff = currentTime - lastGazeTime.current;
    lastGazeTime.current = currentTime;
    
    if (!isFocused) {
      unfocusedDuration.current += timeDiff;
      if (unfocusedDuration.current >= 5000) {
        onFocusChange?.(false);
        unfocusedDuration.current = 0;
      }
    } else {
      unfocusedDuration.current = 0;
      onFocusChange?.(true);
    }
    
    return isFocused;
  };

  useEffect(() => {
    const hideWebGazerVideo = () => {
      const webgazerVideo = document.getElementById('webgazerVideoFeed');
      if (webgazerVideo) {
        webgazerVideo.style.display = 'none';
      }
      const videoCanvas = document.getElementById('webgazerVideoCanvas');
      if (videoCanvas) {
        videoCanvas.style.display = 'none';
      }
      const faceOverlay = document.querySelector('.faceFeedbackBox');
      if (faceOverlay) {
        (faceOverlay as HTMLElement).style.display = 'none';
      }
    };

    const initializeGazer = async () => {
      try {
        // Set up webgazer with minimal UI and no calibration page
        window.webgazer.params.showVideo = false;
        window.webgazer.params.showFaceOverlay = false;
        window.webgazer.params.showFaceFeedbackBox = false;
        window.webgazer.params.showVideoPreview = false;
        
        // Disable click and move listeners to prevent calibration mode
        window.webgazer.removeMouseEventListeners();
        
        // Start webgazer with some default calibration data
        await window.webgazer.begin();
        
        // Hide all WebGazer UI elements
        hideWebGazerVideo();
        
        // Set up the gaze listener
        window.webgazer.setGazeListener((data: any, elapsedTime: number) => {
          if (data == null) {
            onGazeData?.(null);
            return;
          }
          
          const gazeData = {
            x: data.x,
            y: data.y,
            confidence: data.confidence || 1
          };
          
          onGazeData?.(gazeData);
          checkFocus(data.x, data.y);
        });

        // Add a mutation observer to ensure elements stay hidden
        const observer = new MutationObserver(hideWebGazerVideo);
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });

        console.log('WebGazer initialized successfully');
      } catch (error) {
        console.error('Error initializing WebGazer:', error);
      }
    };

    // Load webgazer script
    const script = document.createElement('script');
    script.src = '/webgazer.js';
    script.async = true;
    script.onload = initializeGazer;
    document.body.appendChild(script);

    return () => {
      if (window.webgazer) {
        window.webgazer.end();
      }
      document.body.removeChild(script);
      if (focusCheckInterval.current) {
        clearInterval(focusCheckInterval.current);
      }
    };
  }, [onGazeData, onFocusChange]);

  // Add CSS to hide WebGazer elements
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      #webgazerVideoFeed, 
      #webgazerVideoCanvas, 
      .faceFeedbackBox, 
      .faceFeedbackBoxLost,
      .face_video_canvas,
      .face_overlay {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
} 
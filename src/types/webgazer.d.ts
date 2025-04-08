declare module 'webgazer' {
  interface GazeData {
    x: number;
    y: number;
    confidence: number;
  }

  interface WebGazer {
    setGazeListener(listener: (data: GazeData | null, elapsedTime: number) => void): WebGazer;
    begin(): Promise<void>;
    end(): void;
    showVideo(show: boolean): Promise<void>;
    showFaceOverlay(show: boolean): Promise<void>;
    showFaceFeedbackBox(show: boolean): Promise<void>;
    pause(): void;
    resume(): void;
    setRegression(name: string): void;
    addGazeListener(listener: (data: GazeData | null, elapsedTime: number) => void): void;
    removeGazeListener(listener: (data: GazeData | null, elapsedTime: number) => void): void;
    clearData(): void;
  }

  const webgazer: WebGazer;
  export default webgazer;
} 
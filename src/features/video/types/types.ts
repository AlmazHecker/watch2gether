export interface VideoCommand {
  type:
    | "play"
    | "pause"
    | "seek"
    | "sync-request"
    | "sync-response"
    | "video-source";
  timestamp?: number;
  currentTime?: number;
  src?: string;
}

export interface VideoPlayer {
  name: string;
  play(): Promise<void>;
  pause(): void;
  setSource(src: string): void;
  getCurrentTime(): Promise<number>;
  setCurrentTime(time: number): Promise<void>;
  addEventListener(event: string, listener: () => void): void;
  removeEventListener(event: string, listener: () => void): void;
  cleanup: () => Promise<void>;
}

import type { VideoPlayer } from "../types/types";

export class HTML5VideoPlayer implements VideoPlayer {
  private videoElement: HTMLVideoElement;

  constructor(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement;
  }

  async play(): Promise<void> {
    return this.videoElement.play();
  }

  pause(): void {
    this.videoElement.pause();
  }

  setSource(src: string): void {
    this.videoElement.src = src;
  }

  async getCurrentTime(): Promise<number> {
    return Promise.resolve(this.videoElement.currentTime);
  }

  async setCurrentTime(time: number): Promise<void> {
    this.videoElement.currentTime = time;
    return Promise.resolve();
  }

  addEventListener(event: string, listener: () => void): void {
    this.videoElement.addEventListener(event, listener);
  }

  removeEventListener(event: string, listener: () => void): void {
    this.videoElement.removeEventListener(event, listener);
  }
}

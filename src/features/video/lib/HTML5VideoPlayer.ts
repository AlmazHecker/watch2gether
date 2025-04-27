import type { VideoPlayer } from "../types/types";

type ListenerEntry = {
  event: string;
  listener: EventListenerOrEventListenerObject;
};

export class HTML5VideoPlayer implements VideoPlayer {
  public name = "html5-player";
  private videoElement: HTMLVideoElement;
  private listeners: ListenerEntry[] = [];

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

  addEventListener(
    event: string,
    listener: EventListenerOrEventListenerObject
  ): void {
    this.videoElement.addEventListener(event, listener);
    this.listeners.push({ event, listener });
  }

  removeEventListener(
    event: string,
    listener: EventListenerOrEventListenerObject
  ): void {
    this.videoElement.removeEventListener(event, listener);
    this.listeners = this.listeners.filter(
      entry => !(entry.event === event && entry.listener === listener)
    );
  }

  async cleanup() {
    this.pause();

    for (const { event, listener } of this.listeners) {
      this.videoElement.removeEventListener(event, listener);
    }
    this.listeners = [];

    this.videoElement.src = "";
    this.videoElement.load();
  }
}

import type { VideoPlayer } from "../types/types";

export class YouTubeVideoPlayer implements VideoPlayer {
  public name = "yt-player";
  private player: YT.Player | null = null;
  private isReady: boolean = false;
  private pendingEvents: Map<string, (() => void)[]> = new Map();
  private videoId: string | null = null;
  private readyPromise: Promise<void>;

  constructor(container: HTMLElement) {
    this.readyPromise = new Promise<void>(resolve => {
      if (!window.YT) this.setupYTApi();

      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (previousCallback) previousCallback();

        // The issue is here.
        this.player = new YT.Player(container, {
          height: "100%",
          width: "100%",
          videoId: this.videoId || "",
          events: {
            onReady: () => {
              this.isReady = true;
              this.processPendingEvents();
              resolve();
            },
            onError: e => {
              console.log(e);
            },
          },
        });
      };

      if (window.YT && window.YT.Player) {
        window.onYouTubeIframeAPIReady();
      }
    });
  }

  private setupYTApi() {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
  }

  private processPendingEvents(): void {
    this.pendingEvents.forEach((listeners, event) => {
      listeners.forEach(listener => {
        this.addEventListener(event, listener);
      });
    });
    this.pendingEvents.clear();
  }

  async play(): Promise<void> {
    await this.readyPromise;
    this.player?.playVideo();
  }

  async pause(): Promise<void> {
    await this.readyPromise;
    this.player?.pauseVideo();
  }

  async setSource(src: string): Promise<void> {
    await this.readyPromise;

    const videoId = this.extractVideoId(src);
    this.videoId = videoId;

    if (this.isReady && videoId && this.player) {
      this.player.loadVideoById(videoId);
    }
  }

  async getCurrentTime(): Promise<number> {
    await this.readyPromise;
    return this.player?.getCurrentTime() || 0;
  }

  async setCurrentTime(time: number): Promise<void> {
    await this.readyPromise;
    this.player?.seekTo(time, true);
    return Promise.resolve();
  }

  addEventListener(event: string, listener: () => void): void {
    if (this.isReady && this.player) {
      const wrappedListener = (e: YT.OnStateChangeEvent) => {
        if (event === "play" && e.data === YT.PlayerState.PLAYING) {
          listener();
        } else if (event === "pause" && e.data === YT.PlayerState.PAUSED) {
          listener();
        }
      };

      this.player.addEventListener("onStateChange", wrappedListener);
    } else {
      if (!this.pendingEvents.has(event)) {
        this.pendingEvents.set(event, []);
      }
      this.pendingEvents.get(event)?.push(listener);
    }
  }

  removeEventListener(): void {
    // YT API doesn't have removeEventListener method
  }

  private extractVideoId(url: string): string | null {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }

  async cleanup(): Promise<void> {
    // TODO....
    // await this.readyPromise;
    // if (this.player) {
    //   this.player.destroy();
    //   this.player = null;
    // }
    // // this.container.remove();
    // this.pendingEvents.clear();
    // this.videoId = null;
    // this.isReady = false;
  }
}

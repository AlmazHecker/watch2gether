import type { VideoPlayer } from "../types/types";

export class YouTubeVideoPlayer implements VideoPlayer {
  private player: YT.Player | null = null;
  private isReady: boolean = false;
  private pendingEvents: Map<string, (() => void)[]> = new Map();
  private videoId: string | null = null;
  private readyPromise: Promise<void>;

  constructor(containerId: string) {
    this.readyPromise = new Promise<void>(resolve => {
      if (!window.YT) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (previousCallback) previousCallback();

        this.player = new YT.Player(containerId, {
          height: "100%",
          width: "100%",
          videoId: this.videoId || "",
          events: {
            onReady: () => {
              this.isReady = true;
              this.processPendingEvents();
              resolve();
            },
          },
        });
      };

      if (window.YT && window.YT.Player) {
        window.onYouTubeIframeAPIReady();
      }
    });
  }

  private processPendingEvents(): void {
    this.pendingEvents.forEach((listeners, event) => {
      listeners.forEach(listener => {
        if (event === "play") {
          this.player?.addEventListener("onStateChange", e => {
            if (e.data === YT.PlayerState.PLAYING) {
              listener();
            }
          });
        } else if (event === "pause") {
          this.player?.addEventListener("onStateChange", e => {
            if (e.data === YT.PlayerState.PAUSED) {
              listener();
            }
          });
        }
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
      if (event === "play") {
        this.player.addEventListener("onStateChange", e => {
          if (e.data === YT.PlayerState.PLAYING) {
            listener();
          }
        });
      } else if (event === "pause") {
        this.player.addEventListener("onStateChange", e => {
          if (e.data === YT.PlayerState.PAUSED) {
            listener();
          }
        });
      }
    } else {
      if (!this.pendingEvents.has(event)) {
        this.pendingEvents.set(event, []);
      }
      this.pendingEvents.get(event)?.push(listener);
    }
  }

  removeEventListener(event: string, listener: () => void): void {
    this.player?.removeEventListener(event as keyof YT.Events, listener);
  }

  private extractVideoId(url: string): string | null {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }
}

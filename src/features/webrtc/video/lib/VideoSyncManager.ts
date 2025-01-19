import type { VideoCommand } from "../types/types";

export class VideoSyncManager {
  private videoPlayer: HTMLVideoElement;
  private syncChannel: RTCDataChannel;
  private suppressEvents: boolean = false;

  constructor(videoPlayer: HTMLVideoElement, syncChannel: RTCDataChannel) {
    this.videoPlayer = videoPlayer;
    this.syncChannel = syncChannel;
    this.setupVideoSync();
  }

  private setupVideoSync() {
    this.videoPlayer.src = "./fedor.mp4";

    this.videoPlayer.addEventListener("play", () => {
      if (!this.suppressEvents) {
        this.sendVideoCommand({
          type: "play",
          currentTime: this.videoPlayer.currentTime,
        });
      }
    });

    this.videoPlayer.addEventListener("pause", () => {
      if (!this.suppressEvents) {
        this.sendVideoCommand({
          type: "pause",
          currentTime: this.videoPlayer.currentTime,
        });
      }
    });

    this.syncChannel.onmessage = async (event) => {
      const command = JSON.parse(event.data);
      await this.handleSyncCommand(command);
    };

    this.startPeriodicSync();
  }

  private async handleSyncCommand(command: VideoCommand) {
    switch (command.type) {
      case "play":
        if (
          Math.abs(this.videoPlayer.currentTime - (command.currentTime || 0)) >
          0.5
        ) {
          this.videoPlayer.currentTime = command.currentTime || 0;
        }
        this.suppressEvents = true;
        await this.videoPlayer.play();
        this.suppressEvents = false;
        break;

      case "pause":
        this.suppressEvents = true;
        this.videoPlayer.pause();
        if (command.currentTime) {
          this.videoPlayer.currentTime = command.currentTime;
        }
        this.suppressEvents = false;
        break;

      case "seek":
        if (command.currentTime !== undefined) {
          this.suppressEvents = true;
          this.videoPlayer.currentTime = command.currentTime;
          this.suppressEvents = false;
        }
        break;

      case "sync-request":
        this.sendVideoCommand({
          type: "sync-response",
          currentTime: this.videoPlayer.currentTime,
          timestamp: Date.now(),
        });
        break;

      case "sync-response":
        this.handleSyncResponse(command);
        break;
    }
  }

  private sendVideoCommand(command: VideoCommand) {
    if (this.syncChannel.readyState === "open") {
      this.syncChannel.send(JSON.stringify(command));
    }
  }

  private handleSyncResponse(command: VideoCommand) {
    if (command.currentTime === undefined || command.timestamp === undefined)
      return;

    const latency = (Date.now() - command.timestamp) / 2;
    const estimatedCurrentTime = command.currentTime + latency / 1000;

    if (Math.abs(this.videoPlayer.currentTime - estimatedCurrentTime) > 0.5) {
      this.videoPlayer.currentTime = estimatedCurrentTime;
    }
  }

  private startPeriodicSync() {
    setInterval(() => {
      if (this.syncChannel.readyState === "open") {
        this.sendVideoCommand({ type: "sync-request", timestamp: Date.now() });
      }
    }, 5000);
  }
}

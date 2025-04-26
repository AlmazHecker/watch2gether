import type { VideoCommand, VideoPlayer } from "../types/types";

export class VideoSyncManager {
  private videoPlayer: VideoPlayer;
  private syncChannel: RTCDataChannel;
  private suppressEvents: boolean = false;

  constructor(videoPlayer: VideoPlayer, syncChannel: RTCDataChannel) {
    this.videoPlayer = videoPlayer;
    this.syncChannel = syncChannel;
  }

  public setVideoSource = (videoSource: string) => {
    this.sendVideoCommand({ type: "video-source", src: videoSource });
    this.setupListeners(videoSource);
  };

  public setupListeners(src?: string) {
    if (src) this.videoPlayer.setSource(src);

    this.videoPlayer.addEventListener("play", async () => {
      if (!this.suppressEvents) {
        const currentTime = await this.videoPlayer.getCurrentTime();
        this.sendVideoCommand({ type: "play", currentTime: currentTime });
      }
    });

    this.videoPlayer.addEventListener("pause", async () => {
      if (!this.suppressEvents) {
        const currentTime = await this.videoPlayer.getCurrentTime();
        this.sendVideoCommand({ type: "pause", currentTime: currentTime });
      }
    });

    this.syncChannel.onmessage = async event => {
      const message = JSON.parse(event.data);
      await this.handleSyncCommand(message);
    };

    this.startPeriodicSync();
  }

  private async handleSyncCommand(command: VideoCommand) {
    switch (command.type) {
      case "video-source":
        this.videoPlayer.setSource(command.src as string);
        break;
      case "play": {
        const currentTime = await this.videoPlayer.getCurrentTime();
        if (Math.abs(currentTime - (command.currentTime || 0)) > 0.5) {
          await this.videoPlayer.setCurrentTime(command.currentTime || 0);
        }
        this.suppressEvents = true;
        await this.videoPlayer.play();
        this.suppressEvents = false;
        break;
      }
      case "pause":
        this.suppressEvents = true;
        this.videoPlayer.pause();
        if (command.currentTime !== undefined) {
          await this.videoPlayer.setCurrentTime(command.currentTime);
        }
        this.suppressEvents = false;
        break;

      case "seek":
        if (command.currentTime !== undefined) {
          this.suppressEvents = true;
          await this.videoPlayer.setCurrentTime(command.currentTime);
          this.suppressEvents = false;
        }
        break;

      case "sync-request": {
        const currentTime = await this.videoPlayer.getCurrentTime();
        this.sendVideoCommand({
          type: "sync-response",
          currentTime: currentTime,
          timestamp: Date.now(),
        });
        break;
      }
      case "sync-response":
        await this.handleSyncResponse(command);
        break;
    }
  }

  private sendVideoCommand(command: VideoCommand) {
    if (this.syncChannel.readyState === "open") {
      this.syncChannel.send(JSON.stringify(command));
    }
  }

  private async handleSyncResponse(command: VideoCommand) {
    if (command.currentTime === undefined || command.timestamp === undefined)
      return;

    const latency = (Date.now() - command.timestamp) / 2;
    const estimatedCurrentTime = command.currentTime + latency / 1000;
    const currentTime = await this.videoPlayer.getCurrentTime();

    if (Math.abs(currentTime - estimatedCurrentTime) > 0.5) {
      await this.videoPlayer.setCurrentTime(estimatedCurrentTime);
    }
  }

  private startPeriodicSync() {
    setInterval(async () => {
      if (this.syncChannel.readyState === "open") {
        this.sendVideoCommand({ type: "sync-request", timestamp: Date.now() });
      }
    }, 5000);
  }
}

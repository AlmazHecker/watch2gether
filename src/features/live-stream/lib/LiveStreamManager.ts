import type { LiveStreamCommand } from "@/features/live-stream/types/types.ts";
import { updateStatus } from "@/features/logging/lib.ts";

export class LiveStreamManager {
  private localStream: MediaStream | null = null;

  constructor(
    private readonly streamChannel: RTCDataChannel,
    private readonly pc: RTCPeerConnection,
    private remoteVideoElement: HTMLVideoElement,
    private localVideoElement: HTMLVideoElement
  ) {}

  public async startStream() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Add tracks and store senders
      this.localStream.getTracks().forEach(track => {
        console.log("Adding track to peer connection");
        this.pc.addTrack(track, this.localStream as MediaStream);
      });

      await this.renegotiateConnection();

      this.localVideoElement.srcObject = this.localStream;
      await this.localVideoElement.play();
      this.sendStreamCommand({ type: "start-stream" });
    } catch (err) {
      updateStatus(`Failed to start stream: ${err}`);
    }
  }

  private async renegotiateConnection() {
    try {
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      this.sendStreamCommand({
        type: "renegotiate",
        sdp: this.pc.localDescription as RTCSessionDescription,
      });
    } catch (error) {
      updateStatus(`Error during renegotiation: ${error}`);
      throw error;
    }
  }

  public async stopStream() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
        const sender = this.pc.getSenders().find(s => s.track === track);
        if (sender) {
          this.pc.removeTrack(sender);
        }
      });

      await this.renegotiateConnection();

      this.localStream = null;
      this.localVideoElement.srcObject = null;
      this.sendStreamCommand({ type: "stop-stream" });
    }
  }

  public setupDataChannel() {
    this.streamChannel.onmessage = async event => {
      const command = JSON.parse(event.data);
      await this.handleStreamCommand(command);
    };

    this.pc.ontrack = event => {
      const [stream] = event.streams;
      this.remoteVideoElement.srcObject = stream;
      this.remoteVideoElement.play().catch(console.error);
    };
  }

  private async handleStreamCommand(command: LiveStreamCommand) {
    switch (command.type) {
      case "start-stream":
        console.log("Remote started streaming.");
        break;

      case "stop-stream":
        console.log("Remote stopped streaming.");
        this.remoteVideoElement.srcObject = null;
        break;

      case "renegotiate":
        if (!command.sdp) return updateStatus(`No SDP found!`);
        try {
          await this.pc.setRemoteDescription(command.sdp);

          if (command.sdp.type === "offer") {
            const answer = await this.pc.createAnswer();
            await this.pc.setLocalDescription(answer);
            this.sendStreamCommand({
              type: "renegotiate",
              sdp: this.pc.localDescription as RTCSessionDescription,
            });
          }
        } catch (error) {
          console.error("Error handling renegotiation:", error);
        }

        break;

      default:
        console.warn("Unknown command received:", command);
    }
  }

  private sendStreamCommand(command: LiveStreamCommand) {
    if (this.streamChannel.readyState === "open") {
      this.streamChannel.send(JSON.stringify(command));
    }
  }
}

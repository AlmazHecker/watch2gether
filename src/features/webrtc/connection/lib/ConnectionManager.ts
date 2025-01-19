import type { WebRTCElements } from "../types/types";

export class ConnectionManager {
  constructor(
    private readonly pc: RTCPeerConnection,
    private readonly elements: WebRTCElements
  ) {
    this.setupHandlers();
  }

  private setupHandlers() {
    this.setupConnectionStateHandlers();
    this.setupOfferAnswerHandlers();
  }

  private setupConnectionStateHandlers() {
    const handleChange = () => {
      const connectionState = this.pc.connectionState;
      const iceState = this.pc.iceConnectionState;

      const getStatusColor = (
        state: RTCPeerConnectionState | RTCIceConnectionState
      ) => {
        switch (state) {
          case "connected":
            return "text-green-600";
          case "disconnected":
            return "text-red-600";
          case "connecting":
            return "text-yellow-600";
          default:
            return "text-gray-600";
        }
      };

      const stat = `
          <span class="font-semibold">Connection State:</span> 
          <span class="${getStatusColor(connectionState)}">${connectionState}</span> 
          <span class="font-semibold ml-4">ICE Connection State:</span> 
          <span class="${getStatusColor(iceState)}">${iceState}</span>
        `;

      document.getElementById("stat")!.innerHTML = stat;
    };

    this.pc.onconnectionstatechange = handleChange;
    this.pc.oniceconnectionstatechange = handleChange;
    handleChange();
  }

  private setupOfferAnswerHandlers() {
    this.elements.offer.onkeydown = async (e) => {
      if (e.key !== "Enter" || this.pc.signalingState !== "stable") return;
      this.elements.button.disabled = this.elements.offer.disabled = true;

      await this.pc.setRemoteDescription({
        type: "offer",
        sdp: this.elements.offer.value.endsWith("\n")
          ? this.elements.offer.value
          : `${this.elements.offer.value}\n`,
      });

      await this.pc.setLocalDescription(await this.pc.createAnswer());

      this.pc.onicecandidate = () => {
        this.elements.answer.focus();
        this.elements.answer.value = this.pc?.localDescription?.sdp as string;
        this.elements.answer.select();
      };
    };

    this.elements.answer.onkeydown = (e) => {
      if (e.key !== "Enter" || this.pc.signalingState !== "have-local-offer")
        return;
      this.elements.answer.disabled = true;
      this.pc.setRemoteDescription({
        type: "answer",
        sdp: this.elements.answer.value.endsWith("\n")
          ? this.elements.answer.value
          : `${this.elements.answer.value}\n`,
      });
    };
  }

  async createOffer() {
    this.elements.button.disabled = true;
    this.elements.button.classList.add("opacity-50", "cursor-not-allowed");
    await this.pc.setLocalDescription(await this.pc.createOffer());

    this.pc.onicecandidate = () => {
      this.elements.offer.value = this.pc?.localDescription?.sdp as string;
      this.elements.offer.select();
      this.elements.answer.placeholder =
        "Paste answer here. Press Enter to proceed.";
    };
  }
}

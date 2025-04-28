import type { Signal } from "../types/types";

export abstract class BaseConnectionManager {
  protected sdp?: RTCSessionDescriptionInit;
  // protected offer?: RTCSessionDescriptionInit;
  // protected answer?: RTCSessionDescriptionInit;

  protected sessionId: string | null = null;
  protected pollingInterval: number | null = null;
  protected processedCandidates = new Set<string>();

  constructor(protected readonly pc: RTCPeerConnection) {}

  protected setupIceCandidateHandler() {
    this.pc.onicecandidate = async event => {
      if (!this.sessionId) return;

      if (event.candidate) {
        console.log("Sending ICE candidate:", event.candidate);

        const body = {
          sessionId: this.sessionId,
          type: "set",
          candidate: event.candidate,
          sdp: this.sdp,
        };

        try {
          await fetch("/signaling", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
        } catch (err) {
          console.error("Error sending ICE candidate:", err);
        }
      } else {
        console.log("All ICE candidates have been generated");
      }
    };

    this.pc.addEventListener("icegatheringstatechange", () => {
      if (this.pc.iceGatheringState === "complete") {
        this.cleanup();
      }
    });
  }

  protected startPolling(onData: (data: Signal) => Promise<void>) {
    if (this.pollingInterval) {
      window.clearInterval(this.pollingInterval);
    }

    this.pollingInterval = window.setInterval(async () => {
      if (!this.sessionId) return;

      try {
        const res = await fetch(`/signaling`, {
          method: "POST",
          body: JSON.stringify({ type: "source", sessionId: this.sessionId }),
        });
        if (!res.ok) {
          console.error("Error polling signaling server:", res.status);
          return;
        }

        const data = await res.json();
        await onData(data);
      } catch (err) {
        console.error("Error polling for updates:", err);
      }
    }, 3000);
  }

  cleanup() {
    if (this.pollingInterval) {
      window.clearInterval(this.pollingInterval);
    }
  }

  protected async addCandidates(candidates: Signal["candidates"]) {
    for (const candidate of candidates) {
      const candidateStr = JSON.stringify(candidate);
      if (this.processedCandidates.has(candidateStr)) continue;

      if (candidate?.candidate) {
        try {
          console.log("Adding remote ICE candidate:", candidate);
          await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
          this.processedCandidates.add(candidateStr);
        } catch (err) {
          console.error("Failed to add ICE candidate:", err);
        }
      }
    }
  }
}

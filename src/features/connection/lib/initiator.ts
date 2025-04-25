import { updateStatus } from "@/features/logging/lib";

const createOfferBtn = document.getElementById(
  "createOfferBtn"
) as HTMLButtonElement;

export class InitiatorManager {
  private sessionId: string | null = null;
  private pollingInterval: number | null = null;
  private processedCandidates = new Set<string>();

  constructor(private readonly pc: RTCPeerConnection) {}

  async setupListeners() {
    // Creator flow
    createOfferBtn.addEventListener("click", async () => {
      this.sessionId = crypto.randomUUID();
      updateStatus(`Created session ID: ${this.sessionId}`);

      try {
        // Setup ICE candidate handling *before* creating the offer
        this.pc.onicecandidate = async event => {
          if (!this.sessionId) return;

          if (event.candidate) {
            // Send each candidate as it's generated
            // const candidateJson = JSON.stringify(event.candidate);
            console.log("Sending ICE candidate:", event.candidate);

            const body = {
              sessionId: this.sessionId,
              type: "candidate",
              candidate: event.candidate,
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

        // Create and set local description
        const offer = await this.pc.createOffer();
        await this.pc.setLocalDescription(offer);
        createOfferBtn.disabled = true;

        // Send offer to signaling server
        const body = {
          sessionId: this.sessionId,
          type: "offer",
          sdp: this.pc.localDescription,
        };

        await fetch("/signaling", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        updateStatus(
          `Offer created! Share the offer and session ID: ${this.sessionId}`
        );

        navigator.clipboard.writeText(this.sessionId);
        alert("Session copied to clipboard!");
        // Start polling for the answer and remote ICE candidates
        this.startPolling();
      } catch (err) {
        updateStatus("Error creating offer: " + err);
      }
    });
  }

  private startPolling() {
    if (this.pollingInterval) {
      window.clearInterval(this.pollingInterval);
    }

    this.pollingInterval = window.setInterval(async () => {
      if (!this.sessionId) return;

      try {
        const res = await fetch(`/signaling?sessionId=${this.sessionId}`);
        if (!res.ok) {
          console.error("Error polling signaling server:", res.status);
          return;
        }

        const data = await res.json();

        // Process answer if available and not already processed
        if (data.answer && !this.pc.remoteDescription) {
          console.log("Received answer:", data.answer);
          await this.pc.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          );
          updateStatus("Received answer, connection establishing...");
        }

        // Process any ICE candidates
        if (data.candidates && Array.isArray(data.candidates)) {
          for (const candidate of data.candidates) {
            // Skip if we've already processed this candidate
            const candidateStr = JSON.stringify(candidate);
            if (this.processedCandidates.has(candidateStr)) continue;

            // Add candidate if it's valid
            if (candidate && candidate.candidate) {
              try {
                console.log("Adding remote ICE candidate:", candidate);
                await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
                // Mark as processed
                this.processedCandidates.add(candidateStr);
              } catch (err) {
                console.error("Failed to add ICE candidate:", err);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error polling for updates:", err);
      }
    }, 1000); // Poll every second for lower latency
  }

  cleanup() {
    if (this.pollingInterval) {
      window.clearInterval(this.pollingInterval);
    }
  }
}

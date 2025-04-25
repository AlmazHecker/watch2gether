import { updateStatus } from "@/features/logging/lib";

const createOfferBtn = document.getElementById(
  "createOfferBtn"
) as HTMLButtonElement;
const offerOutput = document.getElementById(
  "offerOutput"
) as HTMLTextAreaElement;
const connectBtn = document.getElementById("connectBtn")!;
const answerInput = document.getElementById(
  "answerInput"
)! as HTMLTextAreaElement;

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
            const candidateJson = JSON.stringify(event.candidate);
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

        // Show the offer and session ID for easy sharing
        offerOutput.value = JSON.stringify({
          sessionId: this.sessionId,
          offer: this.pc.localDescription,
        });
        offerOutput.select();
        updateStatus(
          `Offer created! Share the offer and session ID: ${this.sessionId}`
        );

        // Start polling for the answer and remote ICE candidates
        this.startPolling();
      } catch (err) {
        updateStatus("Error creating offer: " + err);
      }
    });

    // Connect with answer
    connectBtn.addEventListener("click", async () => {
      try {
        const answerData = JSON.parse(answerInput.value);
        if (answerData.sessionId) {
          this.sessionId = answerData.sessionId;
        }
        await this.pc.setRemoteDescription(
          new RTCSessionDescription(answerData.answer || answerData)
        );
        updateStatus("Connected with answer! Establishing connection...");
      } catch (err) {
        updateStatus("Error processing answer: " + err);
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

            // Mark as processed
            this.processedCandidates.add(candidateStr);

            // Add candidate if it's valid
            if (candidate && candidate.candidate) {
              try {
                console.log("Adding remote ICE candidate:", candidate);
                await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
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

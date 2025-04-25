import { updateStatus } from "@/features/logging/lib";

const joinChatBtn = document.getElementById("joinChatBtn") as HTMLButtonElement;
const sessionIdInput = document.getElementById(
  "sessionIdInput"
)! as HTMLInputElement;

export class JoinerManager {
  private sessionId: string | null = null;
  private pollingInterval: number | null = null;
  private processedCandidates = new Set<string>();

  constructor(private readonly pc: RTCPeerConnection) {}

  public setupListeners() {
    // Joiner flow
    joinChatBtn.addEventListener("click", async () => {
      try {
        let offerData;

        this.sessionId = sessionIdInput.value.trim();

        if (!this.sessionId) {
          alert("No session id provided :(");
        }

        if (!this.sessionId) {
          updateStatus("Please enter a valid session ID");
          return;
        }

        joinChatBtn.disabled = true;
        updateStatus(`Connecting to session: ${this.sessionId}`);

        // Setup ICE candidate handling
        this.pc.onicecandidate = async event => {
          if (!this.sessionId) return;

          if (event.candidate) {
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

        // Fetch or use the offer
        let offer;
        if (offerData && offerData.offer) {
          offer = offerData.offer;
        } else if (offerData && offerData.type === "offer") {
          offer = offerData;
        } else {
          // Fetch the offer from the signaling server
          const response = await fetch(
            `/signaling?sessionId=${this.sessionId}`
          );
          if (!response.ok) {
            throw new Error(
              `Server returned ${response.status}: ${response.statusText}`
            );
          }

          const data = await response.json();
          if (!data.offer) {
            throw new Error("No offer found for this session ID");
          }

          offer = data.offer;
        }

        // Set remote description (the offer)
        console.log("Setting remote description (offer):", offer);
        await this.pc.setRemoteDescription(new RTCSessionDescription(offer));

        // Create and set local description (the answer)
        const answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);

        // Send answer to the server
        const body = {
          sessionId: this.sessionId,
          type: "answer",
          sdp: this.pc.localDescription,
        };

        await fetch("/signaling", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        updateStatus("Answer created! Connection establishing...");

        // Start polling for ICE candidates
        this.startPolling();
      } catch (err) {
        updateStatus("Error joining chat: " + err);
        joinChatBtn.disabled = false;
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
    }, 1000);
  }

  cleanup() {
    if (this.pollingInterval) {
      window.clearInterval(this.pollingInterval);
    }
  }
}

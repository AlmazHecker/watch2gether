import { BaseConnectionManager } from "./baseConnectionManager";

import { updateStatus } from "@/features/logging/lib";

const createOfferBtn = document.getElementById(
  "createOfferBtn"
) as HTMLButtonElement;

export class InitiatorManager extends BaseConnectionManager {
  async setupListeners() {
    createOfferBtn.addEventListener("click", async () => {
      this.sessionId = crypto.randomUUID();
      let timeLeft = 30;

      try {
        this.setupIceCandidateHandler();

        this.offer = await this.pc.createOffer();
        await this.pc.setLocalDescription(this.offer);
        createOfferBtn.disabled = true;

        await fetch("/signaling", {
          method: "POST",
          body: JSON.stringify({
            sessionId: this.sessionId,
            type: "offer",
            sdp: this.pc.localDescription,
          }),
        });

        // Set up countdown timer
        const timer = setInterval(() => {
          timeLeft--;
          updateStatus(
            `
            Session created! Share the sessionID: ${this.sessionId}\n
            SessionID is available for ${timeLeft} seconds`
          );

          if (timeLeft <= 0) {
            clearInterval(timer);
            createOfferBtn.disabled = false;
          }
        }, 1000);

        await navigator.clipboard.writeText(this.sessionId);
        alert("Session copied to clipboard!");

        this.startPolling(async data => {
          if (data.answer && !this.pc.remoteDescription) {
            clearInterval(timer);
            console.log("Received answer:", data.answer);
            await this.pc.setRemoteDescription(
              new RTCSessionDescription(data.answer)
            );
            updateStatus("Received answer, connection establishing...");
          }

          if (data.candidates) {
            await this.addCandidates(data.candidates);
          }
        });
      } catch (err) {
        updateStatus("Error creating offer: " + err);
        createOfferBtn.disabled = false;
      }
    });
  }
}

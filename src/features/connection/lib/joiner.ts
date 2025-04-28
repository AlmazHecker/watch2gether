import { updateStatus } from "@/features/logging/lib";
import { BaseConnectionManager } from "./baseConnectionManager";

const joinChatBtn = document.getElementById("joinChatBtn") as HTMLButtonElement;
const sessionIdInput = document.getElementById(
  "sessionIdInput"
)! as HTMLInputElement;

export class JoinerManager extends BaseConnectionManager {
  constructor(protected readonly pc: RTCPeerConnection) {
    super(pc);
  }

  setupListeners() {
    joinChatBtn.addEventListener("click", async () => {
      try {
        this.sessionId = sessionIdInput.value.trim();

        if (!this.sessionId) {
          alert("No session id provided :(");
          updateStatus("Please enter a valid session ID");
          return;
        }

        joinChatBtn.disabled = true;
        updateStatus(`Connecting to session: ${this.sessionId}`);

        const response = await fetch(`/signaling`, {
          method: "POST",
          body: JSON.stringify({ type: "source", sessionId: this.sessionId }),
        });

        if (!response.ok) {
          throw new Error(
            `Server returned ${response.status}: ${response.statusText}`
          );
        }

        const data = await response.json();
        if (!data.offer) {
          throw new Error("No offer found for this session ID");
        }

        const offer = data.offer;

        console.log("Setting remote description (offer):", offer);
        await this.pc.setRemoteDescription(new RTCSessionDescription(offer));

        const answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);

        await fetch("/signaling", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: this.sessionId,
            type: "answer",
            sdp: this.pc.localDescription,
          }),
        });

        updateStatus("Answer created! Connection establishing...");

        this.setupIceCandidateHandler();

        this.startPolling(async data => {
          if (data.candidates) {
            await this.addCandidates(data.candidates);
          }
        });
      } catch (err) {
        updateStatus("Error joining chat: " + err);
        joinChatBtn.disabled = false;
      }
    });
  }
}

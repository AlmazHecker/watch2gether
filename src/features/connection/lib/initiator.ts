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
  constructor(private readonly pc: RTCPeerConnection) {}
  setupListeners() {
    // Creator flow
    createOfferBtn.addEventListener("click", async () => {
      try {
        await this.pc.setLocalDescription(await this.pc.createOffer());
        createOfferBtn.disabled = true;

        this.pc.onicecandidate = async event => {
          if (!event.candidate) {
            // Now we have ALL candidates
            offerOutput.value = JSON.stringify(this.pc.localDescription);
            offerOutput.select();
            updateStatus("Offer created! Share it with the other person.");
          }
        };
      } catch (err) {
        updateStatus("Error creating offer: " + err);
      }
    });

    // Connect with answer
    connectBtn.addEventListener("click", async () => {
      try {
        const answer = JSON.parse(answerInput.value);
        await this.pc.setRemoteDescription(answer);
        updateStatus("Connected! You can now chat.");
      } catch (err) {
        updateStatus("Error processing answer: " + err);
      }
    });
  }
}

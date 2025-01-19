import { updateStatus } from "@/features/logging/lib";
import { INITIATOR_SELECTORS } from "../model";

const createOfferBtn = document.getElementById(
  INITIATOR_SELECTORS.CREATE_OFFER_BTN
) as HTMLButtonElement;
const offerOutput = document.getElementById(
  INITIATOR_SELECTORS.OFFER_OUTPUT
) as HTMLTextAreaElement;
const connectBtn = document.getElementById(INITIATOR_SELECTORS.CONNECT_BTN)!;
const answerInput = document.getElementById(
  INITIATOR_SELECTORS.ANSWER_INPUT
)! as HTMLTextAreaElement;

export class InitiatorManager {
  constructor(private readonly pc: RTCPeerConnection) {}
  setupListeners() {
    // Creator flow
    createOfferBtn.addEventListener("click", async () => {
      try {
        await this.pc.setLocalDescription(await this.pc.createOffer());
        createOfferBtn.disabled = true;

        this.pc.onicecandidate = async (event) => {
          offerOutput.value = JSON.stringify(this.pc.localDescription);
          offerOutput.select();
          updateStatus("Offer created! Share it with the other person.");
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

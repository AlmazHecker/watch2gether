import { updateStatus } from "@/features/logging/lib";

// Joiner related
const joinChatBtn = document.getElementById("joinChatBtn")!;
const offerInput = document.getElementById(
  "offerInput"
)! as HTMLTextAreaElement;
const answerOutput = document.getElementById(
  "answerOutput"
) as HTMLTextAreaElement;

export class JoinerManager {
  constructor(private readonly pc: RTCPeerConnection) {}

  public setupListeners() {
    // Joiner flow
    joinChatBtn.addEventListener("click", async () => {
      try {
        const offer = JSON.parse(offerInput.value);
        await this.pc.setRemoteDescription(offer);

        const answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);
        answerOutput.value = JSON.stringify(answer);
        answerOutput.select();
        updateStatus("Answer created! Share it back with the creator.");
      } catch (err) {
        updateStatus("Error joining chat: " + err);
      }
    });
  }
}

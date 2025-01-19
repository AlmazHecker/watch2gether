import { updateStatus } from "@/features/logging/lib";

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

        await this.pc.setLocalDescription(await this.pc.createAnswer());
        this.pc.onicecandidate = async ({ candidate }) => {
          answerOutput.value = JSON.stringify(this.pc?.localDescription);
          answerOutput.select();
          updateStatus("Answer created! Share it back with the creator.");
        };
      } catch (err) {
        updateStatus("Error joining chat: " + err);
      }
    });
  }
}

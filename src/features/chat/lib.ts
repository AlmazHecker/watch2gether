import { updateStatus } from "../logging/lib";
import { CHAT_SELECTORS } from "./model";

// chat
const chatForm = document.getElementById(CHAT_SELECTORS.FORM)!;
const messages = document.getElementById(CHAT_SELECTORS.MESSAGE_LIST)!;
const messageInput = document.getElementById(
  CHAT_SELECTORS.MESSAGE_INPUT
) as HTMLInputElement;

export class ChatManager {
  constructor(private readonly dc: RTCDataChannel) {}

  public setupDataChannel() {
    this.dc.onmessage = event => {
      const messageEl = document.createElement("div");
      messageEl.className =
        "p-2 rounded-lg bg-gray-100 w-fit text-wrap max-w-md mr-auto text-black text-left";
      messageEl.textContent = `Other: ${event.data}`;
      messages.appendChild(messageEl);
      messages.scrollTop = messages.scrollHeight;
    };

    this.dc.onopen = () => {
      updateStatus("Connected! You can now chat.");
      chatForm.classList.remove("hidden");
      messageInput.focus();
    };

    this.dc.onclose = () => {
      updateStatus("Connection closed");
      chatForm.classList.add("hidden");
    };
  }

  public setupListeners() {
    chatForm.addEventListener("submit", e => {
      e.preventDefault();

      const message = messageInput.value;

      if (!message) {
        alert("Empty message!");
      }
      if (this.dc?.readyState !== "open") {
        alert("No Connection!");
      }

      this.dc.send(message);
      const messageEl = document.createElement("div");
      messageEl.className =
        "p-2 rounded-lg bg-blue-100 w-fit text-wrap max-w-md ml-auto text-black text-right";
      messageEl.textContent = `You: ${message}`;
      messages.appendChild(messageEl);
      messages.scrollTop = messages.scrollHeight;
      messageInput.value = "";
    });
  }
}

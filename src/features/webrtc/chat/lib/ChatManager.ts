export class ChatManager {
  private dc: RTCDataChannel;
  private output: HTMLPreElement;
  private chat: HTMLInputElement;

  constructor(
    dc: RTCDataChannel,
    output: HTMLPreElement,
    chat: HTMLInputElement
  ) {
    this.dc = dc;
    this.output = output;
    this.chat = chat;
    this.setupHandlers();
  }

  private setupHandlers() {
    const log = (msg: string) => {
      this.output.innerHTML += `<br>${msg}`;
      this.output.scrollTop = this.output.scrollHeight;
    };

    this.dc.onopen = () => this.chat.focus();
    this.dc.onmessage = (e) =>
      log(`<span class="text-blue-600">> ${e.data}</span>`);

    this.chat.onkeydown = (e) => {
      if (e.key !== "Enter") return; // Use e.key for checking "Enter" key
      this.dc.send(this.chat.value);
      log(`<span class="text-green-600">${this.chat.value}</span>`);
      this.chat.value = "";
    };
  }
}

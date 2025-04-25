const statusEl = document.getElementById("status")!;

export function updateStatus(message: string) {
  statusEl.textContent = message;
}

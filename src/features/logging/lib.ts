import { LOG_SELECTORS } from "./model";

const statusEl = document.getElementById(LOG_SELECTORS.container)!;

export function updateStatus(message: string) {
  statusEl.textContent = message;
}

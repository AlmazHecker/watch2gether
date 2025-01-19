export interface VideoCommand {
  type: "play" | "pause" | "seek" | "sync-request" | "sync-response";
  timestamp?: number;
  currentTime?: number;
}

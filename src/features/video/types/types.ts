export interface VideoCommand {
  type:
    | "play"
    | "pause"
    | "seek"
    | "sync-request"
    | "sync-response"
    | "video-source";
  timestamp?: number;
  currentTime?: number;
  src?: string;
}

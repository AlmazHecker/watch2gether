export interface LiveStreamCommand {
  type: "start-stream" | "stop-stream" | "renegotiate";
  sdp?: RTCSessionDescription;
}

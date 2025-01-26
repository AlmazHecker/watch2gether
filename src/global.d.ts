declare interface Window {
  pc: RTCPeerConnection;

  chatChannel: RTCDataChannel;
  videoChannel: RTCDataChannel;
}

declare global {
  const pc: RTCPeerConnection;

  const chatChannel: RTCDataChannel;
  const videoChannel: RTCDataChannel;
}

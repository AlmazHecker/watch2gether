/// <reference types="vite-plugin-pwa/info" />
/// <reference types="vite-plugin-pwa/vanillajs" />

declare interface Window {
  pc: RTCPeerConnection;

  chatChannel: RTCDataChannel;
  videoChannel: RTCDataChannel;
  liveStreamChannel: RTCDataChannel;
}

declare global {
  const pc: RTCPeerConnection;

  const chatChannel: RTCDataChannel;
  const videoChannel: RTCDataChannel;
  const liveStreamChannel: RTCDataChannel;
}

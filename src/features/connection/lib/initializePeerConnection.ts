import { updateStatus } from "@/features/logging/lib";

export const RTCConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }, // Google STUN
    { urls: "stun:stun1.l.google.com:19302" }, // Another Google STUN
    { urls: "stun:stun2.l.google.com:19302" }, // Yet another Google STUN
    { urls: "stun:stun.stunprotocol.org:3478" }, // STUN Protocol
    { urls: "stun:stun.services.mozilla.com" }, // Mozilla STUN
  ],
};
export const initializePeerConnection = () => {
  window.pc = new RTCPeerConnection(RTCConfig);
  window.chatChannel = window.pc.createDataChannel("chat", {
    negotiated: true,
    id: 0,
  });

  window.videoChannel = window.pc.createDataChannel("sync", {
    negotiated: true,
    id: 1,
  });

  window.liveStreamChannel = window.pc.createDataChannel("live-stream", {
    negotiated: true,
    id: 2,
  });

  window.pc.onicecandidate = event => {
    if (event.candidate) {
      updateStatus("Gathering ICE candidates...");
    }
  };
};

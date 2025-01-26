import { updateStatus } from "@/features/logging/lib";

export const RTCConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
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

  window.pc.onicecandidate = event => {
    if (event.candidate) {
      updateStatus("Gathering ICE candidates...");
    }
  };
};

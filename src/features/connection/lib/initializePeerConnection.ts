import { updateStatus } from "@/features/logging/lib";

export const RTCConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const initializePeerConnection = () => {
  let pc = new RTCPeerConnection(RTCConfig);
  let chatChannel = pc.createDataChannel("chat", {
    negotiated: true,
    id: 0,
  });

  const videoChannel = pc.createDataChannel("sync", {
    negotiated: true,
    id: 1,
  });

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      updateStatus("Gathering ICE candidates...");
    }
  };

  return { pc, chatChannel, videoChannel };
};

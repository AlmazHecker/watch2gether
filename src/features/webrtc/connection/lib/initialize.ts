import { ChatManager } from "../../chat/lib/ChatManager";
import { VideoSyncManager } from "../../video/lib/VideoSyncManager";
import type { WebRTCElements } from "../types/types";
import { ConnectionManager } from "./ConnectionManager";
import { RTCConfig } from "./rtc.config";

async function initializeWebRTC() {
  try {
    const elements: WebRTCElements = {
      output: document.getElementById("output") as HTMLPreElement,
      button: document.getElementById("button") as HTMLButtonElement,
      offer: document.getElementById("offer") as HTMLTextAreaElement,
      answer: document.getElementById("answer") as HTMLTextAreaElement,
      chat: document.getElementById("chat") as HTMLInputElement,
      videoPlayer: document.getElementById("sharedVideo") as HTMLVideoElement,
    };

    const pc = new RTCPeerConnection(RTCConfig);
    const dc = pc.createDataChannel("chat", { negotiated: true, id: 0 });
    const syncChannel = pc.createDataChannel("sync", {
      negotiated: true,
      id: 1,
    });

    const connectionManager = new ConnectionManager(pc, elements);
    const chatManager = new ChatManager(dc, elements.output, elements.chat);
    const videoSyncManager = new VideoSyncManager(
      elements.videoPlayer,
      syncChannel
    );

    elements.button.addEventListener("click", connectionManager.createOffer);
  } catch (err) {
    console.error("Error initializing WebRTC: ", err);
  }
}

document.addEventListener("DOMContentLoaded", initializeWebRTC);

import { useEffect, useState } from "react";

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302", // list of free STUN servers: https://gist.github.com/zziuni/3741933
    },
  ],
};

function isWebRTCSDP(text: string) {
  // Basic checks to see if the text follows SDP format
  const sdpPattern = /^v=0\s*[\s\S]+/;
  return sdpPattern.test(text);
}

export const useWebRTC = () => {
  const [RTCPeer] = useState<RTCPeerConnection>(
    new RTCPeerConnection(RTC_CONFIG)
  );
  const [offer, setOffer] = useState("");
  const [answer, setAnswer] = useState("");

  async function createOffer() {
    if (!RTCPeer) return;
    // button.disabled = true;
    await RTCPeer.setLocalDescription(await RTCPeer.createOffer());

    RTCPeer.addEventListener("icecandidate", ({ candidate }) => {
      console.log(RTCPeer!.localDescription!.sdp);

      if (candidate) return;
      console.log("asdf");

      setOffer(RTCPeer!.localDescription!.sdp);
      console.log("OFFER CREATED!");

      //   offer.value = pc.localDescription.sdp;
      //   offer.select();
      //   answer.placeholder = "Paste answer here. And Press Enter";
    });
  }

  async function acceptOffer(offer?: string) {
    if (RTCPeer?.signalingState != "stable") {
      console.log("RTCPeerConnection not ready yet!");
      return;
    }
    if (!offer) {
      const cbText = await navigator.clipboard.readText();
      if (isWebRTCSDP(cbText)) {
        offer = cbText;
      } else {
        offer = prompt("Paste offer") as string;
      }
    }
    // button.disabled = offer.disabled = true;
    await RTCPeer.setRemoteDescription({
      type: "offer",
      sdp: `${offer}\n`,
    });
    await RTCPeer.setLocalDescription(await RTCPeer.createAnswer());
    RTCPeer.onicecandidate = ({ candidate }) => {
      if (candidate) return;
      //   answer.focus();
      //   answer.value = pc.localDescription.sdp;
      console.log("OFFER ACCEPTED");
      setAnswer(RTCPeer!.localDescription!.sdp);
      //   answer.select();
    };
  }

  async function answerOffer(answer?: string) {
    if (RTCPeer?.signalingState !== "have-local-offer") {
      console.log("RTCPeerConnection not ready yet!");
      return;
    }
    if (!answer) {
      const cbText = await navigator.clipboard.readText();
      if (isWebRTCSDP(cbText)) {
        answer = cbText;
      } else {
        answer = prompt("Paste answer") as string;
      }
    }
    // answer.disabled = true;
    await RTCPeer.setRemoteDescription({
      type: "answer",
      sdp: `${answer}\n`,
    });
    console.log("OFFER CONFIRMED!");
  }

  useEffect(() => {
    const dc = RTCPeer.createDataChannel("chat", {
      negotiated: true,
      id: 0,
    });

    console.log("Data channel created:", dc);

    return () => {
      RTCPeer.close();
      dc.close();
    };
  }, []);

  // THIS USEFFECT CONTAINS CODE RELATED TO LOGGING! NO OTHER ACTIONS HERE
  useEffect(() => {
    if (!RTCPeer) return;

    function handleChange() {
      console.log(
        "%c" +
          new Date().toISOString() +
          ": ConnectionState: %c" +
          RTCPeer?.connectionState +
          " %cIceConnectionState: %c" +
          RTCPeer?.iceConnectionState,
        "color:yellow",
        "color:orange",
        "color:yellow",
        "color:orange"
      );
    }

    handleChange();

    // RTCPeer.onconnectionstatechange = handleChange;
    // RTCPeer.oniceconnectionstatechange = (ev) => handleChange();
    RTCPeer.addEventListener("connectionstatechange", handleChange);
    RTCPeer.addEventListener("iceconnectionstatechange", handleChange);
    return () => {
      RTCPeer.removeEventListener("connectionstatechange", handleChange);
      RTCPeer.removeEventListener("iceconnectionstatechange", handleChange);
      //   RTCPeer.close();
    };
  }, [RTCPeer]);

  return { createOffer, acceptOffer, answerOffer, offer, answer };
};

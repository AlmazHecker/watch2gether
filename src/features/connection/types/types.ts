export type Signal = {
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidates: RTCIceCandidateInit[];
};

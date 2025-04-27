import type { VideoPlayer } from "../types/types";
import { HTML5VideoPlayer } from "./HTML5VideoPlayer";
import { YouTubeVideoPlayer } from "./YoutubeVideoPlayer";
import { isYoutubeUrl } from "@/shared/lib/utils";

export function VideoPlayerFactory(
  type: "html5" | "youtube",
  element: HTMLVideoElement | HTMLElement
): VideoPlayer {
  if (type === "html5") {
    return new HTML5VideoPlayer(element as HTMLVideoElement);
  } else if (type === "youtube") {
    return new YouTubeVideoPlayer(element);
  }
  throw new Error("Unsupported video player type");
}

export function setupVideoPlayer(videoUrl: string): VideoPlayer {
  const videoContainer = document.getElementById("videoContainer");
  if (!videoContainer) throw alert("NO VIDEO CONTAINER FOUND >:(");

  const html5Player = document.getElementById(
    "html5-player"
  ) as HTMLVideoElement;

  const YTPlayer = document.getElementById("youtube-player") as HTMLElement;

  html5Player.classList.add("hidden");
  YTPlayer.classList.add("hidden");

  let videoPlayer: VideoPlayer;

  if (isYoutubeUrl(videoUrl)) {
    YTPlayer.classList.remove("hidden");
    videoPlayer = VideoPlayerFactory("youtube", YTPlayer);
  } else {
    html5Player.classList.remove("hidden");
    videoPlayer = VideoPlayerFactory("html5", html5Player);
  }

  return videoPlayer;
}

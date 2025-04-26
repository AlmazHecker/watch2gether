import type { VideoPlayer } from "../types/types";
import { HTML5VideoPlayer } from "./HTML5VideoPlayer";
import { YouTubeVideoPlayer } from "./YoutubeVideoPlayer";
import { VideoSyncManager } from "@/features/video/lib/VideoSyncManager";
import { isYoutubeUrl } from "@/shared/lib/utils";

export function VideoPlayerFactory(
  type: "html5" | "youtube",
  element: HTMLVideoElement | string
): VideoPlayer {
  if (type === "html5") {
    return new HTML5VideoPlayer(element as HTMLVideoElement);
  } else if (type === "youtube") {
    return new YouTubeVideoPlayer(element as string);
  }
  throw new Error("Unsupported video player type");
}

export function setupVideoPlayer(videoUrl: string) {
  if (videoUrl.trim() === "") return;

  const html5Video = document.getElementById("sharedVideo") as HTMLVideoElement;
  const YTVideo = document.getElementById("youtube-player") as HTMLElement;

  let videoPlayer: VideoPlayer;

  if (isYoutubeUrl(videoUrl)) {
    YTVideo.classList.remove("hidden");
    videoPlayer = VideoPlayerFactory("youtube", "youtube-player");
  } else {
    html5Video.classList.remove("hidden");
    videoPlayer = VideoPlayerFactory("html5", html5Video);
  }

  const videoSyncManager = new VideoSyncManager(
    videoPlayer,
    window.videoChannel
  );
  videoSyncManager.setVideoSource(videoUrl);
}

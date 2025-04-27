import type { VideoPlayer } from "@/features/video/types/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isNotNumberLike = (num: string | number) => {
  return Number.isNaN(+num); // checks, whether num can be converted to number
};

// export const isYoutubeUrl = (videoUrl: string) => {
//   const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//;
//   return youtubeRegex.test(videoUrl);
// };

export const getPlayerType = (videoUrl: string): VideoPlayer["name"] => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//;
  if (youtubeRegex.test(videoUrl)) {
    return "yt-player";
  }

  return "html5-player";
};

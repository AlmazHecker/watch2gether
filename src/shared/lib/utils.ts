import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isNotNumberLike = (num: string | number) => {
  return Number.isNaN(+num); // checks, whether num can be converted to number
};

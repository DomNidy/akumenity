import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// chunkArray is a local convenience function. It takes an array and returns a generator that yields every N items.
export function* chunkArray<T>(arr: T[], n: number) {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}

// Function which returns the time since a current timestamp (in ms) and a previous timestamp (in ms) in a human readable format.
// Example format: (1 hour, 30 minutes, 35 seconds would be 1:30:35)
export function timeSince(current: number, previous: number) {
  const msPerSecond = 1000;
  const msPerMinute = msPerSecond * 60;
  const msPerHour = msPerMinute * 60;

  const elapsed = current - previous;

  const hours = Math.floor(elapsed / msPerHour);
  const minutes = Math.floor((elapsed % msPerHour) / msPerMinute);
  const seconds = Math.floor(
    ((elapsed % msPerHour) % msPerMinute) / msPerSecond,
  );

  const hoursStr = hours < 10 ? `${hours}` : hours;
  const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
  const secondsStr = seconds < 10 ? `0${seconds}` : seconds;

  return `${hoursStr}:${minutesStr}:${secondsStr}`;
}

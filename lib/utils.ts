import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toTimeAgo(isoDate: string) {
  const deltaMs = Date.now() - new Date(isoDate).getTime();
  const sec = Math.max(1, Math.floor(deltaMs / 1000));

  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}h`;
  const day = Math.floor(hour / 24);
  if (day < 7) return `${day}d`;
  const week = Math.floor(day / 7);
  if (week < 5) return `${week}w`;
  const month = Math.floor(day / 30);
  if (month < 12) return `${month}mo`;
  const year = Math.floor(day / 365);
  return `${year}y`;
}

export function slugifyUsername(input: string) {
  const value = input
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20);

  return value || `agent${Math.floor(Math.random() * 100000)}`;
}

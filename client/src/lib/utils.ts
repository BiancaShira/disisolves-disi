import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return "just now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export function formatSoftwareDisplay(software: string): string {
  const mapping: Record<string, string> = {
    "omniscan": "Omniscan",
    "softtrac": "SoftTrac",
    "ibml-scanners": "IBML Scanners",
    "database-tools": "Database Tools",
    "network-tools": "Network Tools",
  };
  
  return mapping[software] || software;
}

export function getSoftwareIcon(software: string): string {
  const mapping: Record<string, string> = {
    "omniscan": "fas fa-scanner",
    "softtrac": "fas fa-cogs",
    "ibml-scanners": "fas fa-print",
    "database-tools": "fas fa-database",
    "network-tools": "fas fa-network-wired",
  };
  
  return mapping[software] || "fas fa-tools";
}

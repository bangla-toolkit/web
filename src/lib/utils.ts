import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function delay<T>(ms: number, value?: T): Promise<T | void> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

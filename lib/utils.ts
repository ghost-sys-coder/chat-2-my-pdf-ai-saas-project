import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// function to convert a string to ASCII
export function convertToASCII(inputString: string): string {
  const asciiString = inputString.replace(/[^\x00-\x7F]+/g, "");
  return asciiString;
}
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const base64ToFile = (base64String: string, fileName: string, mimeType: string): File => {
  const base64Parts = base64String.split(',');
  if (base64Parts.length < 2 || !base64Parts[1]) {
    throw new Error("Invalid base64 string");
  }
  const base64WithoutPrefix = base64Parts[1];
  const binaryString = atob(base64WithoutPrefix);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType });
  return new File([blob], fileName, { type: mimeType });
};

export const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(new Error(`FileReader error: ${JSON.stringify(error)}`));
  });
};

export function formatTransactionHash(hash: string | null): string {
  if (!hash || hash.length < 10) {
    return "No hash provided";
  }

  const prefix = hash.slice(0, 4);
  const suffix = hash.slice(-4);

  return `${prefix}...${suffix}`;
}

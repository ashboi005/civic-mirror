import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to handle image loading errors
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
  // Default fallback image
  event.currentTarget.src = '/images/placeholder.jpg';
  event.currentTarget.onerror = null; // Prevent infinite error loops
};

// Function to get a proper image URL with fallback
export const getImageUrl = (url: string | undefined | null): string => {
  if (!url) return '/images/placeholder.jpg';
  
  // If the URL is relative but doesn't start with a slash, add one
  if (!url.startsWith('http') && !url.startsWith('/')) {
    return `/${url}`;
  }
  
  return url;
};

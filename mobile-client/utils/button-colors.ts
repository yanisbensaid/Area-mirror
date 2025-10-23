// This is a utility file to ensure consistent button text colors
// Import this in components that have buttons with dynamic backgrounds

import { useColorScheme } from '@/hooks/use-color-scheme';

export const useButtonTextColor = (backgroundColor: string | undefined) => {
  const colorScheme = useColorScheme();
  
  // If background is white or light, use dark text
  if (backgroundColor === '#fff' || backgroundColor === '#ffffff' || backgroundColor === 'white') {
    return '#000';
  }
  
  // If background is dark, use white text
  if (backgroundColor === '#000' || backgroundColor === '#1a1a1a' || backgroundColor === 'black') {
    return '#fff';
  }
  
  // If background is transparent or undefined, use theme-appropriate text color
  if (!backgroundColor || backgroundColor === 'transparent') {
    return colorScheme === 'dark' ? '#ECEDEE' : '#11181C';
  }
  
  // For colored backgrounds, use white text
  return '#fff';
};

export const getContrastTextColor = (backgroundColor: string | undefined, colorScheme: 'light' | 'dark' | null) => {
  // If background is white or light, use dark text
  if (backgroundColor === '#fff' || backgroundColor === '#ffffff' || backgroundColor === 'white') {
    return '#000';
  }
  
  // If background is dark, use white text
  if (backgroundColor === '#000' || backgroundColor === '#1a1a1a' || backgroundColor === 'black') {
    return '#fff';
  }
  
  // If background is transparent or undefined, use theme-appropriate text color
  if (!backgroundColor || backgroundColor === 'transparent') {
    return colorScheme === 'dark' ? '#ECEDEE' : '#11181C';
  }
  
  // For colored backgrounds, use white text
  return '#fff';
};
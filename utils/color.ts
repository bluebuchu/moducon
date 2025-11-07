import { RGB } from '../types';

export const hexToRgb = (hex: string): RGB => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

export const rgbToHex = ({ r, g, b }: RGB): string => {
  // eslint-disable-next-line no-bitwise
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

// Calculate similarity percentage between two colors
export const calculateSimilarity = (color1: RGB, color2: RGB): number => {
  // Maximum possible Euclidean distance in RGB space (distance between black #000000 and white #FFFFFF)
  const maxDistance = Math.sqrt(255 ** 2 + 255 ** 2 + 255 ** 2);
  
  const distance = Math.sqrt(
    (color1.r - color2.r) ** 2 +
    (color1.g - color2.g) ** 2 +
    (color1.b - color2.b) ** 2
  );

  // Invert distance to get similarity. 0 distance = 100% similarity.
  const similarity = 100 - (distance / maxDistance) * 100;
  
  // Clamp between 0 and 100 and round to 1 decimal place
  return Math.max(0, Math.min(100, Math.round(similarity * 10) / 10));
};

export const getAverageAccuracy = (accuracies: number[]): number => {
    if (accuracies.length === 0) return 0;
    const sum = accuracies.reduce((a, b) => a + b, 0);
    return Math.round((sum / accuracies.length) * 10) / 10;
}
import { RGB, Difficulty, ColorOption } from '../types';
import { DIFFICULTY_SETTINGS } from '../constants';

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

// Convert RGB to HSL
export const rgbToHsl = ({ r, g, b }: RGB): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};

// Convert HSL to RGB
export const hslToRgb = (h: number, s: number, l: number): RGB => {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

// Generate color variations for a given difficulty
export const generateColorVariations = (originalHex: string, difficulty: Difficulty): ColorOption[] => {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  const originalRgb = hexToRgb(originalHex);
  const originalHsl = rgbToHsl(originalRgb);
  
  const variations: ColorOption[] = [];
  const colorOptions: string[] = [originalHex]; // Include original
  
  // Generate variations
  for (let i = 0; i < settings.colorVariations - 1; i++) {
    // Random variation in HSL space
    const hueShift = (Math.random() - 0.5) * 2 * settings.hueShift;
    const satShift = (Math.random() - 0.5) * 2 * settings.saturationShift;
    const lightShift = (Math.random() - 0.5) * 2 * settings.lightnessShift;
    
    let newH = originalHsl.h + hueShift;
    let newS = originalHsl.s + satShift;
    let newL = originalHsl.l + lightShift;
    
    // Wrap hue
    if (newH < 0) newH += 360;
    if (newH > 360) newH -= 360;
    
    // Clamp saturation and lightness
    newS = Math.max(0, Math.min(100, newS));
    newL = Math.max(0, Math.min(100, newL));
    
    const variedRgb = hslToRgb(newH, newS, newL);
    const variedHex = rgbToHex(variedRgb);
    
    // Avoid duplicates
    if (!colorOptions.includes(variedHex)) {
      colorOptions.push(variedHex);
    }
  }
  
  // Ensure we have enough variations
  while (colorOptions.length < settings.colorVariations) {
    const hueShift = (Math.random() - 0.5) * 2 * settings.hueShift * 1.5;
    const satShift = (Math.random() - 0.5) * 2 * settings.saturationShift * 1.5;
    const lightShift = (Math.random() - 0.5) * 2 * settings.lightnessShift * 1.5;
    
    let newH = originalHsl.h + hueShift;
    let newS = originalHsl.s + satShift;
    let newL = originalHsl.l + lightShift;
    
    if (newH < 0) newH += 360;
    if (newH > 360) newH -= 360;
    newS = Math.max(0, Math.min(100, newS));
    newL = Math.max(0, Math.min(100, newL));
    
    const variedRgb = hslToRgb(newH, newS, newL);
    const variedHex = rgbToHex(variedRgb);
    
    if (!colorOptions.includes(variedHex)) {
      colorOptions.push(variedHex);
    }
  }
  
  // Shuffle array to randomize position of correct answer
  const shuffled = [...colorOptions].sort(() => Math.random() - 0.5);
  const correctIndex = shuffled.indexOf(originalHex);
  
  return shuffled.map((color, index) => ({
    color,
    isCorrect: index === correctIndex
  }));
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

// Extract dominant colors from an image
export const extractImageColors = async (imagePath: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const colors = extractDominantColorsFromImageData(imageData);
      
      resolve(colors);
    };
    
    img.onerror = () => {
      reject(new Error('Could not load image'));
    };
    
    img.src = imagePath;
  });
};

// Extract dominant colors from image data
const extractDominantColorsFromImageData = (imageData: ImageData): string[] => {
  const data = imageData.data;
  const colorCounts: { [key: string]: number } = {};
  const threshold = 30; // Skip very similar colors
  
  // Sample every 4th pixel for performance
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    
    // Skip transparent pixels
    if (a < 128) continue;

    // Skip very light/dark colors (likely background)
    const brightness = (r + g + b) / 3;
    if (brightness > 240 || brightness < 15) continue;
    
    const colorKey = `${Math.floor(r / threshold) * threshold},${Math.floor(g / threshold) * threshold},${Math.floor(b / threshold) * threshold}`;
    colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
  }
  
  // Sort by frequency and get top colors
  const sortedColors = Object.entries(colorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([color]) => {
      const [r, g, b] = color.split(',').map(Number);
      return rgbToHex({ r, g, b });
    });
  
  return sortedColors.length > 0 ? sortedColors : ['#666666']; // Fallback color
};
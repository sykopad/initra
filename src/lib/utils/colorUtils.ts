/**
 * Initra — Color Extraction Utilities
 * Extracts dominant and secondary colors from images via Canvas API.
 */

export interface ColorPalette {
  dominant: string;
  secondary: string;
  accent: string;
  all: string[];
}

/**
 * Extracts colors from an image URL or Blob.
 */
export async function extractPalette(imageSource: string | Blob): Promise<ColorPalette> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas context not available");

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const rgbValues: [number, number, number][] = [];

      // Sample every 10th pixel to save performance
      for (let i = 0; i < imageData.length; i += 40) {
        rgbValues.push([imageData[i], imageData[i + 1], imageData[i + 2]]);
      }

      const counts: Record<string, number> = {};
      rgbValues.forEach(([r, g, b]) => {
        // Quantize colors slightly to group similar shades
        const q = 40;
        const key = `${Math.round(r / q) * q},${Math.round(g / q) * q},${Math.round(b / q) * q}`;
        counts[key] = (counts[key] || 0) + 1;
      });

      const sortedColors = Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .map(([key]) => {
          const [r, g, b] = key.split(",").map(Number);
          return `rgb(${r}, ${g}, ${b})`;
        });

      // Filter out very dark/very light if possible, or just take top 3
      const palette: ColorPalette = {
        dominant: sortedColors[0] || "rgb(15, 15, 15)",
        secondary: sortedColors[1] || "rgb(100, 100, 100)",
        accent: sortedColors[2] || "rgb(200, 200, 200)",
        all: sortedColors.slice(0, 6)
      };

      resolve(palette);
    };

    img.onerror = () => reject("Failed to load image");

    if (imageSource instanceof Blob) {
      img.src = URL.createObjectURL(imageSource);
    } else {
      img.src = imageSource;
    }
  });
}

/**
 * Helper to convert RGB string to HEX
 */
export function rgbToHex(rgb: string): string {
  const match = rgb.match(/\d+/g);
  if (!match) return "#000000";
  const [r, g, b] = match.map(Number);
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

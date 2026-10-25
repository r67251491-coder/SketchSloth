/**
 * Image Normalization Utility
 * Scales any raw File or Base64 image proportionally to a maximum dimension of 1024px
 * and compresses it to a lightweight JPEG Base64 string to prevent crashing the vision model.
 */

export async function normalizeImageFile(
  file: File,
  maxDimension = 1024,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        reject(new Error("Empty image file data"));
        return;
      }
      normalizeBase64Image(dataUrl, maxDimension, quality)
        .then(resolve)
        .catch(reject);
    };
    reader.readAsDataURL(file);
  });
}

export async function normalizeBase64Image(
  base64DataUrl: string,
  maxDimension = 1024,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If not in a browser environment, return original
    if (typeof window === "undefined" || typeof document === "undefined") {
      resolve(base64DataUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (!width || !height) {
        resolve(base64DataUrl);
        return;
      }

      // Proportional scale to maxDimension
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(base64DataUrl);
        return;
      }

      // Draw white background for transparent PNG/WebP before converting to JPEG
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const normalizedBase64 = canvas.toDataURL("image/jpeg", quality);
      resolve(normalizedBase64);
    };

    img.onerror = () => {
      // Fallback to original base64 if image decode fails
      resolve(base64DataUrl);
    };

    img.src = base64DataUrl;
  });
}

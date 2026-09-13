/**
 * Client-side image compression & WebP optimization utility.
 * Compresses raw high-res images before uploading to Supabase Storage.
 *
 * Benefits:
 * - Reduces storage usage by 80% to 95%
 * - Speeds up uploads significantly over mobile/slower connections
 * - Improves frontend page load speed and Core Web Vitals (LCP)
 * - Standardizes images to modern WebP format
 */

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  reductionPercentage: number;
}

export async function compressImage(
  file: File,
  maxDimension: number = 1920,
  quality: number = 0.82
): Promise<CompressionResult> {
  const originalSize = file.size;

  // Don't compress SVGs or animated GIFs
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      reductionPercentage: 0,
    };
  }

  // If already under 120KB and is already webp, leave as-is
  if (originalSize < 120 * 1024 && file.type === 'image/webp') {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      reductionPercentage: 0,
    };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let { width, height } = img;

        // Scale down dimensions while maintaining aspect ratio
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback if canvas context fails
          resolve({
            file,
            originalSize,
            compressedSize: originalSize,
            reductionPercentage: 0,
          });
          return;
        }

        // Enable high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to efficient WebP
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({
                file,
                originalSize,
                compressedSize: originalSize,
                reductionPercentage: 0,
              });
              return;
            }

            // Only use compressed if it actually reduced size
            if (blob.size < originalSize) {
              const baseName = file.name.replace(/\.[^/.]+$/, '');
              const compressedFile = new File([blob], `${baseName}.webp`, {
                type: 'image/webp',
                lastModified: Date.now(),
              });

              const reduction = Math.round(
                ((originalSize - blob.size) / originalSize) * 100
              );

              resolve({
                file: compressedFile,
                originalSize,
                compressedSize: blob.size,
                reductionPercentage: reduction,
              });
            } else {
              // Original was already smaller
              resolve({
                file,
                originalSize,
                compressedSize: originalSize,
                reductionPercentage: 0,
              });
            }
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () =>
        resolve({
          file,
          originalSize,
          compressedSize: originalSize,
          reductionPercentage: 0,
        });
    };

    reader.onerror = () =>
      resolve({
        file,
        originalSize,
        compressedSize: originalSize,
        reductionPercentage: 0,
      });
  });
}

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

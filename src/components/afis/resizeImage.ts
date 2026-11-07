/** Saklanan data URL için üst sınır (karakter); yaklaşık 400 KB */
export const MAX_DATA_URL_LENGTH = 400 * 1024;

/**
 * Görseli tarayıcıda küçült: uzun kenar en fazla `maxEdge` piksel, JPEG kalite `quality`.
 * Şeffaf alanlar mürekkep rengiyle doldurulur (JPEG alfa taşımaz).
 */
export async function resizeImageFile(file: File, maxEdge = 600, quality = 0.8): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new window.Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('decode'));
      el.src = url;
    });
    const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight, 1));
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas');
    ctx.fillStyle = '#1C2118';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Data URL'nin kapladığı yaklaşık boyut, KB */
export const dataUrlKilobytes = (dataUrl: string) => Math.round(dataUrl.length / 1024);

/**
 * Aegis Canvas Spoofing Engine
 * Injects subtle mathematical noise to perturb HTML5 Canvas 2D fingerprinting
 * across toDataURL, toBlob, and getImageData without causing visual artifacts.
 */
export function injectCanvasSpoof(seed = 12345) {
  // Simple deterministic PRNG based on Mulberry32
  function pseudoRandom(s) {
    let t = s += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  function applySubtleNoise(ctx, width, height) {
    try {
      const w = Math.min(width, 16);
      const h = Math.min(height, 16);
      if (w <= 0 || h <= 0) return;
      const imgData = ctx.getImageData(0, 0, w, h);
      for (let i = 0; i < imgData.data.length; i += 4) {
        // Alter lowest bit of green/blue channel deterministically
        imgData.data[i + 1] = Math.min(255, Math.max(0, imgData.data[i + 1] + (i % 2 === 0 ? 1 : -1)));
      }
      ctx.putImageData(imgData, 0, 0);
    } catch {
      // Cross-origin tainted canvas fallback
    }
  }

  if (typeof HTMLCanvasElement !== 'undefined') {
    // 1. toDataURL
    const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function (type, ...args) {
      const ctx = this.getContext('2d');
      if (ctx) applySubtleNoise(ctx, this.width, this.height);
      return origToDataURL.apply(this, [type, ...args]);
    };

    // 2. toBlob (Protects against toBlob vs toDataURL discrepancy detection)
    if (HTMLCanvasElement.prototype.toBlob) {
      const origToBlob = HTMLCanvasElement.prototype.toBlob;
      HTMLCanvasElement.prototype.toBlob = function (callback, ...args) {
        const ctx = this.getContext('2d');
        if (ctx) applySubtleNoise(ctx, this.width, this.height);
        return origToBlob.apply(this, [callback, ...args]);
      };
    }

    // 3. getImageData
    if (typeof CanvasRenderingContext2D !== 'undefined') {
      const origGetImageData = CanvasRenderingContext2D.prototype.getImageData;
      CanvasRenderingContext2D.prototype.getImageData = function (...args) {
        const res = origGetImageData.apply(this, args);
        for (let i = 0; i < res.data.length; i += 16) {
          res.data[i] = Math.min(255, Math.max(0, res.data[i] + (seed % 3 - 1)));
        }
        return res;
      };
    }
  }

  return true;
}

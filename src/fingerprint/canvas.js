/**
 * Aegis Canvas Spoofing Engine
 * Injects subtle mathematical noise to perturb HTML5 Canvas 2D fingerprinting
 * without causing visual artifacts or corrupting images.
 */
export function injectCanvasSpoof(seed = 12345) {
  // Simple deterministic PRNG based on Mulberry32
  function pseudoRandom(s) {
    let t = s += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  const noise = (pseudoRandom(seed) - 0.5) * 0.002;

  if (typeof HTMLCanvasElement !== 'undefined') {
    const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function (type, ...args) {
      const ctx = this.getContext('2d');
      if (ctx) {
        try {
          const imgData = ctx.getImageData(0, 0, Math.min(this.width, 16), Math.min(this.height, 16));
          for (let i = 0; i < imgData.data.length; i += 4) {
            // Alter lowest bit of green/blue channel
            imgData.data[i + 1] = Math.min(255, Math.max(0, imgData.data[i + 1] + (i % 2 === 0 ? 1 : -1)));
          }
          ctx.putImageData(imgData, 0, 0);
        } catch {
          // Cross-origin tainted canvas fallback
        }
      }
      return origToDataURL.apply(this, [type, ...args]);
    };

    const origGetImageData = CanvasRenderingContext2D.prototype.getImageData;
    CanvasRenderingContext2D.prototype.getImageData = function (...args) {
      const res = origGetImageData.apply(this, args);
      for (let i = 0; i < res.data.length; i += 16) {
        res.data[i] = Math.min(255, Math.max(0, res.data[i] + (seed % 3 - 1)));
      }
      return res;
    };
  }
  return true;
}

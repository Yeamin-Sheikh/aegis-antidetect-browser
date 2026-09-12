/**
 * Aegis WebGL Fingerprint Spoofing Engine
 * Spoofs UNMASKED_VENDOR_WEBGL and UNMASKED_RENDERER_WEBGL to simulate target GPU.
 */
export function injectWebGLSpoof({
  vendor = 'Google Inc. (NVIDIA)',
  renderer = 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4090 Direct3D11 vs_5_0 ps_5_0, D3D11)'
} = {}) {
  const UNMASKED_VENDOR_WEBGL = 0x9245;
  const UNMASKED_RENDERER_WEBGL = 0x9246;

  function patchContext(proto) {
    if (!proto || !proto.getParameter) return;
    const origGetParameter = proto.getParameter;
    proto.getParameter = function (parameter) {
      if (parameter === UNMASKED_VENDOR_WEBGL) {
        return vendor;
      }
      if (parameter === UNMASKED_RENDERER_WEBGL) {
        return renderer;
      }
      return origGetParameter.apply(this, [parameter]);
    };
  }

  if (typeof WebGLRenderingContext !== 'undefined') {
    patchContext(WebGLRenderingContext.prototype);
  }
  if (typeof WebGL2RenderingContext !== 'undefined') {
    patchContext(WebGL2RenderingContext.prototype);
  }

  return { vendor, renderer };
}

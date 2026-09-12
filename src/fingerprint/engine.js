import { injectCanvasSpoof } from './canvas.js';
import { injectWebGLSpoof } from './webgl.js';
import { injectNavigatorSpoof } from './navigator.js';
import { injectWebRTCSpoof } from './webrtc.js';

/**
 * Builds a self-executing injection script string to pass to Chromium via
 * Page.addScriptToEvaluateOnNewDocument or Chrome extension content script.
 */
export function buildInjectionScript(profile) {
  return `
    (function() {
      // 1. Canvas Spoofing
      (${injectCanvasSpoof.toString()})(${profile.canvasSeed || 12345});
      
      // 2. WebGL Spoofing
      (${injectWebGLSpoof.toString()})({
        vendor: ${JSON.stringify(profile.webglVendor || 'Google Inc. (NVIDIA)')},
        renderer: ${JSON.stringify(profile.webglRenderer || 'ANGLE (NVIDIA RTX 4090)')}
      });

      // 3. Navigator & Hardware Spoofing
      (${injectNavigatorSpoof.toString()})({
        userAgent: ${JSON.stringify(profile.userAgent)},
        platform: ${JSON.stringify(profile.platform || 'Win32')},
        hardwareConcurrency: ${Number(profile.cpuCores || 8)},
        deviceMemory: ${Number(profile.ramGb || 16)},
        languages: ${JSON.stringify(profile.languages || ['en-US', 'en'])}
      });

      // 4. WebRTC Leak Defense
      (${injectWebRTCSpoof.toString()})({
        mode: ${JSON.stringify(profile.webrtcMode || 'disable-non-proxied-udp')}
      });
    })();
  `;
}

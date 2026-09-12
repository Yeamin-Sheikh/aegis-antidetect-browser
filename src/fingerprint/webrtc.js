/**
 * Aegis WebRTC Leak Protection & Candidate Masking
 */
export function injectWebRTCSpoof({ mode = 'disable-non-proxied-udp', spoofPublicIP = null } = {}) {
  if (typeof RTCPeerConnection === 'undefined') return;

  const origCreateDataChannel = RTCPeerConnection.prototype.createDataChannel;
  const origCreateOffer = RTCPeerConnection.prototype.createOffer;

  // Mask ICE Candidate IP leaks
  const origAddIceCandidate = RTCPeerConnection.prototype.addIceCandidate;
  RTCPeerConnection.prototype.addIceCandidate = function (candidate, ...args) {
    if (candidate && candidate.candidate) {
      if (mode === 'disable-non-proxied-udp' && candidate.candidate.includes('typ host')) {
        // Drop local IP candidates
        return Promise.resolve();
      }
    }
    return origAddIceCandidate.apply(this, [candidate, ...args]);
  };

  return { mode, spoofPublicIP };
}

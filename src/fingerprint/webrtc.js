/**
 * Aegis WebRTC Leak Protection & Candidate Masking
 * Masks private IP addresses (RFC 1918) and host candidates to prevent STUN/ICE enumeration.
 */
export function injectWebRTCSpoof({ mode = 'disable-non-proxied-udp', spoofPublicIP = null } = {}) {
  if (typeof RTCPeerConnection === 'undefined') return { mode, spoofPublicIP, active: false };

  const privateIpRegex = /\b(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}|(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})\b/g;

  function filterCandidateString(candStr) {
    if (!candStr) return candStr;
    if (mode === 'disable-non-proxied-udp' && candStr.includes('typ host')) {
      return null; // Suppress host candidate entirely
    }
    if (spoofPublicIP) {
      return candStr.replace(privateIpRegex, spoofPublicIP);
    }
    return candStr.replace(privateIpRegex, '0.0.0.0');
  }

  // 1. Intercept onicecandidate event listener
  const origAddEventListener = RTCPeerConnection.prototype.addEventListener;
  if (origAddEventListener) {
    RTCPeerConnection.prototype.addEventListener = function(type, listener, options) {
      if (type === 'icecandidate' && typeof listener === 'function') {
        const wrappedListener = function(event) {
          if (event && event.candidate) {
            const filtered = filterCandidateString(event.candidate.candidate);
            if (!filtered) {
              return;
            }
          }
          return listener.apply(this, arguments);
        };
        return origAddEventListener.call(this, type, wrappedListener, options);
      }
      return origAddEventListener.apply(this, arguments);
    };
  }

  // 2. Intercept onicecandidate property setter
  let onicecandidateDescriptor = Object.getOwnPropertyDescriptor(RTCPeerConnection.prototype, 'onicecandidate');
  if (!onicecandidateDescriptor) {
    onicecandidateDescriptor = {
      set: function(fn) { this._onicecandidate = fn; },
      get: function() { return this._onicecandidate; },
      configurable: true,
      enumerable: true
    };
  }

  Object.defineProperty(RTCPeerConnection.prototype, 'onicecandidate', {
    set: function(handler) {
      if (typeof handler !== 'function') {
        if (onicecandidateDescriptor.set) onicecandidateDescriptor.set.call(this, handler);
        return;
      }
      const wrapped = function(event) {
        if (event && event.candidate) {
          const filtered = filterCandidateString(event.candidate.candidate);
          if (!filtered) {
            return;
          }
        }
        return handler.apply(this, arguments);
      };
      if (onicecandidateDescriptor.set) {
        onicecandidateDescriptor.set.call(this, wrapped);
      } else {
        this._customIceCandidate = wrapped;
      }
    },
    get: function() {
      if (onicecandidateDescriptor.get) return onicecandidateDescriptor.get.call(this);
      return this._customIceCandidate;
    },
    configurable: true,
    enumerable: true
  });

  // 3. Intercept addIceCandidate
  const origAddIceCandidate = RTCPeerConnection.prototype.addIceCandidate;
  if (origAddIceCandidate) {
    RTCPeerConnection.prototype.addIceCandidate = function (candidate, ...args) {
      if (candidate && candidate.candidate) {
        if (mode === 'disable-non-proxied-udp' && candidate.candidate.includes('typ host')) {
          return Promise.resolve();
        }
      }
      return origAddIceCandidate.apply(this, [candidate, ...args]);
    };
  }

  return { mode, spoofPublicIP, active: true };
}

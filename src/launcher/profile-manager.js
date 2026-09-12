/**
 * Aegis Profile Manager & Fingerprint Generator
 */
export class ProfileManager {
  constructor(storageKey = 'aegis_browser_profiles') {
    this.storageKey = storageKey;
    this.profiles = this.loadProfiles();
  }

  loadProfiles() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return this.getDefaultProfiles();
  }

  saveProfiles() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(this.profiles));
      }
    } catch (e) {
      console.warn('Unable to persist profiles', e);
    }
  }

  getDefaultProfiles() {
    return [
      {
        id: 'aegis-prof-01',
        name: 'Alpha Trader — US West',
        group: 'E-Commerce',
        os: 'Windows 11',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        screen: '1920x1080',
        cpuCores: 8,
        ramGb: 16,
        canvasSeed: 98124,
        webglVendor: 'Google Inc. (NVIDIA)',
        webglRenderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3080 Direct3D11 vs_5_0 ps_5_0, D3D11)',
        proxy: { enabled: true, type: 'socks5', host: '198.51.100.45', port: 1080, latencyMs: 42 },
        timezone: 'America/Los_Angeles',
        status: 'Active'
      },
      {
        id: 'aegis-prof-02',
        name: 'Analyst — UK Financial',
        group: 'Crypto Research',
        os: 'macOS Sonoma',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
        screen: '2560x1440',
        cpuCores: 10,
        ramGb: 32,
        canvasSeed: 41209,
        webglVendor: 'Apple Inc.',
        webglRenderer: 'Apple M2 Max',
        proxy: { enabled: true, type: 'http', host: '185.190.22.11', port: 8080, latencyMs: 86 },
        timezone: 'Europe/London',
        status: 'Active'
      },
      {
        id: 'aegis-prof-03',
        name: 'Stealth Scraping Node — Sydney',
        group: 'Data Collection',
        os: 'Ubuntu 24.04',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        screen: '1920x1080',
        cpuCores: 12,
        ramGb: 32,
        canvasSeed: 77312,
        webglVendor: 'Google Inc. (AMD)',
        webglRenderer: 'AMD Radeon RX 7900 XTX (RADV NAVI31)',
        proxy: { enabled: false, type: 'direct', host: '', port: '', latencyMs: 0 },
        timezone: 'Australia/Sydney',
        status: 'Idle'
      }
    ];
  }

  createProfile(profileData) {
    const newProfile = {
      id: 'aegis-prof-' + Date.now().toString(36),
      name: profileData.name || 'Untitled Profile',
      group: profileData.group || 'Default',
      os: profileData.os || 'Windows 11',
      userAgent: profileData.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      screen: profileData.screen || '1920x1080',
      cpuCores: Number(profileData.cpuCores) || 8,
      ramGb: Number(profileData.ramGb) || 16,
      canvasSeed: profileData.canvasSeed || Math.floor(Math.random() * 900000 + 100000),
      webglVendor: profileData.webglVendor || 'Google Inc. (NVIDIA)',
      webglRenderer: profileData.webglRenderer || 'ANGLE (NVIDIA, GeForce RTX 4070)',
      proxy: profileData.proxy || { enabled: false, type: 'direct' },
      timezone: profileData.timezone || 'UTC',
      status: 'Idle'
    };

    this.profiles.push(newProfile);
    this.saveProfiles();
    return newProfile;
  }

  cloneProfile(profileId) {
    const target = this.profiles.find(p => p.id === profileId);
    if (!target) return null;

    const cloned = JSON.parse(JSON.stringify(target));
    cloned.id = 'aegis-prof-' + Date.now().toString(36);
    cloned.name = `${target.name} (Copy)`;
    cloned.canvasSeed = Math.floor(Math.random() * 900000 + 100000); // Unique canvas noise
    this.profiles.push(cloned);
    this.saveProfiles();
    return cloned;
  }

  deleteProfile(profileId) {
    this.profiles = this.profiles.filter(p => p.id !== profileId);
    this.saveProfiles();
    return this.profiles;
  }

  generateRandomFingerprint(targetOS = 'Windows 11') {
    const screens = ['1920x1080', '2560x1440', '1920x1200', '1680x1050'];
    const cores = [4, 6, 8, 12, 16];
    const rams = [8, 16, 32];
    const gpus = [
      { vendor: 'Google Inc. (NVIDIA)', renderer: 'ANGLE (NVIDIA, GeForce RTX 4080 Direct3D11 vs_5_0 ps_5_0)' },
      { vendor: 'Google Inc. (NVIDIA)', renderer: 'ANGLE (NVIDIA, GeForce RTX 3070 Direct3D11 vs_5_0 ps_5_0)' },
      { vendor: 'Google Inc. (AMD)', renderer: 'ANGLE (AMD, AMD Radeon RX 6800 XT Direct3D11 vs_5_0 ps_5_0)' },
      { vendor: 'Apple Inc.', renderer: 'Apple M3 Pro' }
    ];

    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    const chosenGpu = targetOS.includes('macOS') ? gpus[3] : pick(gpus.slice(0, 3));

    return {
      os: targetOS,
      userAgent: targetOS.includes('macOS')
        ? 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
        : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      screen: pick(screens),
      cpuCores: pick(cores),
      ramGb: pick(rams),
      canvasSeed: Math.floor(Math.random() * 900000 + 100000),
      webglVendor: chosenGpu.vendor,
      webglRenderer: chosenGpu.renderer
    };
  }
}

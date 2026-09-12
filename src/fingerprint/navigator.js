/**
 * Aegis Navigator & Hardware Spoofing Engine
 * Properly patches Navigator.prototype.webdriver to prevent hasOwnProperty leak,
 * spoofs CPU cores, RAM size, platform, languages, user-agent, and realistic plugins.
 */
export function injectNavigatorSpoof({
  userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  platform = 'Win32',
  hardwareConcurrency = 8,
  deviceMemory = 16,
  languages = ['en-US', 'en']
} = {}) {
  if (typeof navigator === 'undefined') return {};

  const navProto = Object.getPrototypeOf(navigator) || Navigator.prototype;

  // Mask webdriver on prototype so navigator.hasOwnProperty('webdriver') is false
  try {
    delete navigator.webdriver;
  } catch {}

  Object.defineProperty(navProto, 'webdriver', {
    get: () => false,
    configurable: true,
    enumerable: true
  });

  // Hardware concurrency (CPU cores)
  Object.defineProperty(navProto, 'hardwareConcurrency', {
    get: () => Number(hardwareConcurrency),
    configurable: true
  });

  // Device memory (RAM in GB)
  Object.defineProperty(navProto, 'deviceMemory', {
    get: () => Number(deviceMemory),
    configurable: true
  });

  // Platform
  Object.defineProperty(navProto, 'platform', {
    get: () => platform,
    configurable: true
  });

  // Languages
  Object.defineProperty(navProto, 'languages', {
    get: () => languages,
    configurable: true
  });

  // User Agent
  Object.defineProperty(navProto, 'userAgent', {
    get: () => userAgent,
    configurable: true
  });

  // Emulate standard Chrome plugins to defeat headless 0-plugin checks
  if (!navigator.plugins || navigator.plugins.length === 0) {
    const mockPlugins = [
      { name: 'PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
      { name: 'Chrome PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
      { name: 'Chromium PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' }
    ];
    Object.defineProperty(navProto, 'plugins', {
      get: () => mockPlugins,
      configurable: true
    });
  }

  return {
    hardwareConcurrency,
    deviceMemory,
    platform,
    languages,
    userAgent
  };
}

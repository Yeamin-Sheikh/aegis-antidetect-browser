/**
 * Aegis Navigator & Hardware Spoofing Engine
 * Removes navigator.webdriver flag, spoofs CPU cores, RAM size, platform, and user-agent.
 */
export function injectNavigatorSpoof({
  userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  platform = 'Win32',
  hardwareConcurrency = 8,
  deviceMemory = 16,
  languages = ['en-US', 'en']
} = {}) {
  if (typeof navigator === 'undefined') return;

  // Mask webdriver
  delete Object.getPrototypeOf(navigator).webdriver;
  Object.defineProperty(navigator, 'webdriver', {
    get: () => false,
    configurable: true
  });

  // Hardware concurrency (CPU cores)
  Object.defineProperty(navigator, 'hardwareConcurrency', {
    get: () => Number(hardwareConcurrency),
    configurable: true
  });

  // Device memory (RAM in GB)
  Object.defineProperty(navigator, 'deviceMemory', {
    get: () => Number(deviceMemory),
    configurable: true
  });

  // Platform
  Object.defineProperty(navigator, 'platform', {
    get: () => platform,
    configurable: true
  });

  // Languages
  Object.defineProperty(navigator, 'languages', {
    get: () => languages,
    configurable: true
  });

  // User Agent
  Object.defineProperty(navigator, 'userAgent', {
    get: () => userAgent,
    configurable: true
  });

  return {
    hardwareConcurrency,
    deviceMemory,
    platform,
    languages,
    userAgent
  };
}

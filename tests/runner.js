import assert from 'node:assert';
import { ProfileManager } from '../src/launcher/profile-manager.js';
import { injectCanvasSpoof } from '../src/fingerprint/canvas.js';
import { injectWebGLSpoof } from '../src/fingerprint/webgl.js';
import { injectNavigatorSpoof } from '../src/fingerprint/navigator.js';
import { generateChromiumFlags } from '../bin/aegis-launch.js';
import { buildInjectionScript } from '../src/fingerprint/engine.js';

console.log('--- Running Aegis Anti-Detect Browser Tests ---');

// Mock localStorage
global.localStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

// Test 1: Profile Manager & Defaults
const mgr = new ProfileManager('test_aegis_profiles');
assert.ok(mgr.profiles.length >= 3, 'Should have default initial profiles');
const first = mgr.profiles[0];
assert.ok(first.id);
assert.ok(first.canvasSeed);
console.log('✓ Profile manager default initialization verified');

// Test 2: Profile Cloning
const cloned = mgr.cloneProfile(first.id);
assert.notStrictEqual(cloned.id, first.id, 'Cloned profile must have new unique ID');
assert.notStrictEqual(cloned.canvasSeed, first.canvasSeed, 'Cloned profile must have unique canvas noise seed');
assert.strictEqual(cloned.name, `${first.name} (Copy)`);
console.log('✓ Profile cloning with unique fingerprint seed verified');

// Test 3: Random Fingerprint Generator
const rand = mgr.generateRandomFingerprint('macOS Sonoma');
assert.strictEqual(rand.os, 'macOS Sonoma');
assert.ok(rand.userAgent.includes('Macintosh'));
assert.ok(rand.cpuCores >= 4);
console.log('✓ Random fingerprint generator matches target OS architecture');

// Test 4: WebGL Spoofing mock
const webglRes = injectWebGLSpoof({ vendor: 'Google Inc. (NVIDIA)', renderer: 'ANGLE RTX 4090' });
assert.strictEqual(webglRes.vendor, 'Google Inc. (NVIDIA)');
assert.strictEqual(webglRes.renderer, 'ANGLE RTX 4090');
console.log('✓ WebGL vendor/renderer spoofing module verified');

// Test 5: Chromium Launch Flags Generation
const pWithProxy = {
  id: 'test-node-1',
  screen: '1920x1080',
  userAgent: 'AegisTestUserAgent/1.0',
  proxy: { enabled: true, type: 'socks5', host: '127.0.0.1', port: 9050 }
};
const flags = generateChromiumFlags(pWithProxy);
assert.ok(flags.some(f => f.includes('--user-data-dir=./userData/test-node-1')));
assert.ok(flags.some(f => f.includes('--proxy-server=socks5://127.0.0.1:9050')));
assert.ok(flags.some(f => f.includes('--disable-blink-features=AutomationControlled')));
assert.ok(flags.some(f => f.includes('--window-size=1920,1080')));
console.log('✓ Chromium isolated launch flags generation verified');

// Test 6: Injection Script Builder
const script = buildInjectionScript(first);
assert.ok(script.includes('injectCanvasSpoof'));
assert.ok(script.includes('injectWebGLSpoof'));
assert.ok(script.includes('injectNavigatorSpoof'));
console.log('✓ Page injection script string compilation verified');

console.log('\nAll Aegis Anti-Detect Browser tests passed successfully! (6/6)');

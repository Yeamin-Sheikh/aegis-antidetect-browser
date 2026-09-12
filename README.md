# Aegis anti-detect browser

An open source anti-detect browser core and profile management dashboard. Designed for privacy researchers, automated testing, web scraping, and multi-profile session isolation.

## Architectural overview

Modern bot detection systems (Cloudflare Turnstile, Datadome, CreepJS, FingerprintJS) harvest hardware and canvas entropy to cluster user sessions. Aegis injects mathematical perturbation at the JavaScript runtime level while running isolated Chromium instances with discrete storage paths.

## Key features

- **Deterministic canvas noise:** Injects seeded sub-pixel noise into `HTMLCanvasElement.prototype.toDataURL`, `toBlob`, and `CanvasRenderingContext2D.prototype.getImageData`. Generates unique canvas hashes per profile with full method parity, defeating canvas lying detection.
- **WebGL hardware masking:** Spoofs `UNMASKED_VENDOR_WEBGL` and `UNMASKED_RENDERER_WEBGL` strings to emulate real desktop GPUs (NVIDIA RTX 4090, Apple M3, AMD Radeon).
- **Navigator and hardware virtualization:** Controls `hardwareConcurrency` (CPU cores), `deviceMemory` (RAM), `platform`, languages, realistic `plugins` array, and removes `navigator.webdriver` on prototype chain.
- **WebRTC leak defense:** Intercepts `onicecandidate`, event listeners, and injects Chromium `--force-webrtc-ip-handling-policy=disable_non_proxied_udp` to eliminate private LAN and non-proxied UDP leaks.
- **Isolated profile manager:** Creates, clones, and stores browser profiles with dedicated user-data directories, proxies (SOCKS5/HTTP), and display resolutions.
- **CLI launcher with physical browser launch:** Command line utility that finds local Chrome/Edge installations and can spawn real isolated browser instances via `node bin/aegis-launch.js --launch`.
- **Interactive web dashboard:** Visual dashboard to configure containers, test fingerprint evasion, and export profile configurations to JSON.

## Project structure

```
aegis-antidetect-browser/
├── assets/
│   ├── images/
│   │   └── hero.jpg
│   └── svgs/
│       ├── logo.svg
│       └── icons.svg
├── bin/
│   └── aegis-launch.js
├── css/
│   ├── main.css
│   └── components.css
├── js/
│   └── app.js
├── src/
│   ├── fingerprint/
│   │   ├── canvas.js
│   │   ├── engine.js
│   │   ├── navigator.js
│   │   ├── webgl.js
│   │   └── webrtc.js
│   └── launcher/
│       └── profile-manager.js
├── tests/
│   └── runner.js
├── config.json
├── index.html
├── package.json
└── README.md
```

## Running the dashboard locally

Serve the static web dashboard with Python or Node:

```powershell
# Using Python
python -m http.server 8000

# Or using Node
npm start
```

Visit `http://localhost:8000` to launch the profile management interface.

## Command line usage

Generate Chromium launch parameters for a profile:

```powershell
node bin/aegis-launch.js
```

Example Playwright script integration:

```javascript
import { chromium } from 'playwright';
import { generateChromiumFlags } from './bin/aegis-launch.js';
import { buildInjectionScript } from './src/fingerprint/engine.js';

const profile = {
  id: 'worker-01',
  screen: '1920x1080',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...',
  canvasSeed: 489201,
  cpuCores: 8,
  ramGb: 16
};

const flags = generateChromiumFlags(profile);
const context = await chromium.launchPersistentContext('./userData/worker-01', {
  args: flags
});

await context.addInitScript(buildInjectionScript(profile));
const page = await context.newPage();
await page.goto('https://browserleaks.com/canvas');
```

## Running tests

Run the verification test suite:

```powershell
npm test
# or
node tests/runner.js
```

## License

MIT License.

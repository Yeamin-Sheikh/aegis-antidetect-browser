#!/usr/bin/env node

/**
 * Aegis Browser CLI Launcher
 * Launches isolated Chromium instances with customized hardware flags and proxy profiles.
 */
import { ProfileManager } from '../src/launcher/profile-manager.js';
import { buildInjectionScript } from '../src/fingerprint/engine.js';

export function generateChromiumFlags(profile, dataDir = './userData') {
  const flags = [
    `--user-data-dir=${dataDir}/${profile.id}`,
    '--disable-blink-features=AutomationControlled',
    '--no-first-run',
    '--no-default-browser-check',
    `--window-size=${(profile.screen || '1920x1080').replace('x', ',')}`,
    `--user-agent="${profile.userAgent}"`
  ];

  if (profile.proxy && profile.proxy.enabled && profile.proxy.host) {
    flags.push(`--proxy-server=${profile.proxy.type}://${profile.proxy.host}:${profile.proxy.port}`);
  }

  return flags;
}

if (process.argv[1] && process.argv[1].includes('aegis-launch.js')) {
  console.log('=== Aegis Open Source Anti-Detect Browser CLI ===');
  const mgr = new ProfileManager();
  const profile = mgr.profiles[0];
  console.log(`Configuring session for profile: [${profile.name}]`);
  const flags = generateChromiumFlags(profile);
  console.log('Generated Chromium launch flags:');
  console.log(flags.join(' '));
  console.log('\nInjection script payload ready for page evaluation.');
}

#!/usr/bin/env node

/**
 * Aegis Browser CLI Launcher
 * Launches isolated Chromium instances with customized hardware flags, WebRTC leak defense, and proxy profiles.
 */
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { ProfileManager } from '../src/launcher/profile-manager.js';
import { buildInjectionScript } from '../src/fingerprint/engine.js';

export function findChromiumBinary() {
  const candidatePaths = [
    // Windows Chrome & Edge locations
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA ? `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe` : null,
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    // Linux locations
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    // macOS locations
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
  ].filter(Boolean);

  for (const binPath of candidatePaths) {
    if (existsSync(binPath)) {
      return binPath;
    }
  }
  return null;
}

export function generateChromiumFlags(profile, dataDir = './userData') {
  const flags = [
    `--user-data-dir=${dataDir}/${profile.id}`,
    '--disable-blink-features=AutomationControlled',
    '--no-first-run',
    '--no-default-browser-check',
    // WebRTC IP leak prevention flags
    '--force-webrtc-ip-handling-policy=disable_non_proxied_udp',
    '--enforce-webrtc-ip-permission-check',
    `--window-size=${(profile.screen || '1920x1080').replace('x', ',')}`,
    `--user-agent=${profile.userAgent}`
  ];

  if (profile.proxy && profile.proxy.enabled && profile.proxy.host) {
    flags.push(`--proxy-server=${profile.proxy.type}://${profile.proxy.host}:${profile.proxy.port}`);
  }

  return flags;
}

export function launchProfile(profile, options = {}) {
  const flags = generateChromiumFlags(profile, options.dataDir);
  const binPath = options.executablePath || findChromiumBinary();

  if (!binPath) {
    return {
      success: false,
      message: 'No supported Chromium or Edge binary detected on system.',
      flags
    };
  }

  const targetUrl = options.url || 'https://browserleaks.com/webrtc';
  const args = [...flags, targetUrl];

  const proc = spawn(binPath, args, {
    detached: true,
    stdio: 'ignore'
  });
  proc.unref();

  return {
    success: true,
    pid: proc.pid,
    binPath,
    flags
  };
}

if (process.argv[1] && process.argv[1].includes('aegis-launch.js')) {
  console.log('=== Aegis Open Source Anti-Detect Browser CLI ===');
  const mgr = new ProfileManager();
  const profile = mgr.profiles[0];
  console.log(`Configuring session for profile: [${profile.name}]`);
  
  const flags = generateChromiumFlags(profile);
  console.log('Generated Chromium launch flags (with WebRTC leak defenses):');
  console.log(flags.join(' '));

  if (process.argv.includes('--launch')) {
    console.log('\nSpawning isolated Chromium process...');
    const res = launchProfile(profile);
    if (res.success) {
      console.log(`✓ Process launched successfully (PID: ${res.pid}) via: ${res.binPath}`);
    } else {
      console.warn(`! Launch note: ${res.message}`);
    }
  } else {
    console.log('\nInjection script payload ready for page evaluation.');
    console.log('Tip: Run with --launch to start the physical browser instance.');
  }
}

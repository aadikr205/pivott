/**
 * Pivott Tunnel Watchdog & Auto-Healer (Tunnelmole Clean Architecture)
 * 
 * 1. Uses Tunnelmole programmatic API: Zero browser warnings, zero phishing interstitials.
 * 2. Directly connects browser to Pivott auto-login and single-page app shell.
 * 3. Works across all networks (Jio, Airtel, Vi, 4G, 5G, Wi-Fi).
 * 4. Auto-generates local high-res QR codes via 'qrcode' package.
 * 5. Health checks every 30s with auto-healing restart if ever disconnected.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const QRCode = require('qrcode');

const TUNNEL_INFO_FILE = path.join(__dirname, 'tunnel_info.json');
const ARTIFACT_DIR = 'C:\\Users\\Entertainment\\.gemini\\antigravity-ide\\brain\\5a37deb8-9978-4b48-8239-cd89c0f526f7';
const PUBLIC_DIR = path.join(__dirname, 'public');

if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

let currentGlobalUrl = '';
let isRestarting = false;
let restartTimer = null;

process.on('uncaughtException', (err) => {
  console.warn('[Watchdog] Handled uncaughtException:', err.message);
  scheduleRestart('uncaught_exception', 5000);
});

process.on('unhandledRejection', (reason) => {
  console.warn('[Watchdog] Handled unhandledRejection:', reason);
});

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  let fallbackIp = 'localhost';
  for (const name of Object.keys(interfaces)) {
    const isWifi = name.toLowerCase().includes('wi-fi') || name.toLowerCase().includes('wireless') || name.toLowerCase().includes('wlan');
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        if (isWifi) return iface.address;
        if (fallbackIp === 'localhost') fallbackIp = iface.address;
      }
    }
  }
  return fallbackIp;
}

async function generateQrCodes(globalUrl, localUrl) {
  try {
    const targets = [
      { file: 'qrcode_phone_global.png', url: globalUrl },
      { file: 'qrcode_latest.png', url: globalUrl },
      { file: 'qrcode_wifi_latest.png', url: localUrl }
    ];

    for (const item of targets) {
      if (!item.url) continue;

      if (fs.existsSync(ARTIFACT_DIR)) {
        await QRCode.toFile(path.join(ARTIFACT_DIR, item.file), item.url, {
          width: 500,
          margin: 2,
          color: { dark: '#000000', light: '#ffffff' }
        });
      }

      await QRCode.toFile(path.join(PUBLIC_DIR, item.file), item.url, {
        width: 500,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      });
    }
    console.log('[Watchdog] Generated clean QR codes successfully.');
  } catch (err) {
    console.error('[Watchdog] QR Generation error:', err.message);
  }
}

async function updateTunnelInfo(globalUrl) {
  currentGlobalUrl = globalUrl;
  const localIp = getLocalIp();
  const globalLoginUrl = globalUrl ? `${globalUrl}/auto-login` : '';
  const localLoginUrl = `http://${localIp}:5000/auto-login`;

  const info = {
    globalUrl: globalLoginUrl,
    globalBase: globalUrl,
    localUrl: localLoginUrl,
    localIp,
    updatedAt: new Date().toISOString(),
    status: globalUrl ? 'active' : 'connecting',
    provider: 'tunnelmole'
  };

  fs.writeFileSync(TUNNEL_INFO_FILE, JSON.stringify(info, null, 2));
  console.log(`[Watchdog] Tunnel Info Updated:\n  🌐 Global => ${globalLoginUrl || 'connecting...'}\n  🏠 Local  => ${localLoginUrl}`);

  await generateQrCodes(globalLoginUrl, localLoginUrl);
}

async function startTunnel() {
  if (isRestarting) return;

  try {
    console.log('[Watchdog] Starting Tunnelmole tunnel on port 5000...');
    const { tunnelmole } = require('tunnelmole/dist/src/index.js');
    const url = await tunnelmole({ port: 5000 });
    
    if (url && url.startsWith('http')) {
      console.log(`[Watchdog] >>> CLEAN TUNNEL URL ACQUIRED: ${url} <<<`);
      await updateTunnelInfo(url);
    } else {
      throw new Error('Invalid URL returned from tunnelmole');
    }
  } catch (err) {
    console.error('[Watchdog] Tunnel startup error:', err.message);
    scheduleRestart('startup_failed', 5000);
  }
}

function scheduleRestart(reason, delayMs = 5000) {
  if (restartTimer) clearTimeout(restartTimer);
  isRestarting = true;
  console.log(`[Watchdog] Scheduling restart in ${(delayMs / 1000).toFixed(0)}s (Reason: ${reason})...`);
  restartTimer = setTimeout(async () => {
    isRestarting = false;
    await startTunnel();
  }, delayMs);
}

// Health check ping every 30 seconds
setInterval(async () => {
  if (!currentGlobalUrl || isRestarting) return;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(`${currentGlobalUrl}/api/health`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Pivott-Watchdog/3.0' }
    });
    clearTimeout(timeout);

    if (!res.ok && res.status >= 500) {
      console.warn(`[Watchdog] Health check non-ok status: ${res.status}`);
    }
  } catch (err) {
    console.warn(`[Watchdog] Health check failed for ${currentGlobalUrl}:`, err.message);
    scheduleRestart('health_check_failed', 5000);
  }
}, 30000);

// Initialize
const initialIp = getLocalIp();
console.log(`[Watchdog] Initializing. Local IP detected: ${initialIp}`);
updateTunnelInfo('');
startTunnel();

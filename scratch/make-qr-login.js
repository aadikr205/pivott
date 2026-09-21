const fs = require('fs');
const path = require('path');
const os = require('os');

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '172.25.49.89';
}

async function downloadQr(url, filename) {
  const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=15&data=${encodeURIComponent(url)}`;
  const res = await fetch(qrApi);
  if (!res.ok) throw new Error('QR API failed: ' + res.status);
  const buffer = Buffer.from(await res.arrayBuffer());
  
  const destPath = path.join('C:\\Users\\Entertainment\\.gemini\\antigravity-ide\\brain\\5a37deb8-9978-4b48-8239-cd89c0f526f7', filename);
  fs.writeFileSync(destPath, buffer);
  console.log(`Saved QR to: ${destPath} (Target: ${url})`);
  
  const serverPublicDir = path.resolve(__dirname, '..', 'server', 'public');
  if (!fs.existsSync(serverPublicDir)) fs.mkdirSync(serverPublicDir, { recursive: true });
  fs.writeFileSync(path.join(serverPublicDir, filename), buffer);
}

async function main() {
  const globalUrl = 'https://hair-permission-scheduled-family.trycloudflare.com/auto-login';
  const localIp = getLocalIp();
  const wifiUrl = `http://${localIp}:5000/auto-login`;

  console.log('Generating QR code for Global Phone Access:', globalUrl);
  await downloadQr(globalUrl, 'qrcode_phone_global.png');
  await downloadQr(globalUrl, 'qrcode_latest.png');

  console.log('Generating QR code for Local Wi-Fi Access:', wifiUrl);
  await downloadQr(wifiUrl, 'qrcode_phone_wifi.png');
  await downloadQr(wifiUrl, 'qrcode_wifi_latest.png');

  console.log('All QR codes generated and saved successfully!');
}

main().catch(err => {
  console.error('Failed to generate QR codes:', err);
  process.exit(1);
});

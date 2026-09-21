require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Global process exception traps to prevent server process crash
process.on('uncaughtException', err => {
  console.error('[CRITICAL UNCAUGHT EXCEPTION]:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL UNHANDLED REJECTION]:', reason);
});

const authRouter = require('./routes/auth');
const onboardingRouter = require('./routes/onboarding');
const scheduleRouter = require('./routes/schedule');
const topicsRouter = require('./routes/topics');
const quizRouter = require('./routes/quiz');
const progressRouter = require('./routes/progress');
const aiRouter = require('./routes/ai');
const pyqRouter = require('./routes/pyq');
const notesRouter = require('./routes/notes');
const doubtSolverRouter = require('./routes/doubt-solver');
const chatRouter = require('./routes/chat');
const activityRouter = require('./routes/activity');
const selfTimetableRouter = require('./routes/self-timetable');
const notificationsRouter = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check with uptime, memory, and database status
const getHealthInfo = () => ({
  status: 'ok',
  uptimeSeconds: Math.floor(process.uptime()),
  memoryRssMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
  timestamp: new Date().toISOString(),
  app: 'Pivott Backend'
});
app.get('/health', (req, res) => res.json(getHealthInfo()));
app.get('/api/health', (req, res) => res.json(getHealthInfo()));

// Client Error Telemetry Endpoint
app.post('/api/logs/client-error', (req, res) => {
  const errorInfo = req.body || {};
  console.error('[CLIENT ERROR TELEMETRY]:', errorInfo);
  try {
    const logDir = path.join(__dirname, 'data');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(path.join(logDir, 'client_errors.log'), JSON.stringify(errorInfo) + '\n');
  } catch (e) {}
  res.json({ ok: true });
});

// Mount routes on both /api/ and direct paths for 100% Section 9 spec adherence
const mountRoute = (routePath, router) => {
  app.use(routePath, router);
  app.use(`/api${routePath}`, router);
};

mountRoute('/auth', authRouter);
mountRoute('/onboarding', onboardingRouter);
mountRoute('/schedule', scheduleRouter);
mountRoute('/topics', topicsRouter);
mountRoute('/quiz', quizRouter);
mountRoute('/progress', progressRouter);
mountRoute('/ai', aiRouter);
mountRoute('/pyq', pyqRouter);
mountRoute('/notes', notesRouter);
mountRoute('/doubt-solver', doubtSolverRouter);
mountRoute('/chat', chatRouter);
mountRoute('/activity', activityRouter);
mountRoute('/self-timetable', selfTimetableRouter);
mountRoute('/notifications', notificationsRouter);

// Direct 1-click auto-login alias for QR codes
app.get('/auto-login', (req, res) => res.redirect('/auth/auto-login'));

// API endpoint to get current tunnel and local IP info
app.get('/api/tunnel-status', (req, res) => {
  const tunnelFile = path.join(__dirname, 'tunnel_info.json');
  if (fs.existsSync(tunnelFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(tunnelFile, 'utf8'));
      return res.json(data);
    } catch (e) {}
  }
  res.json({ globalUrl: '', localUrl: 'http://localhost:5000/auto-login', status: 'initializing' });
});

// Dedicated Mobile Login Hub page with live QR codes & auto-updating status
app.get('/mobile-login', (req, res) => {
  const tunnelFile = path.join(__dirname, 'tunnel_info.json');
  let info = { globalUrl: '', localUrl: `http://localhost:5000/auto-login`, localIp: 'localhost', status: 'connecting' };
  if (fs.existsSync(tunnelFile)) {
    try { info = JSON.parse(fs.readFileSync(tunnelFile, 'utf8')); } catch(e) {}
  }

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pivott — Mobile Login & QR Code Hub</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0b0f19; color: #f1f5f9; min-height: 100vh; padding: 32px 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .container { max-width: 820px; width: 100%; }
    .header { text-align: center; margin-bottom: 28px; }
    .badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; background: rgba(20, 184, 166, 0.12); border: 1px solid rgba(20, 184, 166, 0.3); border-radius: 9999px; color: #2dd4bf; font-size: 0.85rem; font-weight: 600; margin-bottom: 12px; }
    .pulse { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 10px #10b981; animation: pulse 2s infinite; }
    @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
    h1 { font-size: 2rem; font-weight: 800; letter-spacing: -0.025em; margin-bottom: 8px; }
    p.subtitle { color: #94a3b8; font-size: 0.95rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; margin-top: 24px; }
    .card { background: #131d2e; border: 1px solid #1e293b; border-radius: 20px; padding: 24px; text-align: center; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); display: flex; flex-direction: column; align-items: center; justify-content: space-between; position: relative; }
    .card-tag { position: absolute; top: 16px; right: 16px; font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: 8px; text-transform: uppercase; }
    .tag-green { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .tag-blue { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
    .qr-box { background: white; padding: 14px; border-radius: 16px; margin: 16px 0; box-shadow: 0 8px 16px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; }
    .qr-box img { width: 220px; height: 220px; display: block; border-radius: 8px; }
    .card h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 6px; }
    .card p.desc { font-size: 0.85rem; color: #94a3b8; margin-bottom: 14px; line-height: 1.4; }
    .link-input { width: 100%; background: #0b0f19; border: 1px solid #334155; border-radius: 10px; padding: 10px 12px; font-family: monospace; font-size: 0.8rem; color: #38bdf8; word-break: break-all; margin-bottom: 12px; user-select: all; }
    .btn { display: inline-flex; align-items: center; justify-content: center; width: 100%; padding: 12px 20px; border-radius: 12px; font-size: 0.95rem; font-weight: 600; text-decoration: none; transition: all 0.2s; cursor: pointer; border: none; }
    .btn-teal { background: #0d9488; color: white; }
    .btn-teal:hover { background: #0f766e; }
    .btn-outline { background: transparent; border: 1px solid #334155; color: #f1f5f9; margin-top: 8px; }
    .btn-outline:hover { background: #1e293b; }
    .footer-note { text-align: center; margin-top: 28px; color: #64748b; font-size: 0.85rem; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge"><div class="pulse"></div> 24/7 Resilient Auto-Healing Enabled</div>
      <h1>Pivott Mobile Login Hub</h1>
      <p class="subtitle">Scan either QR code below from your phone camera or Google Lens to log in instantly without password.</p>
    </div>

    <div class="grid">
      <!-- Local Wi-Fi / Hotspot (Never expires) -->
      <div class="card">
        <span class="card-tag tag-green">⭐ Best & Permanent</span>
        <div>
          <h3>1. Local Wi-Fi / Hotspot</h3>
          <p class="desc">Connect phone to same Wi-Fi or laptop's Hotspot.<br><strong style="color:#34d399">Never expires — works 24/7 offline with zero lag.</strong></p>
          <div class="qr-box">
            <img id="qr-wifi" src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=8&data=${encodeURIComponent(info.localUrl)}" alt="Wi-Fi QR Code">
          </div>
          <div class="link-input" id="link-wifi-text">${info.localUrl}</div>
        </div>
        <div style="width: 100%;">
          <a class="btn btn-teal" id="link-wifi" href="${info.localUrl}" target="_blank">Open Local Link</a>
          <button class="btn btn-outline" onclick="navigator.clipboard.writeText(document.getElementById('link-wifi-text').innerText); alert('Copied Local Link!');">📋 Copy Link</button>
        </div>
      </div>

      <!-- Global Internet (Anywhere via 4G/5G) -->
      <div class="card">
        <span class="card-tag tag-blue">🌐 Worldwide 4G/5G</span>
        <div>
          <h3>2. Global Internet Link</h3>
          <p class="desc">Works from anywhere on mobile data (Jio/Airtel/Vi).<br><strong style="color:#38bdf8">Auto-healing watchdog rotates tunnels automatically.</strong></p>
          <div class="qr-box">
            <img id="qr-global" src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=8&data=${encodeURIComponent(info.globalUrl || 'https://pivott.app')}" alt="Global QR Code">
          </div>
          <div class="link-input" id="link-global-text">${info.globalUrl || 'Connecting to Cloudflare...'}</div>
        </div>
        <div style="width: 100%;">
          <a class="btn btn-teal" id="link-global" href="${info.globalUrl || '#'}" target="_blank">Open Global Link</a>
          <button class="btn btn-outline" onclick="navigator.clipboard.writeText(document.getElementById('link-global-text').innerText); alert('Copied Global Link!');">📋 Copy Link</button>
        </div>
      </div>
    </div>

    <div class="footer-note">
      💡 <strong>Tip for 5 to 8 Hours:</strong> If you keep your laptop connected to your phone's Hotspot or home Wi-Fi, <strong>Option 1 (Local Link)</strong> will NEVER expire even if you leave it open all day and night!
    </div>
  </div>

  <script>
    // Auto-update every 10 seconds if tunnel rotates
    setInterval(async () => {
      try {
        const res = await fetch('/api/tunnel-status');
        const data = await res.json();
        if (data.globalUrl) {
          document.getElementById('link-global').href = data.globalUrl;
          document.getElementById('link-global-text').innerText = data.globalUrl;
          document.getElementById('qr-global').src = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=8&data=' + encodeURIComponent(data.globalUrl);
        }
        if (data.localUrl) {
          document.getElementById('link-wifi').href = data.localUrl;
          document.getElementById('link-wifi-text').innerText = data.localUrl;
          document.getElementById('qr-wifi').src = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=8&data=' + encodeURIComponent(data.localUrl);
        }
      } catch(e) {}
    }, 10000);
  </script>
</body>
</html>`);
});

// Serve uploaded files (e.g. profile photos)
const uploadsPath = path.join(__dirname, 'public/uploads');
app.use('/uploads', express.static(uploadsPath));
app.use('/public/uploads', express.static(uploadsPath));

// Serve static client build if present (for unified deployment)
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('index.html') || filePath.endsWith('sw.js')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else if (filePath.includes('assets')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

app.use((req, res, next) => {
  if (
    req.path.startsWith('/api') ||
    req.path.startsWith('/uploads') ||
    req.path.startsWith('/public') ||
    req.path.startsWith('/health') ||
    req.path.startsWith('/auth') ||
    req.path.startsWith('/schedule') ||
    req.path.startsWith('/topics') ||
    req.path.startsWith('/quiz') ||
    req.path.startsWith('/progress') ||
    req.path.startsWith('/onboarding') ||
    req.path.startsWith('/ai') ||
    req.path.startsWith('/pyq') ||
    req.path.startsWith('/notes') ||
    req.path.startsWith('/doubt-solver') ||
    req.path.startsWith('/activity') ||
    req.path.startsWith('/self-timetable') ||
    req.path.startsWith('/notifications')
  ) {
    return next();
  }
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(clientDistPath, 'index.html'), err => {
    if (err) next();
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error occurred.' });
});

app.listen(PORT, () => {
  console.log(`[Pivott API] Server running on http://localhost:${PORT}`);
});

module.exports = app;

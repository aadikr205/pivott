/**
 * Pivott Backend Process Supervisor
 * 
 * Auto-heals and restarts the backend process if an uncaught failure or crash occurs.
 */

const { spawn } = require('child_process');
const path = require('path');

const SERVER_SCRIPT = path.join(__dirname, 'index.js');
let child = null;
let crashTimes = [];
let isShuttingDown = false;

function startServer() {
  if (isShuttingDown) return;

  const now = Date.now();
  crashTimes = crashTimes.filter(t => now - t < 10000);

  if (crashTimes.length >= 5) {
    console.error('[Pivott Supervisor] Server crashed 5 times in 10 seconds. Pausing 15s before restart...');
    setTimeout(() => {
      crashTimes = [];
      startServer();
    }, 15000);
    return;
  }

  console.log('[Pivott Supervisor] Launching Pivott backend server...');
  child = spawn(process.execPath, [SERVER_SCRIPT], {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
    env: process.env
  });

  child.on('exit', (code, signal) => {
    console.warn(`[Pivott Supervisor] Backend process exited (Code: ${code}, Signal: ${signal}).`);
    if (!isShuttingDown) {
      crashTimes.push(Date.now());
      console.log('[Pivott Supervisor] Auto-restarting server in 1 second...');
      setTimeout(startServer, 1000);
    }
  });

  child.on('error', (err) => {
    console.error('[Pivott Supervisor] Failed to spawn child process:', err);
    if (!isShuttingDown) {
      setTimeout(startServer, 2000);
    }
  });
}

function cleanExit() {
  isShuttingDown = true;
  console.log('[Pivott Supervisor] Shutting down gracefully...');
  if (child) {
    try {
      child.kill('SIGINT');
    } catch {}
  }
  process.exit(0);
}

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);

startServer();

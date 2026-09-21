import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { registerServiceWorker } from './registerServiceWorker';

// Register PWA service worker with update listeners
registerServiceWorker();

const API_BASE = (import.meta.env?.VITE_API_URL as string) || '';

// Global uncaught error listener to report unexpected asynchronous crashes
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('[Pivott Global Window Error]:', event.error || event.message);
    try {
      fetch(`${API_BASE}/api/logs/client-error`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: event.message || 'Window Error',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      }).catch(() => {});
    } catch {}
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Pivott Unhandled Promise Rejection]:', event.reason);
    try {
      const reasonMsg = event.reason instanceof Error ? event.reason.message : String(event.reason);
      const stack = event.reason instanceof Error ? event.reason.stack : undefined;
      fetch(`${API_BASE}/api/logs/client-error`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Unhandled Rejection: ${reasonMsg}`,
          stack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      }).catch(() => {});
    } catch {}
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary level="root">
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

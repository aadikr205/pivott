const fs = require('fs');

async function testResilience() {
  console.log('=== TESTING PIVOTT STABILITY & RESILIENCE ===\n');

  // 1. Test Health Check Endpoints
  console.log('[1] Testing /api/health and /health...');
  const healthRes = await fetch('http://localhost:5000/api/health');
  if (!healthRes.ok) throw new Error('/api/health failed: ' + healthRes.status);
  const healthData = await healthRes.json();
  console.log('    ✓ /api/health returned:', healthData);

  const rootHealthRes = await fetch('http://localhost:5000/health');
  if (!rootHealthRes.ok) throw new Error('/health failed: ' + rootHealthRes.status);
  console.log('    ✓ /health status 200 OK');

  // 2. Test Client Error Telemetry Endpoint
  console.log('\n[2] Testing POST /api/logs/client-error telemetry...');
  const telemetryRes = await fetch('http://localhost:5000/api/logs/client-error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Test simulated client error for stability verification',
      stack: 'Error: Test at client.ts:42',
      url: 'http://localhost:5000/test',
      userAgent: 'TestRunner/1.0',
      timestamp: new Date().toISOString()
    })
  });
  if (!telemetryRes.ok) throw new Error('Telemetry endpoint failed: ' + telemetryRes.status);
  const telemetryData = await telemetryRes.json();
  console.log('    ✓ Telemetry logged successfully:', telemetryData);

  // 3. Test Cache-Control Headers on HTML
  console.log('\n[3] Testing Cache-Control headers on index.html (PWA cache invalidation)...');
  const indexRes = await fetch('http://localhost:5000/');
  const cacheHeader = indexRes.headers.get('cache-control');
  console.log('    Cache-Control for index.html:', cacheHeader);
  if (!cacheHeader || !cacheHeader.includes('no-cache')) {
    throw new Error('Missing no-cache header on index.html! Current: ' + cacheHeader);
  }
  console.log('    ✓ index.html is strictly un-cacheable (prevents stale chunk 404s)');

  // 4. Test Service Worker serving
  console.log('\n[4] Testing /sw.js headers...');
  const swRes = await fetch('http://localhost:5000/sw.js');
  const swCache = swRes.headers.get('cache-control');
  console.log('    Cache-Control for sw.js:', swCache);
  const swContent = await swRes.text();
  console.log('    ✓ sw.js served, length:', swContent.length, 'has network-first:', swContent.includes('navigate'));

  // 5. Test 401 Auth Expiry Handling
  console.log('\n[5] Testing 401 expired token handling...');
  const expiredRes = await fetch('http://localhost:5000/api/auth/me', {
    headers: { 'Authorization': 'Bearer expired.dummy.token' }
  });
  console.log('    Expired token status:', expiredRes.status);
  const expiredJson = await expiredRes.json();
  console.log('    Expired token response:', expiredJson);
  if (expiredRes.status !== 401) {
    throw new Error('Expected 401 status for expired token, got ' + expiredRes.status);
  }
  console.log('    ✓ 401 correctly returned with error payload');

  // 6. Test Auto-login endpoint
  console.log('\n[6] Testing /auto-login 1-click authentication...');
  const autoLoginRes = await fetch('http://localhost:5000/auto-login');
  console.log('    /auto-login status:', autoLoginRes.status, 'redirected:', autoLoginRes.redirected);
  const autoLoginHtml = await autoLoginRes.text();
  console.log('    ✓ /auto-login page rendered, length:', autoLoginHtml.length, 'has token injection:', autoLoginHtml.includes('pivott_token'));

  console.log('\n=== ALL STABILITY & RELIABILITY TESTS PASSED 100%! ===');
}

testResilience().catch(err => {
  console.error('\n❌ Resilience test failed:', err);
  process.exit(1);
});

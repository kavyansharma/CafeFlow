process.env.NODE_ENV = 'test';
import http from 'http';

async function runCorsTests() {
  const { default: app, isOriginAllowed, CAFEFLOW_VERCEL_PREVIEW_REGEX, allowedOrigins } = await import('../server');
  console.log('======================================================');
  console.log('🌐 CAFEFLOW CORS ORIGIN VALIDATION & PREFLIGHT TESTS');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  // 1. REGEX UNIT TESTS
  console.log('1. [REGEX] Testing CAFELOW Vercel Preview URL Regex...');
  assert(
    CAFEFLOW_VERCEL_PREVIEW_REGEX.test('https://cafe-flow-d7f6dhq3m-sharmakavyan72-7188s-projects.vercel.app'),
    'CAFELOW preview URL with project hash is matched'
  );
  assert(
    CAFEFLOW_VERCEL_PREVIEW_REGEX.test('https://cafe-flow-eight.vercel.app'),
    'CAFELOW production-style subdomain is matched'
  );
  assert(
    CAFEFLOW_VERCEL_PREVIEW_REGEX.test('https://cafe-flow-git-feat-test-sharmakavyan72-7188s-projects.vercel.app'),
    'CAFELOW git-branch preview URL is matched'
  );
  assert(
    !CAFEFLOW_VERCEL_PREVIEW_REGEX.test('https://evil-example.vercel.app'),
    'Arbitrary Vercel app (evil-example.vercel.app) is rejected by regex'
  );
  assert(
    !CAFEFLOW_VERCEL_PREVIEW_REGEX.test('https://example.com'),
    'Generic domain (example.com) is rejected by regex'
  );
  assert(
    !CAFEFLOW_VERCEL_PREVIEW_REGEX.test('https://cafe-flow-eight.vercel.app.evil.com'),
    'Subdomain suffix injection attack is rejected by regex'
  );
  assert(
    !CAFEFLOW_VERCEL_PREVIEW_REGEX.test('http://cafe-flow-d7f6dhq3m-sharmakavyan72-7188s-projects.vercel.app'),
    'Insecure HTTP protocol is rejected by regex'
  );
  assert(
    !CAFEFLOW_VERCEL_PREVIEW_REGEX.test('https://other-cafe-flow-preview.vercel.app'),
    'Non-matching prefix is rejected by regex'
  );

  // 2. ORIGIN VALIDATION LOGIC TESTS
  console.log('\n2. [ORIGIN VALIDATOR] Testing isOriginAllowed function...');
  assert(
    isOriginAllowed('https://cafe-flow-eight.vercel.app'),
    'Production origin https://cafe-flow-eight.vercel.app is allowed'
  );
  assert(
    isOriginAllowed('https://cafe-flow-d7f6dhq3m-sharmakavyan72-7188s-projects.vercel.app'),
    'Preview origin https://cafe-flow-d7f6dhq3m-sharmakavyan72-7188s-projects.vercel.app is allowed'
  );
  assert(
    isOriginAllowed('http://localhost:5173'),
    'Localhost 5173 is allowed'
  );
  assert(
    isOriginAllowed('http://localhost:3000'),
    'Localhost 3000 is allowed'
  );
  assert(
    isOriginAllowed('http://127.0.0.1:5173'),
    'Localhost 127.0.0.1:5173 is allowed'
  );
  assert(
    isOriginAllowed('http://tauri.localhost') && isOriginAllowed('https://tauri.localhost') && isOriginAllowed('tauri://localhost'),
    'Tauri desktop origins are allowed'
  );
  assert(
    isOriginAllowed(undefined),
    'Non-browser / curl requests with no origin are allowed'
  );
  assert(
    !isOriginAllowed('https://evil-example.vercel.app'),
    'Evil Vercel origin https://evil-example.vercel.app is rejected'
  );
  assert(
    !isOriginAllowed('https://example.com'),
    'Arbitrary origin https://example.com is rejected'
  );
  assert(
    !isOriginAllowed('https://cafe-flow-preview.vercel.app.attacker.com'),
    'Origin spoofing suffix attack is rejected'
  );
  assert(
    !isOriginAllowed('http://cafe-flow-d7f6dhq3m-sharmakavyan72-7188s-projects.vercel.app'),
    'HTTP preview origin is rejected'
  );

  // 3. HTTP SERVER & PREFLIGHT OPTIONS TESTS
  console.log('\n3. [HTTP PREFLIGHT] Testing OPTIONS Preflight & Headers with Live Server...');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  const testPort = typeof address === 'object' && address ? address.port : 5001;

  function makeRequest(
    method: string,
    path: string,
    headers: Record<string, string>
  ): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders }> {
    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: testPort,
          path,
          method,
          headers,
        },
        (res) => {
          resolve({
            statusCode: res.statusCode || 0,
            headers: res.headers,
          });
        }
      );
      req.on('error', reject);
      req.end();
    });
  }

  try {
    // Test 3a: OPTIONS Preflight from CAFELOW Preview Origin
    const previewOrigin = 'https://cafe-flow-d7f6dhq3m-sharmakavyan72-7188s-projects.vercel.app';
    const preflightRes = await makeRequest('OPTIONS', '/api/health', {
      Origin: previewOrigin,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type, Authorization, X-Tenant-ID',
    });

    assert(
      preflightRes.statusCode === 204 || preflightRes.statusCode === 200,
      `Preflight returned status ${preflightRes.statusCode}`
    );
    assert(
      preflightRes.headers['access-control-allow-origin'] === previewOrigin,
      `Preflight returned Access-Control-Allow-Origin matching preview URL: ${preflightRes.headers['access-control-allow-origin']}`
    );
    assert(
      preflightRes.headers['access-control-allow-credentials'] === 'true',
      'Preflight returned Access-Control-Allow-Credentials: true'
    );
    assert(
      typeof preflightRes.headers['access-control-allow-methods'] === 'string' &&
        preflightRes.headers['access-control-allow-methods'].includes('POST') &&
        preflightRes.headers['access-control-allow-methods'].includes('OPTIONS'),
      `Preflight returned allowed methods: ${preflightRes.headers['access-control-allow-methods']}`
    );
    assert(
      typeof preflightRes.headers['access-control-allow-headers'] === 'string' &&
        preflightRes.headers['access-control-allow-headers'].toLowerCase().includes('x-tenant-id') &&
        preflightRes.headers['access-control-allow-headers'].toLowerCase().includes('authorization'),
      `Preflight returned allowed headers: ${preflightRes.headers['access-control-allow-headers']}`
    );

    // Test 3b: GET request from Production Origin
    const prodOrigin = 'https://cafe-flow-eight.vercel.app';
    const prodRes = await makeRequest('GET', '/api/health', {
      Origin: prodOrigin,
    });
    assert(
      prodRes.statusCode === 200,
      `GET /api/health returned status ${prodRes.statusCode}`
    );
    assert(
      prodRes.headers['access-control-allow-origin'] === prodOrigin,
      `GET request returned Access-Control-Allow-Origin matching production URL: ${prodRes.headers['access-control-allow-origin']}`
    );
    assert(
      prodRes.headers['access-control-allow-credentials'] === 'true',
      'GET request returned Access-Control-Allow-Credentials: true'
    );

    // Test 3c: Request from unauthorized origin (evil-example.vercel.app)
    const evilRes = await makeRequest('GET', '/api/health', {
      Origin: 'https://evil-example.vercel.app',
    });
    assert(
      evilRes.headers['access-control-allow-origin'] === undefined,
      'Unauthorized origin (evil-example.vercel.app) does not receive Access-Control-Allow-Origin header'
    );

    // Test 3d: Request from unauthorized origin (example.com)
    const genericRes = await makeRequest('GET', '/api/health', {
      Origin: 'https://example.com',
    });
    assert(
      genericRes.headers['access-control-allow-origin'] === undefined,
      'Unauthorized origin (example.com) does not receive Access-Control-Allow-Origin header'
    );

  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }

  console.log('\n======================================================');
  console.log(`CORS AUDIT SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runCorsTests().catch((err) => {
  console.error('CORS test suite error:', err);
  process.exit(1);
});

const http = require('node:http');
const server = require('./index.js');

const TEST_PORT = 6767;

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const req = http.get(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path: path,
        timeout: 2000,
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: rawData ? JSON.parse(rawData) : null,
          });
        });
      }
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timed out for ${path}`));
    });
  });
}

async function runTests() {
  console.log('Starting test suite for k8s-cicd-app...\n');

  // Start server on test port if not already listening
  if (!server.listening) {
    await new Promise((resolve) => server.listen(TEST_PORT, resolve));
  }

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${name}:`, err.message);
    }
  }

  // Test 1: Health check
  await test('GET /health returns 200 and status UP', async () => {
    const res = await makeRequest('/health');
    if (res.statusCode !== 200) {
      throw new Error(`Expected status 200, got ${res.statusCode}`);
    }
    if (res.body?.status !== 'UP') {
      throw new Error(`Expected status 'UP', got ${JSON.stringify(res.body)}`);
    }
  });

  // Test 2: API endpoint
  await test('GET /api returns 200 and success response', async () => {
    const res = await makeRequest('/api');
    if (res.statusCode !== 200) {
      throw new Error(`Expected status 200, got ${res.statusCode}`);
    }
    if (res.body?.status !== 'success') {
      throw new Error(`Expected status 'success', got ${JSON.stringify(res.body)}`);
    }
    if (!res.body?.message) {
      throw new Error('Expected message in response body');
    }
  });

  // Test 3: Root endpoint
  await test('GET / returns 200 with service info', async () => {
    const res = await makeRequest('/');
    if (res.statusCode !== 200) {
      throw new Error(`Expected status 200, got ${res.statusCode}`);
    }
    if (!res.body?.endpoints?.health || !res.body?.endpoints?.api) {
      throw new Error('Expected endpoints description in root');
    }
  });

  // Test 4: 404 handler
  await test('GET /unknown returns 404', async () => {
    const res = await makeRequest('/unknown');
    if (res.statusCode !== 404) {
      throw new Error(`Expected status 404, got ${res.statusCode}`);
    }
  });

  console.log(`\nTest Summary: ${passed}/${total} tests passed.\n`);

  server.close(() => {
    if (passed === total) {
      console.log('All tests passed successfully!');
      process.exit(0);
    } else {
      console.error('Some tests failed.');
      process.exit(1);
    }
  });
}

runTests().catch((err) => {
  console.error('Test suite error:', err);
  process.exit(1);
});

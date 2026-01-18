/**
 * Simple API test script
 * Tests /api/custom-links and /api/albums endpoints
 * 
 * Usage: node test-api.js
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:5002/api';

async function testEndpoint(name, url, method = 'GET', headers = {}) {
  console.log(`\n🧪 Testing ${name}...`);
  console.log(`   URL: ${url}`);
  console.log(`   Method: ${method}`);
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const response = await fetch(url, options);
    const status = response.status;
    const statusText = response.statusText;
    
    console.log(`   Status: ${status} ${statusText}`);
    
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    if (status >= 200 && status < 300) {
      console.log(`   ✅ SUCCESS`);
      if (data) {
        console.log(`   Response:`, JSON.stringify(data, null, 2).substring(0, 200));
      }
      return { success: true, status, data };
    } else {
      console.log(`   ❌ ERROR`);
      console.log(`   Response:`, JSON.stringify(data, null, 2).substring(0, 200));
      return { success: false, status, data };
    }
  } catch (error) {
    console.log(`   ❌ EXCEPTION: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting API Tests...');
  console.log(`📍 API Base URL: ${API_BASE_URL}`);
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: GET /api/custom-links (without auth - should return 401 or 429)
  const test1 = await testEndpoint(
    'GET /api/custom-links (no auth)',
    `${API_BASE_URL}/custom-links`,
    'GET'
  );
  results.tests.push(test1);
  if (test1.status === 401 || test1.status === 429) {
    results.passed++;
    console.log(`   ℹ️  Expected 401/429 (auth required or rate limited)`);
  } else if (test1.success) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 2: GET /api/albums
  const test2 = await testEndpoint(
    'GET /api/albums',
    `${API_BASE_URL}/albums`,
    'GET'
  );
  results.tests.push(test2);
  if (test2.success) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 3: Check if endpoints are reachable
  console.log(`\n📊 Test Results:`);
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   📝 Total: ${results.tests.length}`);

  // Summary
  console.log(`\n📋 Summary:`);
  results.tests.forEach((test, index) => {
    const status = test.success || test.status === 401 || test.status === 429 ? '✅' : '❌';
    console.log(`   ${status} Test ${index + 1}`);
  });

  // Check connectivity
  if (results.failed === results.tests.length) {
    console.log(`\n⚠️  All tests failed. Possible issues:`);
    console.log(`   - Backend server not running on ${API_BASE_URL}`);
    console.log(`   - CORS issues`);
    console.log(`   - Network connectivity problems`);
    console.log(`   - Rate limiting (429)`);
  }

  process.exit(results.failed > 0 ? 1 : 0);
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ This script requires Node.js 18+ or fetch polyfill');
  console.error('   Install: npm install node-fetch');
  process.exit(1);
}

runTests().catch(error => {
  console.error('❌ Test runner error:', error);
  process.exit(1);
});

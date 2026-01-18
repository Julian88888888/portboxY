/**
 * Detailed API test script with rate limit handling
 * Tests /api/custom-links and /api/albums endpoints
 * 
 * Usage: node test-api-detailed.js
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:5002/api';

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
    
    // Check rate limit headers
    const rateLimitRemaining = response.headers.get('RateLimit-Remaining');
    const rateLimitReset = response.headers.get('RateLimit-Reset');
    
    console.log(`   Status: ${status} ${statusText}`);
    if (rateLimitRemaining !== null) {
      console.log(`   Rate Limit Remaining: ${rateLimitRemaining}`);
    }
    if (rateLimitReset !== null) {
      const resetDate = new Date(parseInt(rateLimitReset) * 1000);
      console.log(`   Rate Limit Resets: ${resetDate.toLocaleTimeString()}`);
    }
    
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    if (status >= 200 && status < 300) {
      console.log(`   ✅ SUCCESS`);
      if (data && typeof data === 'object') {
        const dataStr = JSON.stringify(data, null, 2);
        console.log(`   Response:`, dataStr.substring(0, 300) + (dataStr.length > 300 ? '...' : ''));
      }
      return { success: true, status, data, rateLimited: false };
    } else if (status === 429) {
      console.log(`   ⚠️  RATE LIMITED`);
      console.log(`   Response:`, JSON.stringify(data, null, 2).substring(0, 200));
      return { success: false, status, data, rateLimited: true };
    } else {
      console.log(`   ❌ ERROR`);
      console.log(`   Response:`, JSON.stringify(data, null, 2).substring(0, 200));
      return { success: false, status, data, rateLimited: false };
    }
  } catch (error) {
    console.log(`   ❌ EXCEPTION: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      console.log(`   💡 Backend server might not be running on ${API_BASE_URL.replace('/api', '')}`);
    }
    return { success: false, error: error.message, rateLimited: false };
  }
}

async function runTests() {
  console.log('🚀 Starting Detailed API Tests...');
  console.log(`📍 API Base URL: ${API_BASE_URL}`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
  
  const results = {
    passed: 0,
    failed: 0,
    rateLimited: 0,
    tests: []
  };

  // Test 1: GET /api/custom-links (without auth - should return 401 or 429)
  const test1 = await testEndpoint(
    'GET /api/custom-links (no auth)',
    `${API_BASE_URL}/custom-links`,
    'GET'
  );
  results.tests.push(test1);
  if (test1.rateLimited) {
    results.rateLimited++;
    console.log(`   ℹ️  Rate limited - this is expected if many requests were made`);
  } else if (test1.status === 401) {
    results.passed++;
    console.log(`   ℹ️  Expected 401 (auth required)`);
  } else if (test1.success) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Wait a bit between requests to avoid hitting rate limit
  await wait(500);

  // Test 2: GET /api/albums
  const test2 = await testEndpoint(
    'GET /api/albums',
    `${API_BASE_URL}/albums`,
    'GET'
  );
  results.tests.push(test2);
  if (test2.rateLimited) {
    results.rateLimited++;
    console.log(`   ℹ️  Rate limited - this is expected if many requests were made`);
  } else if (test2.success) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Summary
  console.log(`\n📊 Test Results:`);
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   ⚠️  Rate Limited: ${results.rateLimited}`);
  console.log(`   📝 Total: ${results.tests.length}`);

  // Detailed summary
  console.log(`\n📋 Detailed Summary:`);
  results.tests.forEach((test, index) => {
    let status = '❓';
    if (test.rateLimited) {
      status = '⚠️';
    } else if (test.success || test.status === 401) {
      status = '✅';
    } else {
      status = '❌';
    }
    const endpoint = index === 0 ? 'custom-links' : 'albums';
    console.log(`   ${status} Test ${index + 1} - /api/${endpoint} (Status: ${test.status || 'N/A'})`);
  });

  // Recommendations
  if (results.rateLimited > 0) {
    console.log(`\n💡 Recommendations for Rate Limiting:`);
    console.log(`   1. Wait 15 minutes for rate limit to reset`);
    console.log(`   2. Restart backend server to reset rate limit (if using in-memory storage)`);
    console.log(`   3. Increase rate limit in backend/server.js for development`);
    console.log(`   4. Check if too many requests are being made in the frontend`);
  }

  if (results.failed > 0 && results.rateLimited === 0) {
    console.log(`\n⚠️  Tests failed. Possible issues:`);
    console.log(`   - Backend server not running on ${API_BASE_URL.replace('/api', '')}`);
    console.log(`   - CORS issues`);
    console.log(`   - Network connectivity problems`);
    console.log(`   - Authentication required`);
  }

  // Final status
  const allPassed = results.failed === 0;
  const hasRateLimit = results.rateLimited > 0;
  
  if (allPassed && !hasRateLimit) {
    console.log(`\n🎉 All tests passed!`);
  } else if (hasRateLimit) {
    console.log(`\n⚠️  Tests completed but rate limiting detected`);
  } else {
    console.log(`\n❌ Some tests failed`);
  }

  process.exit(results.failed > 0 && !hasRateLimit ? 1 : 0);
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

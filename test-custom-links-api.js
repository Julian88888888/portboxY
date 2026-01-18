/**
 * Test script for Custom Links API with retry logic
 * Tests POST /api/custom-links and keeps retrying until success
 * 
 * Usage: node test-custom-links-api.js
 */

const API_BASE_URL = process.env.API_URL || 'https://portbox-y.vercel.app/api';

// Test data
const testLink = {
  title: 'Test Link ' + Date.now(),
  url: 'https://example.com',
  icon_url: null,
  enabled: true
};

// You need to provide a valid Supabase token for testing
// Get it from browser console: localStorage.getItem('sb-<project-ref>-auth-token')
// Or from Supabase dashboard
const TEST_TOKEN = process.env.TEST_TOKEN || '';

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testCreateCustomLink(retryCount = 0, maxRetries = 10) {
  console.log(`\n🧪 Testing POST /api/custom-links (Attempt ${retryCount + 1}/${maxRetries})...`);
  console.log(`   URL: ${API_BASE_URL}/custom-links`);
  console.log(`   Method: POST`);
  console.log(`   Data:`, JSON.stringify(testLink, null, 2));
  
  if (!TEST_TOKEN) {
    console.error('   ❌ TEST_TOKEN not set!');
    console.error('   💡 Set it as environment variable: TEST_TOKEN=your_token node test-custom-links-api.js');
    console.error('   💡 Or get token from browser: localStorage.getItem("sb-<project-ref>-auth-token")');
    process.exit(1);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/custom-links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      body: JSON.stringify(testLink)
    });

    const status = response.status;
    const statusText = response.statusText;
    
    console.log(`   Status: ${status} ${statusText}`);
    
    // Check rate limit headers
    const rateLimitRemaining = response.headers.get('RateLimit-Remaining');
    if (rateLimitRemaining !== null) {
      console.log(`   Rate Limit Remaining: ${rateLimitRemaining}`);
    }

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (parseError) {
        const text = await response.text();
        console.error('   ❌ Failed to parse JSON response:', parseError.message);
        console.error('   Response text:', text.substring(0, 500));
        data = { error: 'Failed to parse response', raw: text };
      }
    } else {
      const text = await response.text();
      console.error('   ❌ Non-JSON response received');
      console.error('   Response:', text.substring(0, 500));
      data = { error: 'Non-JSON response', raw: text };
    }
    
    if (status >= 200 && status < 300) {
      console.log(`   ✅ SUCCESS!`);
      console.log(`   Response:`, JSON.stringify(data, null, 2));
      return { success: true, status, data };
    } else if (status === 429) {
      console.log(`   ⚠️  RATE LIMITED`);
      console.log(`   Response:`, JSON.stringify(data, null, 2));
      return { success: false, status, data, rateLimited: true };
    } else {
      console.log(`   ❌ ERROR`);
      console.log(`   Response:`, JSON.stringify(data, null, 2));
      
      // Check for RLS error
      if (data.code === '42501' || (data.error && data.error.includes('row-level security'))) {
        console.log(`   🔒 RLS Error detected!`);
        console.log(`   💡 Make sure SUPABASE_SERVICE_ROLE_KEY is set in Vercel environment variables`);
      }
      
      return { success: false, status, data };
    }
  } catch (error) {
    console.log(`   ❌ EXCEPTION: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      console.log(`   💡 Backend server might not be running`);
    }
    return { success: false, error: error.message };
  }
}

async function testGetCustomLinks() {
  console.log(`\n🧪 Testing GET /api/custom-links...`);
  console.log(`   URL: ${API_BASE_URL}/custom-links`);
  console.log(`   Method: GET`);
  
  if (!TEST_TOKEN) {
    console.error('   ❌ TEST_TOKEN not set!');
    return { success: false };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/custom-links`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });

    const status = response.status;
    let data;
    
    if (response.headers.get('content-type')?.includes('application/json')) {
      data = await response.json();
    } else {
      data = { error: await response.text() };
    }
    
    if (status >= 200 && status < 300) {
      console.log(`   ✅ SUCCESS!`);
      console.log(`   Found ${data.data?.length || 0} custom links`);
      return { success: true, status, data };
    } else {
      console.log(`   ❌ ERROR (Status: ${status})`);
      console.log(`   Response:`, JSON.stringify(data, null, 2));
      return { success: false, status, data };
    }
  } catch (error) {
    console.log(`   ❌ EXCEPTION: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTestsWithRetry() {
  console.log('🚀 Starting Custom Links API Tests with Retry Logic...');
  console.log(`📍 API Base URL: ${API_BASE_URL}`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
  console.log(`\n⚠️  Note: This test will retry until success or max retries reached`);
  
  if (!TEST_TOKEN) {
    console.error('\n❌ ERROR: TEST_TOKEN environment variable is required!');
    console.error('\n💡 How to get a test token:');
    console.error('   1. Open your app in browser');
    console.error('   2. Open browser console (F12)');
    console.error('   3. Run: localStorage.getItem("sb-<your-project-ref>-auth-token")');
    console.error('   4. Or check Supabase Dashboard → Authentication → Users');
    console.error('\n💡 Then run:');
    console.error('   TEST_TOKEN=your_token_here node test-custom-links-api.js');
    process.exit(1);
  }

  const maxRetries = 20;
  const retryDelay = 3000; // 3 seconds between retries
  let lastResult = null;

  // Test GET first
  console.log('\n📋 Step 1: Testing GET /api/custom-links');
  const getResult = await testGetCustomLinks();
  
  if (!getResult.success) {
    console.log('\n⚠️  GET test failed, but continuing with POST test...');
  }

  // Test POST with retry
  console.log('\n📋 Step 2: Testing POST /api/custom-links (with retry)');
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const result = await testCreateCustomLink(attempt, maxRetries);
    lastResult = result;
    
    if (result.success) {
      console.log(`\n🎉 SUCCESS! Test passed on attempt ${attempt + 1}`);
      break;
    }
    
    if (result.rateLimited) {
      console.log(`\n⏳ Rate limited. Waiting ${retryDelay / 1000} seconds before retry...`);
      await wait(retryDelay);
      continue;
    }
    
    if (attempt < maxRetries - 1) {
      console.log(`\n⏳ Waiting ${retryDelay / 1000} seconds before retry...`);
      await wait(retryDelay);
    }
  }

  // Final summary
  console.log(`\n📊 Final Results:`);
  console.log(`   GET /api/custom-links: ${getResult.success ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   POST /api/custom-links: ${lastResult?.success ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (!lastResult?.success) {
    console.log(`\n❌ Test failed after ${maxRetries} attempts`);
    console.log(`\n💡 Troubleshooting:`);
    console.log(`   1. Check Vercel logs: Dashboard → Functions → /api/custom-links`);
    console.log(`   2. Verify SUPABASE_SERVICE_ROLE_KEY is set in Vercel environment variables`);
    console.log(`   3. Check RLS policies in Supabase Dashboard`);
    console.log(`   4. Verify TEST_TOKEN is valid and not expired`);
    console.log(`   5. Check if rate limiting is blocking requests`);
    
    if (lastResult?.data?.code === '42501') {
      console.log(`\n🔒 RLS Policy Error:`);
      console.log(`   The error code 42501 indicates Row Level Security policy violation.`);
      console.log(`   Solution: Set SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables.`);
      console.log(`   This key bypasses RLS policies for server-side operations.`);
    }
    
    process.exit(1);
  } else {
    console.log(`\n🎉 All tests passed!`);
    process.exit(0);
  }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ This script requires Node.js 18+ or fetch polyfill');
  console.error('   Install: npm install node-fetch');
  process.exit(1);
}

runTestsWithRetry().catch(error => {
  console.error('❌ Test runner error:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

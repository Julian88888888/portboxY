/**
 * Auto-test script for Custom Links API with retry logic
 * Tests POST /api/custom-links and keeps retrying until success
 * Works without token (will show auth errors) or with token
 * 
 * Usage: 
 *   node test-custom-links-api-auto.js
 *   TEST_TOKEN=your_token node test-custom-links-api-auto.js
 */

const API_BASE_URL = process.env.API_URL || 'https://portbox-y.vercel.app/api';
const TEST_TOKEN = process.env.TEST_TOKEN || '';

// Test data
const testLink = {
  title: 'Test Link ' + Date.now(),
  url: 'https://example.com',
  icon_url: null,
  enabled: true
};

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testCreateCustomLink(retryCount = 0, maxRetries = 20) {
  const attemptNum = retryCount + 1;
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 Attempt ${attemptNum}/${maxRetries} - POST /api/custom-links`);
  console.log(`${'='.repeat(60)}`);
  console.log(`   URL: ${API_BASE_URL}/custom-links`);
  console.log(`   Method: POST`);
  console.log(`   Token: ${TEST_TOKEN ? '✅ Provided' : '❌ Not provided (will test auth error)'}`);
  console.log(`   Data:`, JSON.stringify(testLink, null, 2));
  
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (TEST_TOKEN) {
      headers['Authorization'] = `Bearer ${TEST_TOKEN}`;
    }

    const response = await fetch(`${API_BASE_URL}/custom-links`, {
      method: 'POST',
      headers,
      body: JSON.stringify(testLink)
    });

    const status = response.status;
    const statusText = response.statusText;
    
    console.log(`\n   📡 Response:`);
    console.log(`      Status: ${status} ${statusText}`);
    
    // Check headers
    const rateLimitRemaining = response.headers.get('RateLimit-Remaining');
    const contentType = response.headers.get('content-type');
    
    if (rateLimitRemaining !== null) {
      console.log(`      Rate Limit Remaining: ${rateLimitRemaining}`);
    }
    console.log(`      Content-Type: ${contentType || 'N/A'}`);

    let data;
    if (contentType && contentType.includes('application/json')) {
      try {
        const text = await response.text();
        data = JSON.parse(text);
      } catch (parseError) {
        console.error(`      ❌ JSON Parse Error: ${parseError.message}`);
        data = { error: 'Failed to parse JSON', parseError: parseError.message };
      }
    } else {
      const text = await response.text();
      console.error(`      ❌ Non-JSON response`);
      data = { error: 'Non-JSON response', raw: text.substring(0, 200) };
    }
    
    console.log(`\n   📦 Response Data:`);
    console.log(JSON.stringify(data, null, 2));
    
    // Analyze result
    if (status >= 200 && status < 300) {
      console.log(`\n   ✅ SUCCESS! Custom link created successfully!`);
      return { success: true, status, data, shouldRetry: false };
    } else if (status === 401) {
      console.log(`\n   🔐 Authentication Required`);
      if (!TEST_TOKEN) {
        console.log(`   💡 TEST_TOKEN not set - this is expected`);
        console.log(`   💡 To test with auth, set: TEST_TOKEN=your_token node test-custom-links-api-auto.js`);
        console.log(`   💡 Will continue retrying (API is working, just needs auth)...`);
        // Continue retrying even with 401 - maybe token will be set later or issue will be fixed
        return { success: false, status, data, shouldRetry: true, authError: true };
      } else {
        console.log(`   💡 Token provided but still getting 401 - token might be invalid/expired`);
        console.log(`   💡 Will retry...`);
        return { success: false, status, data, shouldRetry: true, authError: true };
      }
    } else if (status === 429) {
      console.log(`\n   ⚠️  Rate Limited`);
      console.log(`   💡 Too many requests. Will retry after delay...`);
      return { success: false, status, data, shouldRetry: true, rateLimited: true };
    } else if (status === 500) {
      console.log(`\n   ❌ Server Error (500)`);
      
      // Check for specific error codes
      if (data.code === '42501') {
        console.log(`   🔒 RLS Policy Violation Detected!`);
        console.log(`   💡 Error Code: ${data.code}`);
        console.log(`   💡 This means Row Level Security is blocking the operation`);
        console.log(`   💡 Solution: Set SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables`);
        console.log(`   💡 Service Role Key bypasses RLS policies`);
        console.log(`   💡 Will continue retrying until RLS is fixed...`);
      } else if (data.error) {
        console.log(`   💡 Error: ${data.error}`);
        if (data.details) {
          console.log(`   💡 Details: ${data.details}`);
        }
      }
      
      console.log(`   💡 Will retry...`);
      return { success: false, status, data, shouldRetry: true };
    } else {
      console.log(`\n   ❌ Error (Status: ${status})`);
      console.log(`   💡 Will retry...`);
      return { success: false, status, data, shouldRetry: true };
    }
  } catch (error) {
    console.log(`\n   ❌ EXCEPTION: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      console.log(`   💡 Connection refused - server might not be running`);
    } else if (error.code === 'ENOTFOUND') {
      console.log(`   💡 DNS lookup failed - check API URL`);
    }
    console.log(`   💡 Will retry...`);
    return { success: false, error: error.message, shouldRetry: true };
  }
}

async function runTestsWithRetry() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Custom Links API Auto-Test with Retry Logic');
  console.log('='.repeat(60));
  console.log(`📍 API Base URL: ${API_BASE_URL}`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
  console.log(`🔄 Will retry up to 20 times until success`);
  
  if (!TEST_TOKEN) {
    console.log(`\n⚠️  WARNING: TEST_TOKEN not set`);
    console.log(`   Tests will run but will fail with 401 (expected)`);
    console.log(`   To test with authentication:`);
    console.log(`   1. Get token from browser console: localStorage.getItem("sb-<project>-auth-token")`);
    console.log(`   2. Run: TEST_TOKEN=your_token node test-custom-links-api-auto.js`);
  }

  const maxRetries = 100; // Increased for continuous testing
  const retryDelay = 5000; // 5 seconds between retries
  let lastResult = null;
  let successCount = 0;
  let failureCount = 0;
  let rlsErrorCount = 0;
  let authErrorCount = 0;

  console.log(`\n${'='.repeat(60)}`);
  console.log('📋 Starting Continuous Tests...');
  console.log('='.repeat(60));
  console.log(`🔄 Will retry up to ${maxRetries} times until SUCCESS (200 status)`);
  console.log(`⏱️  Delay between attempts: ${retryDelay / 1000} seconds`);
  console.log(`\n💡 This test will keep running until it gets a 200 OK response`);
  console.log(`💡 Press Ctrl+C to stop\n`);
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const result = await testCreateCustomLink(attempt, maxRetries);
    lastResult = result;
    
    if (result.success) {
      successCount++;
      console.log(`\n🎉 SUCCESS! Test passed on attempt ${attempt + 1}`);
      break;
    } else {
      failureCount++;
      
      // Track specific error types
      if (result.data?.code === '42501') {
        rlsErrorCount++;
      }
      if (result.authError) {
        authErrorCount++;
      }
      
      // Show progress every 5 attempts
      if ((attempt + 1) % 5 === 0) {
        console.log(`\n📊 Progress: Attempt ${attempt + 1}/${maxRetries}`);
        console.log(`   RLS Errors: ${rlsErrorCount}`);
        console.log(`   Auth Errors: ${authErrorCount}`);
        console.log(`   Other Errors: ${failureCount - rlsErrorCount - authErrorCount}`);
      }
      
      if (attempt < maxRetries - 1) {
        console.log(`\n⏳ Waiting ${retryDelay / 1000} seconds before next attempt...`);
        await wait(retryDelay);
      }
    }
  }

  // Final summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 Final Test Summary');
  console.log('='.repeat(60));
  console.log(`   Total Attempts: ${failureCount + successCount}`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failureCount}`);
  console.log(`   Final Status: ${lastResult?.success ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (lastResult?.success) {
    console.log(`\n🎉 All tests passed!`);
    console.log(`   Created link ID: ${lastResult.data?.data?.id || 'N/A'}`);
    process.exit(0);
  } else {
    console.log(`\n❌ Test did not pass after ${maxRetries} attempts`);
    
    if (lastResult?.authError) {
      console.log(`\n💡 Authentication Error:`);
      console.log(`   Set TEST_TOKEN environment variable to test with authentication`);
    } else if (lastResult?.data?.code === '42501') {
      console.log(`\n💡 RLS Policy Error (Code: 42501):`);
      console.log(`   1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables`);
      console.log(`   2. Add: SUPABASE_SERVICE_ROLE_KEY = <your-service-role-key>`);
      console.log(`   3. Get Service Role Key from Supabase Dashboard → Settings → API`);
      console.log(`   4. Redeploy the project`);
    } else {
      console.log(`\n💡 Troubleshooting Steps:`);
      console.log(`   1. Check Vercel logs: Dashboard → Functions → /api/custom-links`);
      console.log(`   2. Verify SUPABASE_SERVICE_ROLE_KEY is set in Vercel`);
      console.log(`   3. Check Supabase Dashboard for RLS policies`);
      console.log(`   4. Verify API endpoint is accessible`);
      console.log(`   5. Check rate limiting settings`);
    }
    
    process.exit(1);
  }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ This script requires Node.js 18+ or fetch polyfill');
  console.error('   Install: npm install node-fetch');
  process.exit(1);
}

runTestsWithRetry().catch(error => {
  console.error('\n❌ Test runner error:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client for backend
const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.warn('Warning: SUPABASE_URL not set. Supabase authentication will not work.');
}

// Use service role key for admin operations, or anon key as fallback for JWT verification
// Service role key is preferred, but anon key can work for basic operations
const supabaseKey = supabaseServiceKey || supabaseAnonKey;
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

if (supabase && !supabaseServiceKey && supabaseAnonKey) {
  console.warn('Using anon key instead of service role key. Some operations may be limited.');
}

/**
 * Middleware to verify Supabase JWT token from Authorization header
 * Extracts user ID and attaches it to req.user
 */
const verifySupabaseToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  if (!supabase) {
    console.error('Supabase client not initialized. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or REACT_APP_SUPABASE_ANON_KEY environment variables.');
    return res.status(500).json({ 
      success: false, 
      message: 'Supabase not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or REACT_APP_SUPABASE_ANON_KEY) environment variables.',
      hint: 'Check your .env file or docker-compose.yml environment variables'
    });
  }

  try {
    // Verify the JWT token using Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }

    // Attach user to request object
    req.user = {
      id: user.id,
      email: user.email,
      ...user
    };

    next();
  } catch (error) {
    console.error('Error verifying Supabase token:', error);
    return res.status(403).json({ 
      success: false, 
      message: 'Token verification failed' 
    });
  }
};

module.exports = {
  verifySupabaseToken,
  supabase
};







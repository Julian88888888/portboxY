const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client for backend
const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.warn('Warning: SUPABASE_URL not set. Supabase authentication will not work.');
}

// Use service role key for admin operations, or anon key for JWT verification
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

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
    return res.status(500).json({ 
      success: false, 
      message: 'Supabase not configured' 
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



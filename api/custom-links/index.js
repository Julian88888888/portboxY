/**
 * Vercel Serverless Function for Custom Links API
 * Handles GET, POST, PUT, DELETE /api/custom-links
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase clients
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Use Service Role Key for database operations (bypasses RLS)
// If not available, fall back to anon key (will be subject to RLS policies)
const dbKey = serviceRoleKey || anonKey;

const supabase = supabaseUrl && dbKey
  ? createClient(supabaseUrl, dbKey)
  : null;

/**
 * Verify Supabase token from Authorization header
 * Uses service role key for token verification (needed for getUser)
 */
async function verifyToken(req) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return { error: 'Access token required', user: null };
  }

  if (!supabase) {
    return { error: 'Supabase not configured', user: null };
  }

  try {
    // For getUser, we can use service role or anon key - both work
    // But service role is preferred for reliability
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      console.error('Token verification error:', error);
      return { error: 'Invalid or expired token', user: null };
    }
    return { error: null, user };
  } catch (error) {
    console.error('Token verification exception:', error);
    return { error: 'Token verification failed', user: null };
  }
}

/**
 * Main handler for Vercel Serverless Function
 */
module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }

  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (!supabase) {
    console.error('Supabase not initialized:', {
      supabaseUrl: supabaseUrl ? 'SET' : 'NOT SET',
      serviceRoleKey: serviceRoleKey ? 'SET' : 'NOT SET',
      anonKey: anonKey ? 'SET' : 'NOT SET'
    });
    return res.status(500).json({
      success: false,
      error: 'Supabase not configured. Please set REACT_APP_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or REACT_APP_SUPABASE_ANON_KEY) environment variables.'
    });
  }

  // Log which key is being used (for debugging)
  if (!serviceRoleKey && anonKey) {
    console.warn('⚠️  Using ANON_KEY - RLS policies will be enforced. Consider using SUPABASE_SERVICE_ROLE_KEY.');
  } else if (serviceRoleKey) {
    console.log('✅ Using SERVICE_ROLE_KEY - RLS policies will be bypassed.');
  }

  try {
    // Verify authentication for all methods
    const { error: authError, user } = await verifyToken(req);
    if (authError || !user) {
      return res.status(401).json({
        success: false,
        message: authError || 'Unauthorized'
      });
    }

    const userId = user.id;
    console.log('User authenticated:', userId);

    // GET /api/custom-links - Get all custom links for current user
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('custom_links')
        .select('*')
        .eq('user_id', userId)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to get custom links',
          error: error.message
        });
      }

      return res.status(200).json({
        success: true,
        data: data || []
      });
    }

    // POST /api/custom-links - Create a new custom link
    if (req.method === 'POST') {
      // Parse request body
      let body;
      try {
        body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      } catch (parseError) {
        console.error('Error parsing request body:', parseError);
        return res.status(400).json({
          success: false,
          message: 'Invalid JSON in request body',
          error: parseError.message
        });
      }

      const { title, url, icon_url, enabled } = body || {};

      // Validate required fields
      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Title is required'
        });
      }

      if (!url || !url.trim()) {
        return res.status(400).json({
          success: false,
          message: 'URL is required'
        });
      }

      // Validate URL format
      try {
        new URL(url);
      } catch (urlError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid URL format',
          error: urlError.message
        });
      }

      // Get current max display_order for this user
      let nextOrder = 0;
      try {
        const { data: existingLinks, error: selectError } = await supabase
          .from('custom_links')
          .select('display_order')
          .eq('user_id', userId)
          .order('display_order', { ascending: false })
          .limit(1);

        if (selectError) {
          console.error('Error fetching existing links:', selectError);
          // Continue with nextOrder = 0 if there's an error
        } else {
          nextOrder = existingLinks && existingLinks.length > 0
            ? (existingLinks[0].display_order || 0) + 1
            : 0;
        }
      } catch (orderError) {
        console.error('Error calculating display order:', orderError);
        // Continue with nextOrder = 0
      }

      // Use Service Role Key for database operations (bypasses RLS)
      // We've already verified the user is authenticated, so it's safe to bypass RLS
      
      console.log('Attempting to insert custom link:', {
        userId,
        title: title.trim(),
        usingServiceRole: !!serviceRoleKey,
        usingAnonKey: !serviceRoleKey && !!anonKey
      });
      
      const { data, error } = await supabase
        .from('custom_links')
        .insert({
          user_id: userId,
          title: title.trim(),
          url: url.trim(),
          icon_url: icon_url || null,
          enabled: enabled !== undefined ? Boolean(enabled) : true,
          display_order: nextOrder
        })
        .select()
        .single();

      if (error) {
        console.error('Database error creating custom link:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Using key:', serviceRoleKey ? 'SERVICE_ROLE_KEY' : (anonKey ? 'ANON_KEY' : 'NONE'));
        
        // Special handling for RLS errors
        if (error.code === '42501') {
          return res.status(500).json({
            success: false,
            message: 'Failed to create custom link - RLS policy violation',
            error: error.message || 'Row-level security policy violation',
            details: 'Row Level Security policy is blocking this operation. SUPABASE_SERVICE_ROLE_KEY is required to bypass RLS.',
            code: '42501',
            hint: 'Set SUPABASE_SERVICE_ROLE_KEY in Vercel Dashboard → Settings → Environment Variables and redeploy'
          });
        }
        
        return res.status(500).json({
          success: false,
          message: 'Failed to create custom link',
          error: error.message || 'Database error',
          details: error.details || null,
          code: error.code || null
        });
      }

      if (!data) {
        console.error('No data returned from insert operation');
        return res.status(500).json({
          success: false,
          message: 'Failed to create custom link - no data returned'
        });
      }

      return res.status(201).json({
        success: true,
        data
      });
    }

    // PUT /api/custom-links/:id - Update a custom link
    if (req.method === 'PUT') {
      // Extract ID from query or path
      const linkId = req.query.id || req.url.split('/').pop();
      
      if (!linkId) {
        return res.status(400).json({
          success: false,
          message: 'Link ID is required'
        });
      }

      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { title, url, icon_url, enabled, display_order } = body || {};

      // Build update object
      const updateData = {
        updated_at: new Date().toISOString()
      };

      if (title !== undefined) {
        if (!title || !title.trim()) {
          return res.status(400).json({
            success: false,
            message: 'Title cannot be empty'
          });
        }
        updateData.title = title.trim();
      }

      if (url !== undefined) {
        if (!url || !url.trim()) {
          return res.status(400).json({
            success: false,
            message: 'URL cannot be empty'
          });
        }
        // Validate URL format
        try {
          new URL(url);
        } catch {
          return res.status(400).json({
            success: false,
            message: 'Invalid URL format'
          });
        }
        updateData.url = url.trim();
      }

      if (icon_url !== undefined) {
        updateData.icon_url = icon_url || null;
      }

      if (enabled !== undefined) {
        updateData.enabled = Boolean(enabled);
      }

      if (display_order !== undefined) {
        updateData.display_order = parseInt(display_order, 10);
      }

      const { data, error } = await supabase
        .from('custom_links')
        .update(updateData)
        .eq('id', linkId)
        .eq('user_id', userId) // Ensure user owns this link
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            success: false,
            message: 'Custom link not found'
          });
        }
        console.error('Database error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to update custom link',
          error: error.message
        });
      }

      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'Custom link not found or you do not have permission to update it'
        });
      }

      return res.status(200).json({
        success: true,
        data
      });
    }

    // DELETE /api/custom-links/:id - Delete a custom link
    if (req.method === 'DELETE') {
      // Extract ID from query or path
      const linkId = req.query.id || req.url.split('/').pop();
      
      if (!linkId) {
        return res.status(400).json({
          success: false,
          message: 'Link ID is required'
        });
      }

      const { data, error } = await supabase
        .from('custom_links')
        .delete()
        .eq('id', linkId)
        .eq('user_id', userId) // Ensure user owns this link
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to delete custom link',
          error: error.message
        });
      }

      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'Custom link not found or you do not have permission to delete it'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Custom link deleted successfully'
      });
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('Handler error:', error);
    console.error('Error stack:', error.stack);
    console.error('Request details:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body
    });
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

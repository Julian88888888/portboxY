/**
 * Vercel Serverless Function for Bookings API
 * Handles GET, POST, PUT, DELETE /api/bookings
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
    console.error('Supabase not initialized');
    return res.status(500).json({
      success: false,
      error: 'Supabase not configured. Please set REACT_APP_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or REACT_APP_SUPABASE_ANON_KEY) environment variables.'
    });
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

    // GET /api/bookings - Get all bookings for current user
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to get bookings',
          error: error.message
        });
      }

      return res.status(200).json({
        success: true,
        data: data || []
      });
    }

    // POST /api/bookings - Create a new booking
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

      const { name, email, job_type, dates, location, pay_rate, details, status } = body || {};

      // Validate required fields
      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Name is required'
        });
      }

      if (!email || !email.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      console.log('Attempting to insert booking:', {
        userId,
        name: name.trim(),
        email: email.trim(),
        usingServiceRole: !!serviceRoleKey
      });
      
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: userId,
          name: name.trim(),
          email: email.trim(),
          job_type: job_type || null,
          dates: dates || null,
          location: location || null,
          pay_rate: pay_rate || null,
          details: details || null,
          status: status || 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Database error creating booking:', error);
        
        // Special handling for RLS errors
        if (error.code === '42501') {
          return res.status(500).json({
            success: false,
            message: 'Failed to create booking - RLS policy violation',
            error: error.message || 'Row-level security policy violation',
            details: 'Row Level Security policy is blocking this operation. SUPABASE_SERVICE_ROLE_KEY is required to bypass RLS.',
            code: '42501'
          });
        }
        
        return res.status(500).json({
          success: false,
          message: 'Failed to create booking',
          error: error.message || 'Database error',
          details: error.details || null,
          code: error.code || null
        });
      }

      if (!data) {
        console.error('No data returned from insert operation');
        return res.status(500).json({
          success: false,
          message: 'Failed to create booking - no data returned'
        });
      }

      return res.status(201).json({
        success: true,
        data
      });
    }

    // PUT /api/bookings/:id - Update a booking
    if (req.method === 'PUT') {
      // Extract ID from query or path
      const bookingId = req.query.id || req.url.split('/').pop();
      
      if (!bookingId) {
        return res.status(400).json({
          success: false,
          message: 'Booking ID is required'
        });
      }

      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { name, email, job_type, dates, location, pay_rate, details, status } = body || {};

      // Build update object
      const updateData = {};

      if (name !== undefined) {
        if (!name || !name.trim()) {
          return res.status(400).json({
            success: false,
            message: 'Name cannot be empty'
          });
        }
        updateData.name = name.trim();
      }

      if (email !== undefined) {
        if (!email || !email.trim()) {
          return res.status(400).json({
            success: false,
            message: 'Email cannot be empty'
          });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid email format'
          });
        }
        updateData.email = email.trim();
      }

      if (job_type !== undefined) updateData.job_type = job_type || null;
      if (dates !== undefined) updateData.dates = dates || null;
      if (location !== undefined) updateData.location = location || null;
      if (pay_rate !== undefined) updateData.pay_rate = pay_rate || null;
      if (details !== undefined) updateData.details = details || null;
      if (status !== undefined) {
        if (status && !['pending', 'accepted', 'rejected', 'completed'].includes(status)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid status. Must be one of: pending, accepted, rejected, completed'
          });
        }
        updateData.status = status || 'pending';
      }

      const { data, error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId)
        .eq('user_id', userId) // Ensure user owns this booking
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            success: false,
            message: 'Booking not found'
          });
        }
        console.error('Database error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to update booking',
          error: error.message
        });
      }

      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found or you do not have permission to update it'
        });
      }

      return res.status(200).json({
        success: true,
        data
      });
    }

    // DELETE /api/bookings/:id - Delete a booking
    if (req.method === 'DELETE') {
      // Extract ID from query or path
      const bookingId = req.query.id || req.url.split('/').pop();
      
      if (!bookingId) {
        return res.status(400).json({
          success: false,
          message: 'Booking ID is required'
        });
      }

      const { data, error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)
        .eq('user_id', userId) // Ensure user owns this booking
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to delete booking',
          error: error.message
        });
      }

      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found or you do not have permission to delete it'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Booking deleted successfully'
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
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

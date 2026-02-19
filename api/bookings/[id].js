/**
 * Vercel: GET /api/bookings/:id, PUT /api/bookings/:id, DELETE /api/bookings/:id
 * Single booking - requires auth, user must own the booking.
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const dbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && dbKey ? createClient(supabaseUrl, dbKey) : null;

async function verifyToken(req) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token || !supabase) return { error: 'Unauthorized', user: null };
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return { error: 'Invalid token', user: null };
    return { error: null, user };
  } catch (e) {
    return { error: 'Token verification failed', user: null };
  }
}

function getBookingId(req) {
  return req.query.id || (req.url && req.url.split('/').filter(Boolean).pop()) || null;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!supabase) {
    return res.status(500).json({ success: false, error: 'Supabase not configured' });
  }

  const { error: authError, user } = await verifyToken(req);
  if (authError || !user) {
    return res.status(401).json({ success: false, message: authError || 'Unauthorized' });
  }

  const bookingId = getBookingId(req);
  if (!bookingId) {
    return res.status(400).json({ success: false, message: 'Booking ID is required' });
  }

  const userId = user.id;

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }
      return res.status(200).json({ success: true, data });
    }

    if (req.method === 'PUT') {
      const body = (req.body && (typeof req.body === 'string' ? JSON.parse(req.body) : req.body)) || {};
      const { name, email, job_type, dates, location, pay_rate, details, status } = body;

      const updateData = {};
      if (name !== undefined) {
        if (!name || !String(name).trim()) {
          return res.status(400).json({ success: false, message: 'Name cannot be empty' });
        }
        updateData.name = name.trim();
      }
      if (email !== undefined) {
        if (!email || !String(email).trim()) {
          return res.status(400).json({ success: false, message: 'Email cannot be empty' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(email).trim())) {
          return res.status(400).json({ success: false, message: 'Invalid email format' });
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
          return res.status(400).json({ success: false, message: 'Invalid status' });
        }
        updateData.status = status || 'pending';
      }

      const { data, error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        throw error;
      }
      if (!data) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }
      return res.status(200).json({ success: true, data });
    }

    if (req.method === 'DELETE') {
      const { data, error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found or you do not have permission to delete it'
        });
      }
      return res.status(200).json({ success: true, message: 'Booking deleted successfully' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('Booking [id] error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal server error'
    });
  }
};

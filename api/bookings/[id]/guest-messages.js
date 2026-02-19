/**
 * Vercel: GET/POST /api/bookings/:id/guest-messages
 * Client chat - no auth, validate by email
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const dbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && dbKey ? createClient(supabaseUrl, dbKey) : null;

function getBookingId(req) {
  if (req.query && req.query.id) return req.query.id;
  const url = req.url || '';
  const match = url.match(/\/api\/bookings\/([^/?]+)\/guest-messages/);
  return match ? match[1] : null;
}

function normalizeEmail(s) {
  return (s || '').trim().toLowerCase();
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!supabase) {
    return res.status(500).json({ success: false, error: 'Supabase not configured' });
  }

  const bookingId = getBookingId(req);
  if (!bookingId) {
    return res.status(400).json({ success: false, message: 'Booking ID is required' });
  }

  try {
    const email = normalizeEmail(req.method === 'GET' ? req.query.email : (req.body && (typeof req.body === 'string' ? JSON.parse(req.body) : req.body)?.email));
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, email')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (normalizeEmail(booking.email) !== email) {
      return res.status(403).json({ success: false, message: 'Email does not match this booking' });
    }

    if (req.method === 'GET') {
      const { data: messages, error } = await supabase
        .from('booking_messages')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return res.status(200).json({ success: true, data: messages || [] });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const messageBody = body.body;
      if (!messageBody || !String(messageBody).trim()) {
        return res.status(400).json({ success: false, message: 'Message body is required' });
      }

      const { data: message, error } = await supabase
        .from('booking_messages')
        .insert({
          booking_id: bookingId,
          sender_type: 'client',
          sender_id: null,
          body: String(messageBody).trim()
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ success: true, data: message });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('Guest messages error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error'
    });
  }
};

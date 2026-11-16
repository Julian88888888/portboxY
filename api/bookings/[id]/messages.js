/**
 * Vercel Serverless: GET/POST /api/bookings/:id/messages
 * Booking chat messages + mark-read (merged; Hobby plan function limit)
 *
 * POST { mark_read: true } → mark chat as read
 * POST { body: "..." } → send message
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
  if (req.query && req.query.id) return req.query.id;
  const url = req.url || '';
  const match = url.match(/\/api\/bookings\/([^/?]+)\/messages/);
  return match ? match[1] : null;
}

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

async function upsertRead(bookingId, readerType, readerKey) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('booking_message_reads')
    .upsert(
      {
        booking_id: bookingId,
        reader_type: readerType,
        reader_key: readerKey,
        last_read_at: now
      },
      { onConflict: 'booking_id,reader_type,reader_key' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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

  try {
    if (req.method === 'GET') {
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('id')
        .eq('id', bookingId)
        .eq('user_id', user.id)
        .single();

      if (bookingError || !booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      const { data: messages, error } = await supabase
        .from('booking_messages')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return res.status(200).json({ success: true, data: messages || [] });
    }

    if (req.method === 'POST') {
      const body = parseBody(req);

      // Mark as read (model owner or authenticated client on this booking)
      if (body.mark_read === true || body.mark_read === 'true' || body.action === 'mark_read') {
        const { data: booking, error: bookingError } = await supabase
          .from('bookings')
          .select('id, user_id, email')
          .eq('id', bookingId)
          .single();

        if (bookingError || !booking) {
          return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        const userEmail = (user.email || '').trim().toLowerCase();
        let readerType = null;
        let readerKey = null;

        if (booking.user_id === user.id) {
          readerType = 'model';
          readerKey = user.id;
        } else if (userEmail && (booking.email || '').trim().toLowerCase() === userEmail) {
          readerType = 'client';
          readerKey = userEmail;
        } else {
          return res.status(403).json({ success: false, message: 'Not allowed to mark this chat as read' });
        }

        const data = await upsertRead(bookingId, readerType, readerKey);
        return res.status(200).json({ success: true, data });
      }

      // Send message (model owner only)
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('id')
        .eq('id', bookingId)
        .eq('user_id', user.id)
        .single();

      if (bookingError || !booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      const messageBody = body.body;
      if (!messageBody || !String(messageBody).trim()) {
        return res.status(400).json({ success: false, message: 'Message body is required' });
      }

      const { data: message, error } = await supabase
        .from('booking_messages')
        .insert({
          booking_id: bookingId,
          sender_type: 'model',
          sender_id: user.id,
          body: String(messageBody).trim()
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ success: true, data: message });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('Booking messages error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error'
    });
  }
};

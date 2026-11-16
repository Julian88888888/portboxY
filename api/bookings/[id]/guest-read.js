/**
 * Vercel: POST /api/bookings/:id/guest-read
 * Guest mark booking chat as read (email required)
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const dbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && dbKey ? createClient(supabaseUrl, dbKey) : null;

function getBookingId(req) {
  if (req.query && req.query.id) return req.query.id;
  const url = req.url || '';
  const match = url.match(/\/api\/bookings\/([^/?]+)\/guest-read/);
  return match ? match[1] : null;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  if (!supabase) return res.status(500).json({ success: false, error: 'Supabase not configured' });

  const bookingId = getBookingId(req);
  if (!bookingId) {
    return res.status(400).json({ success: false, message: 'Booking ID is required' });
  }

  try {
    const body = (req.body && (typeof req.body === 'string' ? JSON.parse(req.body) : req.body)) || {};
    const email = (body.email || '').trim().toLowerCase();
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
    if ((booking.email || '').trim().toLowerCase() !== email) {
      return res.status(403).json({ success: false, message: 'Email does not match this booking' });
    }

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('booking_message_reads')
      .upsert(
        {
          booking_id: bookingId,
          reader_type: 'client',
          reader_key: email,
          last_read_at: now
        },
        { onConflict: 'booking_id,reader_type,reader_key' }
      )
      .select()
      .single();

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Guest mark booking read error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal server error'
    });
  }
};

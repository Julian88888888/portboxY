/**
 * Vercel: GET /api/bookings/unread-summary
 * Unread chat counts for logged-in user (incoming + outgoing)
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

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });
  if (!supabase) return res.status(500).json({ success: false, error: 'Supabase not configured' });

  const { error: authError, user } = await verifyToken(req);
  if (authError || !user) {
    return res.status(401).json({ success: false, message: authError || 'Unauthorized' });
  }

  try {
    const userId = user.id;
    const userEmail = (user.email || '').trim().toLowerCase();

    const { data: incoming, error: incomingError } = await supabase
      .from('bookings')
      .select('id')
      .eq('user_id', userId);
    if (incomingError) throw incomingError;

    let outgoing = [];
    if (userEmail) {
      const { data: allBookings, error: allError } = await supabase
        .from('bookings')
        .select('id, email');
      if (allError) throw allError;
      outgoing = (allBookings || []).filter(
        (b) => (b.email || '').trim().toLowerCase() === userEmail
      );
    }

    const incomingIds = (incoming || []).map((b) => b.id);
    const outgoingIds = outgoing.map((b) => b.id);
    const allIds = [...new Set([...incomingIds, ...outgoingIds])];

    if (allIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: { total: 0, incoming_total: 0, outgoing_total: 0, by_booking: {} }
      });
    }

    const { data: messages, error: msgError } = await supabase
      .from('booking_messages')
      .select('booking_id, sender_type, created_at')
      .in('booking_id', allIds);
    if (msgError) throw msgError;

    const readerKeys = [userId];
    if (userEmail) readerKeys.push(userEmail);

    const { data: reads, error: readsError } = await supabase
      .from('booking_message_reads')
      .select('booking_id, reader_type, reader_key, last_read_at')
      .in('booking_id', allIds)
      .in('reader_key', readerKeys);
    if (readsError) throw readsError;

    const readMap = {};
    for (const r of reads || []) {
      if (r.reader_type === 'model' && r.reader_key === userId) {
        readMap[`${r.booking_id}:model`] = r.last_read_at;
      }
      if (r.reader_type === 'client' && userEmail && r.reader_key === userEmail) {
        readMap[`${r.booking_id}:client`] = r.last_read_at;
      }
    }

    const incomingSet = new Set(incomingIds);
    const outgoingSet = new Set(outgoingIds);
    const by_booking = {};
    let incoming_total = 0;
    let outgoing_total = 0;

    for (const msg of messages || []) {
      if (incomingSet.has(msg.booking_id) && msg.sender_type === 'client') {
        const lastRead = readMap[`${msg.booking_id}:model`];
        if (!lastRead || new Date(msg.created_at) > new Date(lastRead)) {
          by_booking[msg.booking_id] = (by_booking[msg.booking_id] || 0) + 1;
          incoming_total += 1;
        }
      }
      if (outgoingSet.has(msg.booking_id) && msg.sender_type === 'model') {
        const lastRead = readMap[`${msg.booking_id}:client`];
        if (!lastRead || new Date(msg.created_at) > new Date(lastRead)) {
          by_booking[msg.booking_id] = (by_booking[msg.booking_id] || 0) + 1;
          outgoing_total += 1;
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        total: incoming_total + outgoing_total,
        incoming_total,
        outgoing_total,
        by_booking
      }
    });
  } catch (err) {
    console.error('Unread summary error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal server error'
    });
  }
};

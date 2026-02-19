/**
 * Vercel: GET /api/bookings/as-client
 * Bookings where current user is the client (email match)
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

  const userEmail = (user.email || '').trim().toLowerCase();
  if (!userEmail) return res.status(200).json({ success: true, data: [] });

  try {
    const { data: bookings, error: bookError } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (bookError) throw bookError;

    const filtered = (bookings || []).filter(
      (b) => (b.email || '').trim().toLowerCase() === userEmail
    );
    if (filtered.length === 0) return res.status(200).json({ success: true, data: [] });

    const modelIds = [...new Set(filtered.map((b) => b.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, username')
      .in('id', modelIds);

    const profileMap = (profiles || []).reduce((acc, p) => { acc[p.id] = p; return acc; }, {});
    const data = filtered.map((b) => ({
      ...b,
      model_display_name: profileMap[b.user_id]?.display_name || null,
      model_username: profileMap[b.user_id]?.username || null
    }));

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Bookings as-client error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
};

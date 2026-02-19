/**
 * Vercel: POST /api/bookings/guest
 * Create a booking as guest (no auth) - for public model page "Book me"
 * Body: { model_id?, username?, name, email, job_type?, dates?, location?, pay_rate?, details?, status? }
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const dbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && dbKey ? createClient(supabaseUrl, dbKey) : null;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  if (!supabase) {
    return res.status(500).json({ success: false, message: 'Supabase not configured' });
  }

  try {
    const body = (req.body && (typeof req.body === 'string' ? JSON.parse(req.body) : req.body)) || {};
    const { model_id, username, name, email, job_type, dates, location, pay_rate, details, status } = body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!email || !String(email).trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email).trim())) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    let modelUserId = model_id || null;
    if (!modelUserId && username && String(username).trim()) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', String(username).trim().toLowerCase())
        .maybeSingle();
      if (profileError || !profile) {
        return res.status(404).json({ success: false, message: 'Model not found' });
      }
      modelUserId = profile.id;
    }
    if (!modelUserId) {
      return res.status(400).json({ success: false, message: 'model_id or username is required' });
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        user_id: modelUserId,
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        job_type: job_type || null,
        dates: dates || null,
        location: location || null,
        pay_rate: pay_rate || null,
        details: details || null,
        status: status || 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (err) {
    console.error('Guest booking error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to create booking'
    });
  }
};

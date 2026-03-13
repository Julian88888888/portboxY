/**
 * Vercel Serverless: PUT /api/custom-links/:id, DELETE /api/custom-links/:id
 * Handles update and delete for a single custom link.
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const dbKey = serviceRoleKey || anonKey;
const supabase = supabaseUrl && dbKey ? createClient(supabaseUrl, dbKey) : null;

async function verifyToken(req) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token || !supabase) {
    return { error: 'Access token required', user: null };
  }
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return { error: 'Invalid or expired token', user: null };
    }
    return { error: null, user };
  } catch (e) {
    return { error: 'Token verification failed', user: null };
  }
}

function getLinkId(req) {
  return req.query.id || (req.url && req.url.split('/').filter(Boolean).pop()) || null;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!supabase) {
    return res.status(500).json({
      success: false,
      message: 'Supabase not configured'
    });
  }

  const { error: authError, user } = await verifyToken(req);
  if (authError || !user) {
    return res.status(401).json({
      success: false,
      message: authError || 'Unauthorized'
    });
  }

  const linkId = getLinkId(req);
  if (!linkId) {
    return res.status(400).json({
      success: false,
      message: 'Link ID is required'
    });
  }

  const userId = user.id;

  try {
    if (req.method === 'PUT') {
      let body;
      try {
        body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      } catch (e) {
        return res.status(400).json({ success: false, message: 'Invalid JSON in request body' });
      }
      const { title, url, icon_url, enabled, display_order } = body;

      const updateData = { updated_at: new Date().toISOString() };

      if (title !== undefined) {
        if (!title || !String(title).trim()) {
          return res.status(400).json({ success: false, message: 'Title cannot be empty' });
        }
        updateData.title = String(title).trim();
      }
      if (url !== undefined) {
        if (!url || !String(url).trim()) {
          return res.status(400).json({ success: false, message: 'URL cannot be empty' });
        }
        try {
          new URL(url);
        } catch {
          return res.status(400).json({ success: false, message: 'Invalid URL format' });
        }
        updateData.url = String(url).trim();
      }
      if (icon_url !== undefined) updateData.icon_url = icon_url || null;
      if (enabled !== undefined) updateData.enabled = Boolean(enabled);
      if (display_order !== undefined) updateData.display_order = parseInt(display_order, 10);

      const { data, error } = await supabase
        .from('custom_links')
        .update(updateData)
        .eq('id', linkId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ success: false, message: 'Custom link not found' });
        }
        console.error('Database error:', error);
        return res.status(500).json({ success: false, message: 'Failed to update custom link', error: error.message });
      }
      if (!data) {
        return res.status(404).json({ success: false, message: 'Custom link not found or no permission' });
      }
      return res.status(200).json({ success: true, data });
    }

    if (req.method === 'DELETE') {
      const { data, error } = await supabase
        .from('custom_links')
        .delete()
        .eq('id', linkId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete custom link', error: error.message });
      }
      if (!data) {
        return res.status(404).json({ success: false, message: 'Custom link not found or no permission' });
      }
      return res.status(200).json({ success: true, message: 'Custom link deleted successfully' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
};

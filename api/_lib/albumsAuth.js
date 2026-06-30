const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const dbKey = serviceRoleKey || anonKey;

const supabase = supabaseUrl && dbKey ? createClient(supabaseUrl, dbKey) : null;

async function verifyToken(req) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return { error: 'Access token required', user: null };
  }

  if (!supabase) {
    return { error: 'Supabase not configured', user: null };
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return { error: 'Invalid or expired token', user: null };
    }
    return { error: null, user };
  } catch (error) {
    return { error: 'Token verification failed', user: null };
  }
}

async function getAlbumForUser(albumId, userId) {
  const { data: album, error } = await supabase
    .from('albums')
    .select('id, user_id, cover_image_id, title, description, created_at')
    .eq('id', albumId)
    .single();

  if (error || !album) {
    return { error: 'Album not found', album: null, status: 404 };
  }

  if (album.user_id !== userId) {
    return { error: 'Forbidden', album: null, status: 403 };
  }

  return { error: null, album, status: 200 };
}

module.exports = {
  supabase,
  verifyToken,
  getAlbumForUser,
};

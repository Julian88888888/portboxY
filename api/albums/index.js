/**
 * Vercel Serverless Function for Albums API
 * Handles GET /api/albums and POST /api/albums
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
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
      return { error: 'Invalid or expired token', user: null };
    }
    return { error: null, user };
  } catch (error) {
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }

  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (!supabase) {
    return res.status(500).json({
      success: false,
      error: 'Supabase not configured. Please set REACT_APP_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or REACT_APP_SUPABASE_ANON_KEY) environment variables.'
    });
  }

  try {
    // GET /api/albums - Get all albums with cover images
    if (req.method === 'GET') {
      // Get all albums
      const { data: albums, error } = await supabase
        .from('albums')
        .select('id, title, description, cover_image_id, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({
          success: false,
          error: error.message || 'Failed to fetch albums'
        });
      }

      // Get cover image URLs for albums that have covers
      const coverImageIds = albums
        .filter(album => album.cover_image_id)
        .map(album => album.cover_image_id);

      let coverImagesMap = {};
      if (coverImageIds.length > 0) {
        const { data: coverImages, error: imagesError } = await supabase
          .from('images')
          .select('id, url')
          .in('id', coverImageIds);

        if (!imagesError && coverImages) {
          coverImagesMap = coverImages.reduce((acc, img) => {
            acc[img.id] = img.url;
            return acc;
          }, {});
        }
      }

      // Format response with cover image URLs
      const formattedAlbums = albums.map(album => ({
        id: album.id,
        title: album.title,
        description: album.description,
        cover_image_id: album.cover_image_id,
        cover_image_url: album.cover_image_id ? coverImagesMap[album.cover_image_id] || null : null,
        created_at: album.created_at
      }));

      return res.status(200).json({
        success: true,
        data: formattedAlbums
      });
    }

    // POST /api/albums - Create a new album
    if (req.method === 'POST') {
      // Verify authentication
      const { error: authError, user } = await verifyToken(req);
      if (authError || !user) {
        return res.status(401).json({
          success: false,
          error: authError || 'Unauthorized'
        });
      }

      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { title, description } = body || {};

      // Validate input
      if (!title || title.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Title is required'
        });
      }

      const { data, error } = await supabase
        .from('albums')
        .insert({
          title: title.trim(),
          description: description ? description.trim() : null,
          cover_image_id: null
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({
          success: false,
          error: error.message || 'Failed to create album',
          details: error.details || null
        });
      }

      return res.status(201).json({
        success: true,
        data: {
          id: data.id,
          title: data.title,
          description: data.description,
          cover_image_id: data.cover_image_id,
          cover_image_url: null,
          created_at: data.created_at
        }
      });
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};

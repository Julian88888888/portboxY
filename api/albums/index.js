/**
 * Vercel Serverless Function for Albums API
 * Handles GET /api/albums and POST /api/albums
 */

const { supabase, verifyToken } = require('../_lib/albumsAuth');

const MAX_ALBUMS_PER_USER = 6;
const getMaxAlbumsError = () => `Maximum ${MAX_ALBUMS_PER_USER} albums allowed`;

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
      const { error: authError, user } = await verifyToken(req);
      const filterUserId = req.query.userId || (!authError && user ? user.id : null);

      if (!filterUserId) {
        return res.status(400).json({
          success: false,
          error: 'userId is required'
        });
      }

      let albumsQuery = supabase
        .from('albums')
        .select('id, title, description, cover_image_id, card_size, created_at')
        .order('created_at', { ascending: false });

      if (filterUserId) {
        albumsQuery = albumsQuery.eq('user_id', filterUserId);
      }

      let { data: albums, error } = await albumsQuery;

      if (error && /card_size/i.test(error.message || '')) {
        albumsQuery = supabase
          .from('albums')
          .select('id, title, description, cover_image_id, created_at')
          .order('created_at', { ascending: false });
        if (filterUserId) {
          albumsQuery = albumsQuery.eq('user_id', filterUserId);
        }
        ({ data: albums, error } = await albumsQuery);
        if (!error && albums) {
          albums = albums.map((album) => ({ ...album, card_size: 'M' }));
        }
      }

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
        card_size: album.card_size || 'M',
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

      const { count, error: countError } = await supabase
        .from('albums')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (!countError && count >= MAX_ALBUMS_PER_USER) {
        return res.status(400).json({
          success: false,
          error: getMaxAlbumsError(),
        });
      }

      const { data, error } = await supabase
        .from('albums')
        .insert({
          title: title.trim(),
          description: description ? description.trim() : null,
          cover_image_id: null,
          user_id: user.id,
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

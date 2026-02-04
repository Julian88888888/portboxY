/**
 * Vercel Serverless Function for Album operations by ID
 * Handles GET /api/albums/:id, PUT /api/albums/:id, DELETE /api/albums/:id
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }

  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (!supabase) {
    return res.status(500).json({
      success: false,
      error: 'Supabase not configured. Please set REACT_APP_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or REACT_APP_SUPABASE_ANON_KEY) environment variables.'
    });
  }

  try {
    // Get album ID from URL
    // In Vercel, dynamic route params are in req.query
    const albumId = req.query.id;

    if (!albumId) {
      return res.status(400).json({
        success: false,
        error: 'Album ID is required'
      });
    }

    // DELETE /api/albums/:id - Delete album
    if (req.method === 'DELETE') {
      // Verify authentication
      const { error: authError, user } = await verifyToken(req);
      if (authError || !user) {
        return res.status(401).json({
          success: false,
          error: authError || 'Unauthorized'
        });
      }

      // Check if album exists
      const { data: album, error: albumError } = await supabase
        .from('albums')
        .select('id')
        .eq('id', albumId)
        .single();

      if (albumError || !album) {
        return res.status(404).json({
          success: false,
          error: 'Album not found'
        });
      }

      // Delete album (images will be deleted via CASCADE)
      const { error: deleteError } = await supabase
        .from('albums')
        .delete()
        .eq('id', albumId);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        return res.status(500).json({
          success: false,
          error: deleteError.message || 'Failed to delete album'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Album deleted successfully'
      });
    }

    // GET /api/albums/:id - Get album by ID
    if (req.method === 'GET') {
      const { data: album, error: albumError } = await supabase
        .from('albums')
        .select('id, title, description, cover_image_id, created_at')
        .eq('id', albumId)
        .single();

      if (albumError || !album) {
        return res.status(404).json({
          success: false,
          error: 'Album not found'
        });
      }

      // Get cover image URL if exists
      let coverImageUrl = null;
      if (album.cover_image_id) {
        const { data: coverImage } = await supabase
          .from('images')
          .select('url')
          .eq('id', album.cover_image_id)
          .single();

        if (coverImage) {
          coverImageUrl = coverImage.url;
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          id: album.id,
          title: album.title,
          description: album.description,
          cover_image_id: album.cover_image_id,
          cover_image_url: coverImageUrl,
          created_at: album.created_at
        }
      });
    }

    // PUT /api/albums/:id - Update album
    if (req.method === 'PUT') {
      // Verify authentication
      const { error: authError, user } = await verifyToken(req);
      if (authError || !user) {
        return res.status(401).json({
          success: false,
          error: authError || 'Unauthorized'
        });
      }

      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const updateData = {};

      if (body.title !== undefined) {
        updateData.title = body.title.trim();
      }
      if (body.description !== undefined) {
        updateData.description = body.description ? body.description.trim() : null;
      }
      if (body.cover_image_id !== undefined) {
        updateData.cover_image_id = body.cover_image_id;
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update'
        });
      }

      const { data: updatedAlbum, error: updateError } = await supabase
        .from('albums')
        .update(updateData)
        .eq('id', albumId)
        .select()
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
        return res.status(500).json({
          success: false,
          error: updateError.message || 'Failed to update album'
        });
      }

      // Get cover image URL if exists
      let coverImageUrl = null;
      if (updatedAlbum.cover_image_id) {
        const { data: coverImage } = await supabase
          .from('images')
          .select('url')
          .eq('id', updatedAlbum.cover_image_id)
          .single();

        if (coverImage) {
          coverImageUrl = coverImage.url;
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          id: updatedAlbum.id,
          title: updatedAlbum.title,
          description: updatedAlbum.description,
          cover_image_id: updatedAlbum.cover_image_id,
          cover_image_url: coverImageUrl,
          created_at: updatedAlbum.created_at
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

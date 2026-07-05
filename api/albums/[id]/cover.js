/**
 * Vercel Serverless Function for setting album cover image
 * Handles PUT /api/albums/:id/cover
 */

const { supabase, verifyToken, getAlbumForUser } = require('../../_lib/albumsAuth');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (!supabase) {
    return res.status(500).json({
      success: false,
      error: 'Supabase not configured. Please set REACT_APP_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or REACT_APP_SUPABASE_ANON_KEY) environment variables.'
    });
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const albumId = req.query.id;

    if (!albumId) {
      return res.status(400).json({
        success: false,
        error: 'Album ID is required'
      });
    }

    const { error: authError, user } = await verifyToken(req);
    if (authError || !user) {
      return res.status(401).json({
        success: false,
        error: authError || 'Unauthorized'
      });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const imageId = body?.image_id;

    if (!imageId) {
      return res.status(400).json({
        success: false,
        error: 'image_id is required'
      });
    }

    const { error: ownershipError, status: ownershipStatus } = await getAlbumForUser(albumId, user.id);
    if (ownershipError) {
      return res.status(ownershipStatus).json({
        success: false,
        error: ownershipError
      });
    }

    const { data: image, error: imageError } = await supabase
      .from('images')
      .select('id, album_id')
      .eq('id', imageId)
      .eq('album_id', albumId)
      .single();

    if (imageError || !image) {
      return res.status(404).json({
        success: false,
        error: 'Image not found or does not belong to this album'
      });
    }

    const { data: updatedAlbum, error: updateError } = await supabase
      .from('albums')
      .update({ cover_image_id: imageId })
      .eq('id', albumId)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return res.status(500).json({
        success: false,
        error: updateError.message || 'Failed to set cover image'
      });
    }

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
      },
      message: 'Cover image updated successfully'
    });
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};

/**
 * Vercel Serverless Function
 * DELETE /api/images/:id — delete an album image
 */

const { supabase, verifyToken, getAlbumForUser } = require('../_lib/albumsAuth');

function storagePathFromUrl(url) {
  const marker = '/profile-photos/';
  const raw = String(url || '');
  const i = raw.indexOf(marker);
  if (i === -1) return null;
  return decodeURIComponent(raw.slice(i + marker.length).split('?')[0]);
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (!supabase) {
    return res.status(500).json({
      success: false,
      error: 'Supabase not configured',
    });
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { error: authError, user } = await verifyToken(req);
    if (authError || !user) {
      return res.status(401).json({
        success: false,
        error: authError || 'Unauthorized',
      });
    }

    const imageId = req.query.id;
    if (!imageId) {
      return res.status(400).json({
        success: false,
        error: 'Image ID is required',
      });
    }

    const { data: image, error: imageError } = await supabase
      .from('images')
      .select('id, album_id, url')
      .eq('id', imageId)
      .single();

    if (imageError || !image) {
      return res.status(404).json({
        success: false,
        error: 'Image not found',
      });
    }

    const { error: ownershipError, album, status: ownershipStatus } = await getAlbumForUser(
      image.album_id,
      user.id
    );
    if (ownershipError) {
      return res.status(ownershipStatus).json({
        success: false,
        error: ownershipError,
      });
    }

    const { error: deleteError } = await supabase.from('images').delete().eq('id', imageId);

    if (deleteError) {
      console.error('Delete image error:', deleteError);
      return res.status(500).json({
        success: false,
        error: deleteError.message || 'Failed to delete image',
      });
    }

    if (album?.cover_image_id === imageId) {
      const { data: nextImages } = await supabase
        .from('images')
        .select('id')
        .eq('album_id', image.album_id)
        .order('created_at', { ascending: false })
        .limit(1);

      const nextImage = Array.isArray(nextImages) ? nextImages[0] : nextImages;

      await supabase
        .from('albums')
        .update({ cover_image_id: nextImage?.id || null })
        .eq('id', image.album_id);
    }

    const storagePath = storagePathFromUrl(image.url);
    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from('profile-photos')
        .remove([storagePath]);
      if (storageError) {
        console.warn('Could not remove image from storage:', storageError.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
};
